import BaseModel from "./BaseModel.js";

class MainPageModel extends BaseModel {
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

export default new MainPageModel();