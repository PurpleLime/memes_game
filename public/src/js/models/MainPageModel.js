import BaseModel from "./BaseModel.js";

export default class MainPageModel extends BaseModel {
    constructor() {
        super();
    }

    update() {
        this.userNickname = 'Имечко';
    }

    changeUserNickname(newUserNickname) {
        this.userNickname = newUserNickname;
        console.log(this.userNickname);
    }


}