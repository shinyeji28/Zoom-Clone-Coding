const socket = new  WebSocket(`ws://${window.location.host}`); // ws://localhost:3000로 해도 되지만 모바일은 localhost를 모르기 때문에 브라우저가 알 수 있는 js 명령어로 url을 줌
                                                                // front의 socket (서버와 연결을 위한 소켓)