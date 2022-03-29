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
        this.roomCode = '';
        this.playerId = '';
        this.isHost = false;

    }

    init({ userNickname, roomCode }) {
        this.roomCode = roomCode;
        return this.connectWebSocket().then(() => {
            this.socket.send(JSON.stringify({
                header: 'enterRoom',
                userNickname,
                roomCode,
            }));
        });
    }

    update({ userNickname, roomCode }) {
        // this.lobbyCode = lobbyCode;
        // return this.connectWebSocket().then(() => {
        //     this.socket.send(JSON.stringify({
        //         header: 'enterLobby',
        //         userNickname,
        //         lobbyCode,
        //     }));
        // });
    }

    leave(data) {
        if (data?.routerInfo !== 'lobbyToIngame') {
            this.socket.send(JSON.stringify({
                header: 'leaveLobby',
            }));
        }
    }

    startGame() {
        this.socket.send(JSON.stringify({
            header: 'startGame',
            roomCode: this.roomCode,
        }))
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
            case 'enterRoom/ok':
                this.playerId = message.userId;
                this.isHost = message.isHost;
                data = message.data;
                this.playersAmount = data.playersAmount;
                this.slots = data.slots.slice();
                this.emit('initView');
                break;
            case 'enterRoom/error':
                console.log(`Ошибка: ${message.errorMessage}`);
                break;
            case 'updateRoom':
                this.isHost = message.isHost;
                data = message.data;
                this.playersAmount = data.playersAmount;
                this.slots = data.slots.slice();
                this.emit('updateView');
                break;
            case 'startGame/ok':
                Router.emit('ingamePage', {
                    routerInfo: "lobbyToIngame",
                    socket: this.socket,
                    slots: this.slots,
                    isHost: this.isHost,
                    playerId: this.playerId,

                });
                break;
            default:
                break;
        }
    }

}

export default new LobbyModel();