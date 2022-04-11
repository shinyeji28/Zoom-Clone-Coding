const socket = io();  // io : 자동적으로 backend와  socket.io를 연결해주는 function, 알아서 socket.io를 실행하고 있는 서버를 찾을 것임

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;  // stream : video와 audio가 결합된 것
let muted = false;
let cameraOff = false;
async function getMedia(){
    try{
        myStream = await navigator.mediaDevices.getUserMedia({    //navigator.mediaDevices.getUserMedia: user media의 string을 줌
            audio: true,
            video: true
        });
        myFace.srcObject =  myStream;
    } catch (e) {
        console.log(`video error - ${e}`);
    }
}
getMedia();

function handleMuteClick(){
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    } else{
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick(){
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else{
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);