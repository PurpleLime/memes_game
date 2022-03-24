import Router from "../Router.js";
import BaseView from './BaseView.js'
import LobbyModel from "../models/LobbyModel.js";

class LobbyView extends BaseView {

    constructor(LobbyModel) {
        super();
        this._model = LobbyModel;
        this.wrapper = document.getElementById('wrapper');
    }

    init() {
        return new Promise((resolve, reject) => {
            this.renderLobbyPage();
            resolve();
        })
    }

    update() {
        this.renderLobbySlots();
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

        this.renderLobbySlots();

    }

    renderLobbySlots() {
        let usersList = document.getElementById('usersList');
        console.log(usersList);
        usersList.innerHTML = lobbySlotsTemplate({});

        let slots = this._model.slots;
        slots.forEach((slot, slotIndex) => {
            let curSlot = document.getElementById(`user${slotIndex + 1}`);
            let nameContainer = curSlot.querySelector('.user-game-avatar__name-container');
            curSlot.classList.add("user-game-avatar_default_avatar");
            nameContainer.textContent = slot.nickname;
            nameContainer.classList.remove("none");
        });
    }

}

export default new LobbyView(LobbyModel);