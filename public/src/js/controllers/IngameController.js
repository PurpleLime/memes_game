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