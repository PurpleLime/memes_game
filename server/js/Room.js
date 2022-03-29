import GameSlot from "./GameSlot.js";
import Observable from "../../public/src/js/Observable.js";
import BaseModel from "../../public/src/js/models/BaseModel.js";

class Room {
    constructor(code) {
        this.slots = [];
        this.code = code;
        this.status = 'lobby';
        this.curPlayerIndex = 0;
    }

    static maxPlayers = 8;

    playersAmount() {
        return this.slots.length;
    }

    isFull() {
        return this.playersAmount() === Room.maxPlayers;
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
                if (!this.isEmpty()) {
                    if (wasHost) this.slots[0].isHost = true;
                } else {
                    this.emit('deleteMe');
                }

            }
        }
    }

    findPlayerByWS(websocket) {
        return this.slots.find(slot => {
            return slot.websocket === websocket;
        })
    }

    sendToAll(json) {
        this.slots.forEach((slot) => {
            json.isHost = slot.isHost;
            slot.websocket.send(JSON.stringify(json));
        });
    }

    sendToAllExcept(json, excluded) {
        this.slots.forEach((slot) => {
            if (slot !== excluded) {
                json.isHost = slot.isHost;
                slot.websocket.send(JSON.stringify(json));
            }
        });
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    func() {
        return new Promise((resolve) => {
            setTimeout(resolve, 3000);
        }).then(value => {

            this.curPlayerIndex = (this.curPlayerIndex + 1) % this.slots.length
            this.sendToAll({
                header: 'updateGame',
                curPlayerIndex: this.curPlayerIndex,
            });
        })
    }

    async startGame() {
        this.status = 'game';
        console.log("startGameLoop")
        while (true) {
            await this.func();
        }

    }

}

Object.assign(Room.prototype, Observable);

export default Room;