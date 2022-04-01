const meassageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

const socket = new  WebSocket(`ws://${window.location.host}`); // ws://localhost:3000로 해도 되지만 모바일은 localhost를 모르기 때문에 브라우저가 알 수 있는 js 명령어로 url을 줌
                                                                // front의 socket (서버와 연결을 위한 소켓)
socket.addEventListener("open",() => {  // 소켓연결되면 실행
    console.log("Connected to Server");
});
socket.addEventListener("message", (message) => {   // server에서 "send"한 메세지
    console.log("New message: ",message.data);
});
socket.addEventListener("close", () => {      // 서버에서 통신이 끊기면
    console.log("Disconnected from Server");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(input.value);
    input.value = "";
}
messageForm.addEventListener("submit", handleSubmit);