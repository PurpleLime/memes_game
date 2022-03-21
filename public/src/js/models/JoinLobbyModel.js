import BaseModel from "./BaseModel.js";
import {wsServer} from "../network.js";
import MainPageModel from "./MainPageModel.js";

class JoinLobbyModel extends BaseModel {
    constructor() {
        super();
        this.socket = null;
    }

    update() {
        this.connectWebSocket();
    }

    leave() {
        this.socket.close(1000, "переход на другую страницу");
    }

    connectWebSocket() {
        this.socket = new WebSocket(wsServer);

        this.socket.onmessage = function (event) {
            console.log(JSON.parse(event.data));
        }
    }

    joinLobby({lobbyCode, userNickname}) {
        this.socket.send(JSON.stringify({
            messageType: 'connectLobby',
            userNickname: userNickname,
            lobbyCode: lobbyCode,
            age: 77,
        }));
    }

}

export default new JoinLobbyModel();