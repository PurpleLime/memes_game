import Router from "../Router.js";
import BaseView from './BaseView.js'
import LobbyModel from "../models/LobbyModel.js";

class LobbyView extends BaseView {

    constructor(LobbyModel) {
        super();
        this._model = LobbyModel;
        this.wrapper = document.getElementById('wrapper');
    }

    update() {
        this.renderLobbyPage();
    }

    leave() {

    }

    renderLobbyPage() {
        window.scroll(0, 0);
        document.title = 'Лобби';

        this.wrapper.innerHTML = lobbyTemplate({});

        let exitButton = document.getElementById('exitButton');
        exitButton.addEventListener('click', (e) => {
            Router.emit('mainPage');
        })

    }

}

export default new LobbyView(LobbyModel);