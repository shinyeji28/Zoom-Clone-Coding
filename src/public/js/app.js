const socket = io();  // io : 자동적으로 backend와  socket.io를 연결해주는 function, 알아서 socket.io를 실행하고 있는 서버를 찾을 것임

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg){
    console.log(`The backend says: `, msg);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", { payload: input.value }, backendDone );  // argument 수는 제한이 없음.  단, function을 보낼 땐 마지막에!! (서버에서 function을 호출하면 frontend에서 실행되는 function)
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);