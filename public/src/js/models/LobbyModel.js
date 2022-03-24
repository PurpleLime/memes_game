import BaseModel from "./BaseModel.js";
import {wsServer} from "../network.js";
import Router from "../Router.js";
import MainPageModel from "./MainPageModel.js";

class LobbyModel extends BaseModel {
    constructor() {
        super();
        this.socket = null;
        this.userNickname = '';
        this.playersAmount = 0;
        this.slots = [];
        this.lobbyCode = '';
        this.userId = '';

    }

    update({ userNickname, lobbyCode }) {
        this.lobbyCode = lobbyCode;
        return this.connectWebSocket().then(() => {
            this.socket.send(JSON.stringify({
                header: 'enterLobby',
                userNickname,
                lobbyCode,
            }));
        });
    }

    leave() {
        this.socket.send(JSON.stringify({
            header: 'leaveLobby',
        }));
    }

    connectWebSocket() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(wsServer);
            this.socket.onmessage = this.lobbyHandleResponse.bind(this);
            this.socket.onopen = () => resolve();
        });
    }

    lobbyHandleResponse(event) {
        let message = JSON.parse(event.data);
        console.log(message);
        switch (message.header) {
            case 'enterLobby/ok':
                this.userId = message.userId;
                let data = message.data;
                this.playersAmount = data.playersAmount;
                this.slots = data.slots.slice();
                this.emit('updateView');
                break;
            case 'enterLobby/error':
                console.log(`Ошибка: ${message.errorMessage}`);
                break;
            default:
                break;
        }
    }

}

export default new LobbyModel();