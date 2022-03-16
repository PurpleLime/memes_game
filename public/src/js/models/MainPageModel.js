import BaseModel from "./BaseModel.js";

export default class MainPageModel extends BaseModel {
    constructor() {
        super();
        this.userNickname = 'Имечко';
    }

    changeUserNickname(newUserNickname) {
        this.userNickname = newUserNickname;
    }


}