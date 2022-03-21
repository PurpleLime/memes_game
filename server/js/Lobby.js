import GameSlot from "./GameSlot.js";

export default class Lobby {
    constructor(code) {
        this.slots = [];
        this.playersAmount = 0;
        this.code = code;
    }

    static maxPlayers = 2;

    isFull() {
        return this.playersAmount === Lobby.maxPlayers;
    }

    addPlayer(slot) {
        if (this.isFull()) {
            throw new Error("Лобби заполнено");
        }
        this.slots.push(slot);
        this.playersAmount++;
    }

    getLobbyJSON() {
        return JSON.stringify(this);
    }

}