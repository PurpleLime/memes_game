import BaseView from './BaseView.js'
import MainPageModel from "../models/MainPageModel.js";

class MainPageView extends BaseView {

    constructor(MainPageModel) {
        super();
        this._model = MainPageModel;
        this.wrapper = document.getElementById('wrapper');
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
        userNickname.addEventListener('input', (e) => {
            e.preventDefault();
            this.emit("UserNicknameChanged", userNickname.value)
        });



        //websocket:
        let socket = new WebSocket("ws://localhost:3000");

        socket.onmessage = function (event) {
            console.log(event.data);
        }

        let connectButton = document.getElementById("connectButton");
        connectButton.addEventListener('click', (e) => {
            socket.send(userNickname.value);
        })

    }

}

export default new MainPageView(MainPageModel);