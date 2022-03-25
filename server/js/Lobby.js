import GameSlot from "./GameSlot.js";

export default class Lobby {
    constructor(code) {
        this.slots = [];
        this.code = code;
    }

    static maxPlayers = 8;

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
        } else {
            if (this.isEmpty()) {
                slot.isHost = true;
            }
            this.slots.push(slot);
        }
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
            //индекс удаляемого игрока в списке игроков
            let slotIndex = this.slots.findIndex(slot => {
                return slot.websocket === websocket;
            });

            if (slotIndex !== -1) {
                //флаг, показывающий, был ли удаляемый игрок хостом
                let wasHost = this.slots[slotIndex].isHost;
                this.slots.splice(slotIndex, 1);

                //если лобби теперь не пустое и удаленный игрок был хостом, то сделать хостом первого в списке игрока
                if (!this.isEmpty() && wasHost) {
                    this.slots[0].isHost = true;
                }
            }
        }
    }

    sendAllExcept(json, excluded) {
        this.slots.forEach((slot) => {
            if (slot !== excluded) {
                slot.websocket.send(JSON.stringify(json));
            }
        });
    }

}