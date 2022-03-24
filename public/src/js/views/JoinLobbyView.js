import Router from "../Router.js";
import BaseView from './BaseView.js'
import JoinLobbyModel from "../models/JoinLobbyModel.js";



class JoinLobbyView extends BaseView {

    constructor(LobbyModel) {
        super();
        this._model = JoinLobbyModel;
        this.wrapper = document.getElementById('wrapper');
    }

    init() {
        return new Promise((resolve, reject) => {
            this.renderJoinLobbyPage();
        })
    }

    update() {
        // return new Promise((resolve, reject) => {
        //     this.renderJoinLobbyPage();
        // })
    }

    leave() {
    }

    renderJoinLobbyPage() {
        window.scroll(0, 0);
        document.title = 'Присоединиться к лобби';

        this.wrapper.innerHTML = joinLobbyTemplate({});

        let lobbyCode = document.getElementById('lobbyCodeInput');

        let joinButton = document.getElementById("joinButton");

        joinButton.addEventListener('click', (e) => {

            this.emit("checkLobbyAvailability", {
                lobbyCode: lobbyCode.value.toUpperCase(),
            });
        })

        let exitButton = document.getElementById('exitButton');
        exitButton.addEventListener('click', (e) => {
            Router.emit('mainPage');
        })

    }

}

export default new JoinLobbyView(JoinLobbyModel);