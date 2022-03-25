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
        this.isHost = false;

    }

    init({ userNickname, lobbyCode }) {
        this.lobbyCode = lobbyCode;
        return this.connectWebSocket().then(() => {
            this.socket.send(JSON.stringify({
                header: 'enterLobby',
                userNickname,
                lobbyCode,
            }));
        });
    }

    update({ userNickname, lobbyCode }) {
        // this.lobbyCode = lobbyCode;
        // return this.connectWebSocket().then(() => {
        //     this.socket.send(JSON.stringify({
        //         header: 'enterLobby',
        //         userNickname,
        //         lobbyCode,
        //     }));
        // });
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
        let data = null;
        switch (message.header) {
            case 'enterLobby/ok':
                this.userId = message.userId;
                this.isHost = message.isHost;
                data = message.data;
                this.playersAmount = data.playersAmount;
                this.slots = data.slots.slice();
                this.emit('initView');
                break;
            case 'enterLobby/error':
                console.log(`Ошибка: ${message.errorMessage}`);
                break;
            case 'updateLobby':
                this.isHost = message.isHost;
                data = message.data;
                this.playersAmount = data.playersAmount;
                this.slots = data.slots.slice();
                this.emit('updateView');
                break;
            default:
                break;
        }
    }

}

export default new LobbyModel();