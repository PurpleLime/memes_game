import BaseController from './BaseController.js';
import Router from "../Router.js";
import IngameModel from "../models/IngameModel.js";
import IngameView from "../views/IngameView.js";

class IngameController extends BaseController {
    constructor(IngameModel, IngameView) {
        super();
        this._model = IngameModel;
        this._view = IngameView;


        this.addEvents();

    }

    addEvents() {
        this._model.on('initView', this._view.init.bind(this._view));
        this._model.on('newTurn', this._view.newTurn.bind(this._view));
        this._model.on('newRound', this._view.newRound.bind(this._view));
        this._model.on('showConfirmedCard', this._view.showPopupCard.bind(this._view));
        this._model.on('roundResults', this._view.showRoundResults.bind(this._view))
        this._model.on('showRoundWinner', this._view.showRoundWinner.bind(this._view));
        this._view.on('confirmCard', this._model.confirmCard.bind(this._model));
        this._view.on('skipPopup', this._model.skipPopup.bind(this._model));
        this._view.on('roundWinnerIsChosen', this._model.roundWinnerIsChosen.bind(this._model));

    }

    init(...args) {
        super.update();
        this._model.init(...args);
    }

    update(...args) {

    }

    leave(...args) {
        super.leave();
        this._model.leave(...args);
    }

}

export default new IngameController(IngameModel, IngameView);