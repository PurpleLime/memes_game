import BaseView from './BaseView.js'

export default class MainPageView extends BaseView {

    constructor(MainPageModel) {
        super();
        this._model = MainPageModel;
        this.wrapper = document.getElementById('wrapper');
    }

    renderMainPage() {
        window.scroll(0, 0);
        document.title = 'Главная страница';

        this.wrapper.innerHTML = mainPageTemplate({});

        let userNickname = document.getElementById("usernameInput");
        userNickname.value = this._model.userNickname;
        userNickname.addEventListener('input', () => {this.emit("UserNicknameChanged", userNickname.value)});

    }

}