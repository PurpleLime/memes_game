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
        //мой индекс
        this.slotIndex = -1;
        this.curJudgeIndex = -1;
        this.confirmedCardId = -1;
        this.playerTurnIndex = -1;
        this.isMyTurn = false;
        this.isTurnDone = false;
        this.cards = [];
        this.situation = '';
        this.roundResultsList = [];
        this.roundWinnerNickname = '';
        this.roundWinnerCardId = 0;
    }

    init(data) {
        this.socket = data.socket;
        this.roomCode = data.roomCode;
        this.slots = data.slots;
        this.isHost = data.isHost;
        this.playerId = data.playerId;
        this.cards = data.cards;
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
            case 'updateTurn':
                this.isTurnDone = false;
                this.curJudgeIndex = message.curJudgeIndex;
                this.playerTurnIndex = message.playerTurnIndex;
                this.isHost = message.isHost;
                this.isMyTurn = this.slotIndex === this.playerTurnIndex;
                this.cards = message.cards;
                this.situation = message.situation;
                console.log(`slotIndex: ${this.slotIndex}; playerTurnIndex: ${this.playerTurnIndex}`);
                this.emit('newTurn');
                break;
            case 'updateTurn/newRound':
                this.isTurnDone = false;
                this.curJudgeIndex = message.curJudgeIndex;
                this.playerTurnIndex = message.playerTurnIndex;
                this.isHost = message.isHost;
                this.isMyTurn = this.slotIndex === this.playerTurnIndex;
                this.situation = message.situation;
                this.cards = message.cards;
                console.log(`slotIndex: ${this.slotIndex}; playerTurnIndex: ${this.playerTurnIndex}`);
                this.emit('newRound');


                break;
            case 'turnDone/ok':
                this.confirmedCardId = message.confirmedCardId;
                this.emit('showConfirmedCard');
                break;

            case 'roundResults':
                this.roundResults = message.roundResults;
                this.curJudgeIndex = message.curJudgeIndex;
                if (this.slotIndex === this.curJudgeIndex) {
                    this.emit('roundResults');
                }
                break;

            case 'roundWinnerIsChosen/ok':
                this.roundWinnerNickname = message.winnerNickname;
                this.roundWinnerCardId = message.winnerCardId;
                this.emit('showRoundWinner');
                break;
            default:
                break;
        }
    }

    confirmCard(cardId) {
        if (this.isTurnDone) return;
        this.isTurnDone = true;
        this.confirmedCardId = cardId;
        console.log(`Выбрана карта номер ${this.confirmedCardId}`);
        this.socket.send(JSON.stringify({
            header: 'turnDone',
            roomCode: this.roomCode,
            playerId: this.playerId,
            confirmedCardId: this.confirmedCardId,
        }));
    }

    skipPopup() {
        this.socket.send(JSON.stringify({
            header: 'skipPopup',
            roomCode: this.roomCode,
        }));
    }

    roundWinnerIsChosen(cardId) {
        this.socket.send(JSON.stringify({
            header: 'roundWinnerIsChosen',
            roomCode: this.roomCode,
            cardId,
        }));
    }

}

export default new IngameModel();