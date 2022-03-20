import BaseController from './BaseController.js';
import Router from "../Router.js";

export default class MainPageController extends BaseController {
    constructor(MainPageModel, MainPageView) {
        super();
        this._model = MainPageModel;
        this._view = MainPageView;


        this.addEvents();

    }

    addEvents() {
        Router.on("mainPage", this.update.bind(this));

        this._view.on('UserNicknameChanged', this._model.changeUserNickname.bind(this._model));
    }

    update() {
        this._model.update();
        this._view.update();
    }

}