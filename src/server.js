import http from "http";
import express from "express";
import WebSocket from "ws";  //websockket :브라우저와 서버사이의 연결

const app = express();

app.set("view engine","pug");                             // pug를 view engine으로 설정
app.set("views",__dirname + "/views");                    // express template의 위치 지정

app.use("/public",express.static(__dirname + "/public")); // public url을 생성하여 유저에게 파일 공유 (정적 파일 제공)

app.get("/",(req, res) => res.render("home"));            // home.pug를 render 해주는 route handler를 만듦
app.get("/*",(req, res)=> res.redirect("/"));             // 유저가 어떤 url를 쓰든 home으로 가게 하기 위한 코드

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

function handleConnection(socket){      // server의 socket (브라우저와 연결을 위한 소켓)
    console.log(socket);  // socket이 frontend와 real time으로 소통할 수 있음s
}
wss.on("connection",handleConnection);  // frontend랑 backend랑 connect 될 때마다 작동

server.listen(3000,handleListen);