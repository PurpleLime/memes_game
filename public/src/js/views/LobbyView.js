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

    renderLobbyPage() {
        window.scroll(0, 0);
        document.title = 'Лобби';

        this.wrapper.innerHTML = lobbyTemplate({});

    }

}

export default new LobbyView(LobbyModel);