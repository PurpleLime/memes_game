import Router from "./src/js/Router.js";

window.addEventListener('resize', (e) => {
    let height = document.getElementById('container').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--game-area-height', `${height}px`);
});

Router.emit("mainPage");



