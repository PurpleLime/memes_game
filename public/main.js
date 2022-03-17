import Router from "./src/js/models/Router.js";
import MainPageView from './src/js/views/MainPageView.js'
import MainPageModel from "./src/js/models/MainPageModel.js";
import MainPageController from "./src/js/controllers/MainPageController.js";

const mainPageModel = new MainPageModel();
const mainPageView = new MainPageView(mainPageModel);
const mainPageController = new MainPageController(mainPageModel, mainPageView);

Router.emit("mainPage");
// mainPageView.renderMainPage();