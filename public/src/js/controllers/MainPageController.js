import BaseController from './BaseController.js';
import Router from "../models/Router.js";

export default class MainPageController extends BaseController {
    constructor(MainPageModel, MainPageView) {
        super();
        this._model = MainPageModel;
        this._view = MainPageView;


        this.addEvents();

    }

    addEvents() {
        Router.on("mainPage", this.init.bind(this));

        this._view.on('UserNicknameChanged', this._model.changeUserNickname.bind(this._model));
    }

    init() {
        this._model.init();
        this._view.init();
    }

}