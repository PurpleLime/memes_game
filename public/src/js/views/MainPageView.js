import BaseView from './BaseView.js'
import MainPageModel from "../models/MainPageModel.js";
import Router from "../Router.js";

class MainPageView extends BaseView {

    constructor(MainPageModel) {
        super();
        this._model = MainPageModel;
        this.wrapper = document.getElementById('wrapper');

    }

    init() {
        this.renderMainPage();
    }

    update() {
        // this.renderMainPage();

    }

    renderMainPage() {
        window.scroll(0, 0);
        document.title = 'Главная страница';

        this.wrapper.innerHTML = mainPageTemplate({});

        let userNickname = document.getElementById("usernameInput");
        userNickname.value = this._model.userNickname;
        userNickname.addEventListener('input', this.userNicknameClickHandler.bind(this));

        let createButton = document.getElementById('createButton');
        createButton.addEventListener('click', this.createButtonClickHandler.bind(this));

        let joinButton = document.getElementById("joinButton");

        joinButton.addEventListener('click', this.joinButtonHandler);

    }

    leave() {
    }

    userNicknameClickHandler(e) {
        e.preventDefault();
        this.emit("UserNicknameChanged", e.target.value);
    }

    createButtonClickHandler(e) {
        // Router.emit('lobbyPage');
        this.emit("createLobby");
    }

    joinButtonHandler(e) {
        Router.emit('joiningTheLobbyPage');
    }

}

export default new MainPageView(MainPageModel);