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
        //зполнение стандартными заглушками
        usersList.innerHTML = lobbySlotsTemplate({});

        let slots = this._model.slots;

        //элемент-метка хоста
        let hostLabel = document.createElement('div');
        hostLabel.className = "user-game-avatar__host-label";

        //обновление заглушек на реальных игроков (слева направо)
        slots.forEach((slot, slotIndex) => {
            let curSlot = document.getElementById(`user${slotIndex + 1}`);
            let nameContainer = curSlot.querySelector('.user-game-avatar__name-container');
            curSlot.classList.add("user-game-avatar_default_avatar");
            nameContainer.textContent = slot.nickname;
            nameContainer.classList.remove("none");
            if (slot.isHost) {
                curSlot.append(hostLabel);
            }
        });

    }

}

export default new LobbyView(LobbyModel);