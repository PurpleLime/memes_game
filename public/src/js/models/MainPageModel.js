import BaseModel from "./BaseModel.js";
import {httpServer} from "../network.js";
import Router from "../Router.js";

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

    createLobby() {
        let url = new URL('/createLobby' ,httpServer);
        url.searchParams.append('nickname', this.userNickname);
        fetch(url).then(response => response.json()). then(json => {
            Router.emit("lobbyPage", {
                userNickname: this.userNickname,
                lobbyCode: json.lobbyCode,
            });
        });

    }

}

export default new MainPageModel();