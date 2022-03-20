import BaseModel from "./BaseModel.js";

class MainPageModel extends BaseModel {
    constructor() {
        super();
        this.init();
    }

    init() {
        this.userNickname = 'Имечко';
    }

    update() {
    }

    changeUserNickname(newUserNickname) {
        this.userNickname = newUserNickname;
        console.log(this.userNickname);
    }

}

export default new MainPageModel();