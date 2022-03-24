import Observable from "./Observable.js";
import MainPageController from "./controllers/MainPageController.js";
import LobbyController from "./controllers/LobbyController.js";
import JoinLobbyController from "./controllers/JoinLobbyController.js";

class Router {
    constructor() {
        this.on("mainPage", this.changePage.bind(this))
        this.on("mainPage", MainPageController.init.bind(MainPageController));
        this.on("joiningTheLobbyPage", this.changePage.bind(this));
        this.on("joiningTheLobbyPage", JoinLobbyController.init.bind(JoinLobbyController));
        this.on("lobbyPage", this.changePage.bind(this));
        this.on("lobbyPage", LobbyController.init.bind(LobbyController));
    }

    controllers = [
        MainPageController,
        LobbyController,
        JoinLobbyController
    ]

    changePage() {
        this.controllers.forEach(contr => {
            if (contr.isActive) {
                contr.leave();
            }
        })
    }

}

Object.assign(Router.prototype, Observable);

export default new Router();
