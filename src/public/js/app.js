const socket = io();  // io : 자동적으로 backend와  socket.io를 연결해주는 function, 알아서 socket.io를 실행하고 있는 서버를 찾을 것임

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;  // stream : video와 audio가 결합된 것
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((devices) => devices.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label == camera.label){
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    }catch (e){
        console.log(e);
    }
    
}

async function getMedia(deviceId){
    const initialConstrains = {         // 초기 deviceId가 없을 경우 사용할 constrains
        audio: true, 
        video: { facingMode: "user" }  // 전면 카메라
    }
    const cameraConstaints = {
        audio: true,
        video: { deviceId: {exact: deviceId}}
    };
    try{
        myStream = await navigator.mediaDevices.getUserMedia(    //navigator.mediaDevices.getUserMedia: user media의 string을 줌
            deviceId? cameraConstaints : initialConstrains
        );
        myFace.srcObject =  myStream;
        if(!deviceId){              // 디바이스 리스트가 계속 생겨나는 것을 방지하기 위해 ..
            await getCameras();     
        }
    } catch (e) {
        console.log(`video error - ${e}`);
    }
}

function handleMuteClick(){
    myStream.getAudioTracks().forEach(track => track.enabled =! track.enabled);
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    } else{
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick(){
    myStream.getVideoTracks().forEach(track => track.enabled =! track.enabled);
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else{
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}
function handleCameraChange(){
    getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcone Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    socket.emit("join_room", input.value, startMedia);
    roomName = input.value;
    input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code 
                    // peer A
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);   // 다른 브라우저 참여할 수 있도록 초대장을 만드는 것(내가 누구고 어디있고.. 등등) - 실시간 세션 설명
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);     // 소켓 연결된 브라우저에게 초대장을 보냄
})
                    // peer B
socket.on("offer", offer => {
    console.log(offer);
})

// RCT Code

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();  // peer-to-peer 연결 (signaling process)
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));  // 카메라, 마이크 데이터 stream을 myPeerConnection안으로 집어 넣음

}