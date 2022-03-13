import BaseView from './BaseView.js'

const fs = require('fs');

export default class MainPageView extends BaseView {

    constructor() {
        super();
        this.wrapper = document.getElementById('wrapper');
    }

    renderMainPage() {
        window.scroll(0, 0);
        document.title = 'Главная страница';

        this.wrapper.innerHTML = '';
    }

}