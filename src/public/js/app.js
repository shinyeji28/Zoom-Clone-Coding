const meassageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

const socket = new  WebSocket(`ws://${window.location.host}`); // ws://localhost:3000로 해도 되지만 모바일은 localhost를 모르기 때문에 브라우저가 알 수 있는 js 명령어로 url을 줌
                                                                // front의 socket (서버와 연결을 위한 소켓)
function makeMessage(type,payload){  // backend로 보낼 때 json object를 String 형태로 만들어 보내고 backend에서 파싱해야 함
    const msg = { type, payload };
    return JSON.stringify(msg);
}

socket.addEventListener("open",() => {  // 소켓연결되면 실행
    console.log("Connected to Server");
});
socket.addEventListener("message", (message) => {   // server에서 "send"한 메세지
    const li = document.createElement("li");
    li.innerText = message.data;
    meassageList.append(li);
});
socket.addEventListener("close", () => {      // 서버에서 통신이 끊기면
    console.log("Disconnected from Server");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    meassageList.append(li);
    input.value = "";
}
function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);