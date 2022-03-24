import GameSlot from "./GameSlot.js";

export default class Lobby {
    constructor(code) {
        this.slots = [];
        this.code = code;
    }

    static maxPlayers = 2;

    playersAmount() {
        return this.slots.length;
    }

    isFull() {
        return this.playersAmount() === Lobby.maxPlayers;
    }

    isEmpty() {
        return this.playersAmount() === 0;
    }

    addPlayer(slot) {
        if (this.isFull()) {
            throw new Error("Лобби заполнено");
        }
        this.slots.push(slot);
    }

    deletePlayerById(userId) {
        if (!this.isEmpty()) {
            let slotIndex = this.slots.findIndex(slot => {
                return slot.id === userId;
            });

            if (slotIndex !== -1) {
                this.slots.splice(slotIndex, 1);
            }
        }
    }

    deletePlayerByWS(websocket) {
        if (!this.isEmpty()) {
            let slotIndex = this.slots.findIndex(slot => {
                return slot.websocket === websocket;
            });

            if (slotIndex !== -1) {
                this.slots.splice(slotIndex, 1);
            }
        }
    }

}