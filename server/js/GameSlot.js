import { v4 as uuidv4 } from 'uuid';
import CardsList from "./CardsList.js";

export default class GameSlot {

    constructor(nickname, websocket) {
        this.id = uuidv4();
        this.nickname = nickname;
        this.isHost = false;
        this.websocket = websocket;
        this.type = 'player';
        this.score = 0;
        this.skipPopup = false;
        this.cards = new CardsList();
        for (let i = 1; i <= 7; ++i) {
            this.cards.addCard(i);
        }
    }

    toJSON() {
        return {
            id: this.id,
            nickname: this.nickname,
            isHost: this.isHost,
            type: this.type,
            // cards: this.cards.getAllCards(),
        }
    }

    makeHost() {
        this.isHost = true;
    }

    removeHost() {
        this.isHost = false;
    }

    drawCard(id) {
        return this.cards.drawCard(id);
    }

}