import BaseController from './BaseController.js';
import Router from "../Router.js";
import LobbyModel from "../models/LobbyModel.js";
import LobbyView from "../views/LobbyView.js";

class LobbyController extends BaseController {
    constructor(LobbyModel, LobbyView) {
        super();
        this._model = LobbyModel;
        this._view = LobbyView;


        this.addEvents();

    }

    addEvents() {
        this._model.on('initView', this._view.init.bind(this._view));
        this._model.on('updateView', this._view.update.bind(this._view));
        this._view.on('startGame', this._model.startGame.bind(this._model));

    }

    init(...args) {
        super.update();
        this._model.init(...args);
    }

    update(...args) {
        // super.update();
        // this._model.update(...args);
    }

    leave(...args) {
        super.leave();
        this._model.leave(...args);
    }

}

export default new LobbyController(LobbyModel, LobbyView);