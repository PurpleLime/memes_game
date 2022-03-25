import BaseController from './BaseController.js';
import MainPageModel from "../models/MainPageModel.js";
import MainPageView from "../views/MainPageView.js";

class MainPageController extends BaseController {
    constructor(MainPageModel, MainPageView) {
        super();
        this._model = MainPageModel;
        this._view = MainPageView;


        this.addEvents();

    }

    addEvents() {
        this._view.on('UserNicknameChanged', this._model.changeUserNickname.bind(this._model));
        this._view.on('createLobby', this._model.createLobby.bind(this._model));
        // this._model.on('updateView', this._view.update.bind(this._view));
        this._model.on('initView', this._view.init.bind(this._view));
    }

    init() {
        super.update();
        this._model.init();
    }

    update() {
        // super.update();
        // this._model.update();
    }

    leave() {
        super.leave();
        this._model.leave();
        this._view.leave();
    }

}

export default new MainPageController(MainPageModel, MainPageView);