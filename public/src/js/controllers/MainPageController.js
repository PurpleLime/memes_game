import BaseController from './BaseController.js';

export default class MainPageController extends BaseController {
    constructor(MainPageModel, MainPageView) {
        super();
        this._model = MainPageModel;
        this._view = MainPageView;

        this._view.on('UserNicknameChanged', this._model.changeUserNickname.bind(this._model));
    }

}