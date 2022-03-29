import { v4 as uuidv4 } from 'uuid';

export default class GameSlot {

    constructor(nickname, websocket) {
        this.id = uuidv4();
        this.nickname = nickname;
        this.isHost = false;
        this.websocket = websocket;
        this.type = 'player';
        this.cards = [];
    }

    toJSON() {
        return {
            id: this.id,
            nickname: this.nickname,
            isHost: this.isHost,
            type: this.type,
        }
    }

    makeHost() {
        this.isHost = true;
    }

    removeHost() {
        this.isHost = false;
    }

}