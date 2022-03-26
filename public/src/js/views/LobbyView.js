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
        this.renderBeginButton();
    }

    leave() {

    }

    renderLobbyPage() {
        window.scroll(0, 0);
        document.title = 'Лобби';

        this.wrapper.innerHTML = lobbyTemplate({});

        let lobbyCodeInput = document.getElementById('lobbyCodeInput');
        lobbyCodeInput.readOnly = true;
        lobbyCodeInput.value = this._model.lobbyCode;

        let exitButton = document.getElementById('exitButton');
        exitButton.addEventListener('click', (e) => {
            Router.emit('mainPage');
        })

        let beginButton = document.getElementById('beginButton');
        beginButton.addEventListener('click', (e) => {
            this.emit("startGame");
        });

        this.renderLobbySlots();
        this.renderBeginButton();

    }

    renderLobbySlots() {
        let usersList = document.getElementById('usersList');
        //заполнение стандартными заглушками
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
            nameContainer.classList.remove("user-game-avatar__name-container_none");
            if (slot.isHost) {
                curSlot.append(hostLabel);
            }
        });

    }

    renderBeginButton() {
        let beginButton = document.getElementById('beginButton');
        if (this._model.isHost) {
            beginButton.classList.remove("menu-item_none");
        } else {
            beginButton.classList.add("menu-item_none");
        }
    }

}

export default new LobbyView(LobbyModel);