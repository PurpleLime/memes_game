import BaseController from './BaseController.js';
import Router from "../Router.js";
import JoinLobbyModel from "../models/JoinLobbyModel.js";
import JoinLobbyView from "../views/JoinLobbyView.js";

class JoinLobbyController extends BaseController {
    constructor(JoinLobbyModel, JoinLobbyView) {
        super();
        this._model = JoinLobbyModel;
        this._view = JoinLobbyView;


        this.addEvents();

    }

    addEvents() {

    }

    update() {
        super.update();
        this._model.update();
        this._view.update();
    }

    leave() {
        super.leave();
        this._model.leave();
        this._view.leave();
    }

}

export default new JoinLobbyController(JoinLobbyModel, JoinLobbyView);