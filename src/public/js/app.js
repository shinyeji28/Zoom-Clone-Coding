const socket = io();  // io : 자동적으로 backend와  socket.io를 연결해주는 function, 알아서 socket.io를 실행하고 있는 서버를 찾을 것임

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message",input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value="";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname",input.value);
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`
    const msgFrom = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgFrom.addEventListener("submit",handleMessageSubmit);
    nameForm.addEventListener("submit",handleNicknameSubmit);

}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value , showRoom );  // argument 수는 제한이 없음.  단, function을 보낼 땐 마지막에!! (서버에서 function을 호출하면 frontend에서 실행되는 function)
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome",(user) => {
    addMessage(`${user} arrived!`);
});
socket.on("bye",(left)=> {
    addMessage(`${left} left ㅠㅠ`);
});
socket.on("new_message",addMessage);
