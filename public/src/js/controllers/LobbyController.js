import BaseController from './BaseController.js';
import Router from "../Router.js";

export default class LobbyController extends BaseController {
    constructor(LobbyModel, LobbyView) {
        super();
        this._model = LobbyModel;
        this._view = LobbyView;


        this.addEvents();

    }

    addEvents() {
        Router.on("lobby", this.update.bind(this));

    }

    update() {
        this._model.update();
        this._view.update();
    }

}