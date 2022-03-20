import Router from "./src/js/Router.js";
import MainPageModel from "./src/js/models/MainPageModel.js";
import MainPageView from './src/js/views/MainPageView.js'
import MainPageController from "./src/js/controllers/MainPageController.js";
import LobbyModel from "./src/js/models/LobbyModel.js";
import LobbyView from "./src/js/views/LobbyView.js";
import LobbyController from "./src/js/controllers/LobbyController.js";

// const mainPageModel = new MainPageModel();
// const mainPageView = new MainPageView(MainPageModel);
// const mainPageController = new MainPageController(MainPageModel, MainPageView);

Router.emit("mainPage");



