import BaseModel from "./BaseModel.js";
import {wsServer} from "../network.js";
import Router from "../Router.js";
import MainPageModel from "./MainPageModel.js";

class IngameModel extends BaseModel {
    constructor() {
        super();
        this.socket = null;
        this.userNickname = '';
        this.playersAmount = 8;
        this.slots = [];
        this.roomCode = '';
        this.isHost = false;
        this.playerId = '';
        this.slotIndex = -1;
        this.curPlayerIndex = -1;
    }

    init(data) {
        this.socket = data.socket;
        this.slots = data.slots;
        this.isHost = data.isHost;
        this.playerId = data.playerId;
        this.slotIndex = this.slots.findIndex(slot => slot.id === this.playerId);

        this.socket.onmessage = this.ingameHandleResponse.bind(this);

        this.emit('initView');
    }

    update() {

    }

    leave(data) {

    }

    ingameHandleResponse(event) {
        let message = JSON.parse(event.data);
        console.log(message);
        let data = null;
        switch (message.header) {
            case 'updateGame':
                this.curPlayerIndex = message.curPlayerIndex;
                this.emit('updateGame');
                break;
            default:
                break;
        }
    }

}

export default new IngameModel();