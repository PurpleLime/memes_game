import BaseView from './BaseView.js'

export default class LobbyView extends BaseView {

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