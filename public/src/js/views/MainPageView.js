import BaseView from './BaseView.js'
import MainPageModel from "../models/MainPageModel.js";
import Router from "../Router.js";

class MainPageView extends BaseView {

    constructor(MainPageModel) {
        super();
        this._model = MainPageModel;
        this.wrapper = document.getElementById('wrapper');

        this.socket = null;

        this.init();
    }

    init() {
    }

    update() {
        this.renderMainPage();

    }

    renderMainPage() {
        window.scroll(0, 0);
        document.title = 'Главная страница';

        this.wrapper.innerHTML = mainPageTemplate({});

        let userNickname = document.getElementById("usernameInput");
        userNickname.value = this._model.userNickname;
        userNickname.addEventListener('input', this.userNicknameClickHandler.bind(this));



        //websocket:
        this.socket = new WebSocket("ws://localhost:3000");

        this.socket.onmessage = function (event) {
            console.log(event.data);
        }

        let createButton = document.getElementById('createButton');
        createButton.addEventListener('click', this.createButtonClickHandler);

        let connectButton = document.getElementById("connectButton");
        connectButton.addEventListener('click', (e) => {
            this.socket.send(userNickname.value);
        })

    }

    leave() {
        this.socket.close(1000, "переход на другую страницу");

        let userNickname = document.getElementById("usernameInput");
        userNickname.removeEventListener('input', this.userNicknameClickHandler.bind(this));

        let createButton = document.getElementById('createButton');
        createButton.removeEventListener('click', this.createButtonClickHandler);
    }

    userNicknameClickHandler(e) {
        e.preventDefault();
        this.emit("UserNicknameChanged", e.target.value);
    }

    createButtonClickHandler(e) {
        Router.emit('lobby');
    }

}

export default new MainPageView(MainPageModel);