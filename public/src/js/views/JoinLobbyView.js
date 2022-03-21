import Router from "../Router.js";
import BaseView from './BaseView.js'
import JoinLobbyModel from "../models/JoinLobbyModel.js";
import MainPageModel from "../models/MainPageModel.js";
import {wsServer} from "../network.js"



class JoinLobbyView extends BaseView {

    constructor(LobbyModel) {
        super();
        this._model = JoinLobbyModel;
        // this.socket = null;
        this.wrapper = document.getElementById('wrapper');
    }

    update() {
        this.renderJoinLobbyPage();
    }

    leave() {
        // this.socket.close(1000, "переход на другую страницу");
    }

    renderJoinLobbyPage() {
        window.scroll(0, 0);
        document.title = 'Присоединиться к лобби';

        this.wrapper.innerHTML = joinLobbyTemplate({});

        //websocket:
        // this.socket = new WebSocket(wsServer);
        //
        // this.socket.onmessage = function (event) {
        //     console.log(JSON.parse(event.data));
        // }

        let lobbyCode = document.getElementById('lobbyCodeInput');

        let joinButton = document.getElementById("joinButton");

        joinButton.addEventListener('click', (e) => {
            // this.socket.send(JSON.stringify({
            //     messageType: 'connectLobby',
            //     userNickname: MainPageModel.userNickname,
            //     lobbyCode: lobbyCode.value.toUpperCase(),
            //     age: 77,
            // }));
            this.emit("joinLobby", {
                lobbyCode: lobbyCode.value.toUpperCase(),
                userNickname: MainPageModel.userNickname,
            });
        })

        let exitButton = document.getElementById('exitButton');
        exitButton.addEventListener('click', (e) => {
            Router.emit('mainPage');
        })

    }

}

export default new JoinLobbyView(JoinLobbyModel);