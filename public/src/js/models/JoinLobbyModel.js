import Router from "../Router.js";
import BaseModel from "./BaseModel.js";
import {wsServer} from "../network.js";
import MainPageModel from "./MainPageModel.js";

class JoinLobbyModel extends BaseModel {
    constructor() {
        super();
        this.socket = null;
    }

    update() {
        return this.connectWebSocket().then(() => {
            this.emit('updateView');
        })
    }

    leave() {
        this.socket.close(1000, "переход на другую страницу");
    }

    connectWebSocket() {
        return new Promise((resolve, reject) => {
                this.socket = new WebSocket(wsServer);
                this.socket.onmessage = this.joinLobbyHandleResponse.bind(this);
                this.socket.onopen = () => resolve();
            }
        )
    }


    checkLobbyAvailability({lobbyCode}) {
        this.socket.send(JSON.stringify({
            header: 'checkLobby',
            lobbyCode: lobbyCode,
        }));
    }

    joinLobbyHandleResponse(event) {
        let message = JSON.parse(event.data);
        console.log(message);
        switch (message.header) {
            case 'checkLobby/ok':
                Router.emit("lobbyPage", {
                    userNickname: MainPageModel.userNickname,
                    lobbyCode: message.lobbyCode,
                });
                break;
            case 'checkLobby/error':
                console.log(`Ошибка: ${message.errorMessage}`);
                break;
            default:
                break;
        }
    }

}

export default new JoinLobbyModel();