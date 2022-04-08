import GameSlot from "./GameSlot.js";
import Observable from "../../public/src/js/Observable.js";
import BaseModel from "../../public/src/js/models/BaseModel.js";
import CardsList from "./CardsList.js";
import fs from 'fs';
import path from "path";
import SituationsClass from "./SituationsClass.js";

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
        this.situation = '';
        this.skipPopupController = new AbortController();
        this.roundResultsList = [];
        this.roundNumber = 0;
        this.memesDeck = new CardsList();
        this.playedMemesCards = new CardsList();
        this.situationDeck = new SituationsClass();
        this.playedSituations = [];
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

    prepareToStartGame() {
        const memesFolder = path.resolve() + '/public/src/img/memes/';

        fs.readdirSync(memesFolder).forEach(file => {
            let cardId = file.split('.')[0];
            this.memesDeck.addCard(Number(cardId));
        });

        this.memesDeck.shuffle();

        this.slots.forEach((slot) => {
            while(slot.cards.getCardsAmount() < this.maxCardsAmount) {
                slot.cards.addCard(this.memesDeck.drawFirstCard().id);
            }
        });

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

        this.curJudgeIndex = (this.curJudgeIndex + 1) % this.slots.length;
        this.playerTurnIndex = (this.curJudgeIndex + 1) % this.slots.length;

        if (this.situationDeck.situations.length === 0) {
            this.situationDeck.situations.splice(0, 0, ...this.playedSituations);
            this.situationDeck.shuffle();
            this.playedSituations = [];
        }

        this.situation = this.situationDeck.drawFirstSituation();
        this.playedSituations.push(this.situation);

        if (this.memesDeck.getCardsAmount() < this.slots.length) {
            this.playedMemesCards.shuffle();
            this.memesDeck.cards.splice(this.memesDeck.getCardsAmount(), 0,  ...this.playedMemesCards.getAllCards())
            this.playedMemesCards.clear();
        }

        this.slots.forEach((slot) => {
            if (slot.cards.getCardsAmount() < this.maxCardsAmount) {
                slot.cards.addCard(this.memesDeck.drawFirstCard().id);
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
        let winner = this.roundResultsList.find((result) => Number(result.cardId) === Number(cardId));
        this.roundResultsList = [];
        if (!winner) return;
        //достаем из объекта индекс игрока в массиве слотов
        let winnerIndex = winner.slotIndex;
        if (!this.slots[winnerIndex]) return;
        ++this.slots[winnerIndex].score;

        this.sendToAll({
            header: 'roundWinnerIsChosen/ok',
            winnerNickname: this.slots[winnerIndex].nickname,
            winnerCardId: winner.cardId,
            winnerOrientation: winner.cardOrientation,
        });

        setTimeout(() => {
            this.newRound();
        }, 5000);

    }

}

Object.assign(Room.prototype, Observable);

export default Room;