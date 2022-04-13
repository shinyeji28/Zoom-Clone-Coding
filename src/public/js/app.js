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
let myDataChannel;

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
async function handleCameraChange(){
    await getMedia(camerasSelect.value);                // 내 브라우저 카메라를 바꾸고
    const videoTrack = myStream.getVideoTracks()[0];    // peer보내진 내 비디오 데이터를 컨트롤
    const videoSender =  myPeerConnection
        .getSenders()
        .find((sender) => sender.track.kind === "video");     // sender : peer로 보내진 media stream track을 컨트롤
    videoSender.replaceTrack(videoTrack);
}

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcone Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();                      
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code 
                    // peer A
socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");  // (채널이름) // myDataChannel 생성해서 정의
    myDataChannel.addEventListener("message", (event) => console.log(event.data));  //myDataChannel.send();의 이벤트
    console.log("made data channel");

    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);   // 다른 브라우저 참여할 수 있도록 초대장을 만드는 것(내가 누구고 어디있고.. 등등) - 실시간 세션 설명
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);     // 소켓 연결된 브라우저에게 초대장을 보냄
})
                    // peer B
socket.on("offer", async(offer) => {

    myPeerConnection.addEventListener("datachannel", (event) => {  
        myDataChannel = event.channel;                              // myDataChannel 받아서 정의
        myDataChannel.addEventListener("message", (event) => console.log(event.data));
    });

    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer); // 받은 offer의 description을 세팅
    const answer = await myPeerConnection.createAnswer();

    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName); 
    console.log("sent the answer");
})

socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});

// RCT Code

function makeConnection(){  // addStream()
    myPeerConnection = new RTCPeerConnection();  // peer-to-peer 연결 (signaling process)
    myPeerConnection.addEventListener("icecandidate", handleIce);  
    myPeerConnection.addEventListener("addstream", handleAddStream);   // add peers stream
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));  // 카메라, 마이크 데이터 stream을 myPeerConnection안으로 집어 넣음
}

function handleIce(data){
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName); // 자기 브라우저의 모든 소통방식을 다른 브라우저에게 넘겨줘야 함
}

function handleAddStream(data){ 
    const peersStream = document.getElementById("peerStream");
    peersStream.srcObject = data.stream;
}