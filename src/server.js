import http from "http";
import SocketIO from "socket.io";
import express from "express";
import { disconnect } from "process";

const app = express();

app.set("view engine","pug");                             // pug를 view engine으로 설정
app.set("views",__dirname + "/views");                    // express template의 위치 지정

app.use("/public",express.static(__dirname + "/public")); // public url을 생성하여 유저에게 파일 공유 (정적 파일 제공)

app.get("/",(req, res) => res.render("home"));            // home.pug를 render 해주는 route handler를 만듦
app.get("/*",(req, res)=> res.redirect("/"));             // 유저가 어떤 url를 쓰든 home으로 가게 하기 위한 코드

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms(){         // public room만 반환하는 함수
  const {
    sockets: {
      adapter: {sids, rooms}
    }
  } = wsServer;  // sids : socket ids , rooms : room names (socket 내부 구조 사용)
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined){
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName){
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection",(socket) => {
  socket["nickname"]="Anon";
  socket.onAny((event) => {                 // 어떤 이벤트이든 콘솔을 찍을 수 있음
      console.log(`Socket Event:${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);      // join the room
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));  // 본인을 제외한 방에 있는 모든 사람에게 ~
    wsServer.emit("room_change", publicRooms());            // 서버의 모든 브라우저에게 전달
  });
  socket.on("disconnecting",() => {
      socket.rooms.forEach((room) => {
        socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
      })
  });
  socket.on("disconnect",() => {
    wsServer.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
    done();
  })
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// const wss = new WebSocket.Server({server});

// const sockets = [];  // fack DB - 연결된 소켓의 array 만들기 (메세지를 다른 소켓에 전달해 주기 위해..)

// wss.on("connection",(socket) => {   // server의 socket (브라우저와 연결을 위한 소켓)
//                                     // socket이 frontend와 real time으로 소통할 수 있음
//     sockets.push(socket);
//     socket["nickname"] = "Anon";
//     console.log("Connected to Browser");
//     socket.on("close", () => console.log("Disconnected from the Browser"));                         // 브라우저가 종료되면
//     socket.on("message", (msg) => {
//     const message = JSON.parse(msg);// frontend로 부터 받은 string을 javaScript object로 변경
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload.toString('utf8')}`));
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;  // socket은 객체임으로 이와같은 코딩이 가능 => socket안에 정보를 저장 할 수 있음
//                 break;
//         }
//     });
    
// });  // frontend랑 backend랑 connect 될 때마다 작동

httpServer.listen(3000,handleListen);