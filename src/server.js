import http from "http";
import express from "express";
import WebSocket from "ws";  //websockket :브라우저와 서버사이의 연결
import { disconnect } from "process";

const app = express();

app.set("view engine","pug");                             // pug를 view engine으로 설정
app.set("views",__dirname + "/views");                    // express template의 위치 지정

app.use("/public",express.static(__dirname + "/public")); // public url을 생성하여 유저에게 파일 공유 (정적 파일 제공)

app.get("/",(req, res) => res.render("home"));            // home.pug를 render 해주는 route handler를 만듦
app.get("/*",(req, res)=> res.redirect("/"));             // 유저가 어떤 url를 쓰든 home으로 가게 하기 위한 코드

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const sockets = [];  // fack DB - 연결된 소켓의 array 만들기 (메세지를 다른 소켓에 전달해 주기 위해..)

wss.on("connection",(socket) => {   // server의 socket (브라우저와 연결을 위한 소켓)
                                    // socket이 frontend와 real time으로 소통할 수 있음
    sockets.push(socket);
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from the Browser"));                         // 브라우저가 종료되면
    socket.on("message", (message) => {
        sockets.forEach((aSocket) => aSocket.send(message.toString('utf8')));
    });
    
});  // frontend랑 backend랑 connect 될 때마다 작동

server.listen(3000,handleListen);