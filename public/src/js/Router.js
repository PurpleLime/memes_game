import Observable from "./Observable.js";
import MainPageController from "./controllers/MainPageController.js";
import LobbyController from "./controllers/LobbyController.js";
import JoinLobbyController from "./controllers/JoinLobbyController.js";
import IngameController from "./controllers/IngameController.js";

class Router {
    constructor() {
        // this.on("mainPage", this.changePage.bind(this))
        this.on("mainPage", (...args) => {
            this.changePage(...args)
        });
        this.on("mainPage", MainPageController.init.bind(MainPageController));
        // this.on("joiningTheLobbyPage", this.changePage.bind(this));
        this.on("joiningTheLobbyPage", (...args) => {
            this.changePage(...args)
        });
        this.on("joiningTheLobbyPage", JoinLobbyController.init.bind(JoinLobbyController));
        // this.on("lobbyPage", this.changePage.bind(this));
        this.on("lobbyPage", (...args) => {
            this.changePage(...args)
        });
        this.on("lobbyPage", LobbyController.init.bind(LobbyController));
        // this.on("ingamePage", this.changePage.bind(this));
        this.on("ingamePage", (...args) => {
            this.changePage(...args)
        });
        this.on("ingamePage", IngameController.init.bind(IngameController));

    }

    controllers = [
        MainPageController,
        LobbyController,
        JoinLobbyController,
        IngameController
    ]

    changePage(...args) {
        this.controllers.forEach(contr => {
            if (contr.isActive) {
                contr.leave(...args);
            }
        })
    }

}

Object.assign(Router.prototype, Observable);

export default new Router();
