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
        this._model.on('updateGame', this._view.updateGame.bind(this._view));
        this._view.on('confirmCard', this._model.setConfirmedCard.bind(this._model));

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