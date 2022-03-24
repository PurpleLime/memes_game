import BaseModel from "./BaseModel.js";

class MainPageModel extends BaseModel {
    constructor() {
        super();
        this.init();
    }

    init() {
        this.userNickname = 'Имечко';
        this.emit('initView');
    }

    update() {
        // this.emit('updateView');
    }

    leave() {

    }

    changeUserNickname(newUserNickname) {
        this.userNickname = newUserNickname;
        console.log(this.userNickname);
    }

}

export default new MainPageModel();