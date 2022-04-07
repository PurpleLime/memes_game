import GameSlot from "./GameSlot.js";
import Observable from "../../public/src/js/Observable.js";
import BaseModel from "../../public/src/js/models/BaseModel.js";

class Room {
    constructor(code) {
        this.slots = [];
        this.code = code;
        this.status = 'lobby';
        //индекс текущего судьи
        this.curJudgeIndex = -1;
        //индекс игрока, который ходит сейчас
        this.playerTurnIndex = -1;
        this.isTurnDone = false;
        this.maxCardsAmount = 7;
        this.situation = 'Когда вы списываете тест и смотрите в глаза учителю';
        this.skipPopupController = new AbortController();
        this.roundResultsList = [];
        this.roundNumber = 0;
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

    sendToAll(json, config = {}) {
        this.slots.forEach((slot) => {
            if (config.needUpdateCards) json.cards = slot.cards.getAllCards();
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

    startGame() {
        this.status = 'game';
        this.curJudgeIndex = 0;
        this.playerTurnIndex = -1;
        this.updateTurnData();
    }

    prepareNextTurn() {
        //если следующим ходящим игроком по очереди должен быть ведущий, то обработать конец раунда
        if ((this.playerTurnIndex + 1) % this.slots.length === this.curJudgeIndex) {
            this.slots[this.curJudgeIndex].websocket.send(JSON.stringify({
                header: 'resultsList',
                results: this.roundResultsList,
            }));
        } else {
            this.updateTurnData();
        }

    }

    roundEnd() {
        this.sendToAll({
            header: 'roundResults',
            curJudgeIndex: this.curJudgeIndex,
            roundResults: this.roundResultsList,
        });

    }

    newRound() {
        this.roundNumber++;
        this.situation += '+';
        this.curJudgeIndex = (this.curJudgeIndex + 1) % this.slots.length;
        this.playerTurnIndex = (this.curJudgeIndex + 1) % this.slots.length;
        this.slots.forEach((slot) => {
            if (slot.cards.getCardsAmount() < this.maxCardsAmount) {
                slot.cards.addCard(10);
            }
        });

        this.sendToAll({
            header: 'updateTurn/newRound',
            curJudgeIndex: this.curJudgeIndex,
            playerTurnIndex: this.playerTurnIndex,
            situation: this.situation,
            slots: this.slots,
        }, {needUpdateCards: true});
    }


    newTurn() {
        this.sendToAll({
            header: 'updateTurn',
            curJudgeIndex: this.curJudgeIndex,
            playerTurnIndex: this.playerTurnIndex,
            situation: this.situation,
        }, {needUpdateCards: true});
    }

    updateTurnData() {
        this.playerTurnIndex = (this.playerTurnIndex + 1) % this.slots.length;
        this.isTurnDone = false;

        if (this.playerTurnIndex === this.curJudgeIndex) {
            if (this.roundNumber !== 0) {
                this.roundEnd();
            } else {
                this.newRound();
            }

        } else {

            this.newTurn();

        }
    }

    allSkippedPopup() {
        let notSkipped = this.slots.findIndex((slot) => {
            return !slot.skipPopup;
        });

        return notSkipped === -1;
    }

    disableAllSkipsPopup() {
        this.slots.forEach((slot) => {
            slot.skipPopup = false;
        });
    }

    roundWinnerIsChosen(cardId) {
        //в списке разыгранных в этом раунде карт находим по id карты объект, содержащий id карты и индекс игрока в массиве слотов
        console.log(cardId);
        console.log(this.roundResultsList);
        let winner = this.roundResultsList.find((result) => Number(result.cardId) === Number(cardId));
        this.roundResultsList = [];
        if (!winner) return;
        //достаем из объекта индекс игрока в массиве слотов
        let winnerIndex = winner.slotIndex;
        console.log(this.slots[winnerIndex]);
        if (!this.slots[winnerIndex]) return;
        ++this.slots[winnerIndex].score;

        this.sendToAll({
            header: 'roundWinnerIsChosen/ok',
            winnerNickname: this.slots[winnerIndex].nickname,
            winnerCardId: cardId,
        });

        setTimeout(() => {
            this.newRound();
        }, 5000);

    }

}

Object.assign(Room.prototype, Observable);

export default Room;