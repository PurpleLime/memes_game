var offsetAngle = 0,
    carousel = document.querySelector('#carousel'),
    addCircleBtn = document.querySelector('#add-circle'),
    container = carousel.querySelector('.container'),
    circles = container.querySelectorAll('.circle'),
    circlesCounter = document.querySelector('#circles-counter'),
    carouselBoundingRect = carousel.getBoundingClientRect(),

    carouselSize = {
        w: carouselBoundingRect.width,
        h: carouselBoundingRect.height,
        radius: carouselBoundingRect.width / 2,
        circle: circles[0].getBoundingClientRect().width
    },
    carouselConfig = {
        autoRotate: true,
        autoAddCircle: true,
        interval: null,
        turn: 'circle'
    }

document.addEventListener("DOMContentLoaded", function(event) {
    init();
});


// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

function init() {

    circles = container.querySelectorAll('.circle');

    setPosition();
    update();
    addGUI();

    // Set random colors
    for (var i = 0; i < circles.length; i++) {
        circles[i].style.background = randomFlatColor();
    };

    // Binding keydown
    document.addEventListener('keydown', onKeyDown, false);

    // Add circle via btn
    addCircleBtn.addEventListener('click', addCircle, false);

}

function setPosition() {
    circles = container.querySelectorAll('.circle');

    var circleSize = circles[0].getBoundingClientRect().width;

    for (var i = 0; i < circles.length; i++) {

        var angle = (360 / circles.length) * i + offsetAngle;

        var transformY = Math.sin(Math.radians(angle)) * carouselSize.radius - carouselSize.circle / 2 + "px";
        var transformX = Math.cos(Math.radians(angle)) * carouselSize.radius - carouselSize.circle / 2 + "px";

        circles[i].style.transform = "translate3d(" + transformX + ", " + transformY + ", 0)";
        circles[i].style.opacity = 1;
    };
}

function update() {
    carouselConfig.interval = setInterval(function() {

        if (carouselConfig.turn === "circle" && carouselConfig.autoRotate) {
            rotate();
        } else if (carouselConfig.autoAddCircle && circles.length < 150) {
            addCircle();
        }
        carouselConfig.turn = (carouselConfig.turn == 'circle') ? 'rotate' : 'circle';

    }, 1000);

}

function rotate() {
    circles = container.querySelectorAll('.circle');

    offsetAngle += (360 / circles.length);

    if (offsetAngle > 360)
        offsetAngle -= 360;

    setPosition();
}

function addCircle() {
    container.innerHTML += "<div class='circle' style='background :" + randomFlatColor() + "'></div>";
    circlesCounter.innerHTML = "<span style='color :" + randomFlatColor() + "'>" + (circles.length + 1) + " circles</span>"
    setPosition();
}

function onKeyDown(ev) {
    if (ev.keyCode === 13) {
        addCircle();
    } else if (ev.keyCode === 32) {
        rotate();
    }

    clearTimeout(carouselConfig.interval);
    update();
}

/*
 * Utils
 */

function randomFlatColor() {
    var flatColors = ["#1abd9d", "#2ecc71", "#3498db", "#9b59b6", "#19b496", "#27ae60", "#2980b9", "#8e44ad", "#f1c40f", "#e67e22", "#e74c3c", "#f39c12", "#d35400", "#c0392b"];
    return flatColors[Math.floor(Math.random() * flatColors.length)];
}

function addGUI() {
    var gui = new dat.GUI();

    gui.add(carouselConfig, "autoRotate");
    gui.add(carouselConfig, "autoAddCircle");
}

// HENG Patrick -- hengpatrick.fr