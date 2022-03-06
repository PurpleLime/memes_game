//шаг, с которым мы будем искать длину эллипса
const diffStep = 0.1;

document.addEventListener("DOMContentLoaded", function (event) {
    init();
});

function init() {
    setUsersPositionsByCoords();
}

/**
 * Перевод из градусов в радианы
 * @param {number} degrees - величина угла в градусах
 * @return {number} - величина угла в радианах
 */
function percentsToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Располагает иконки пользователей на игровом поле, используя координаты точек на эллипсе
 * @param {number} areaAngle - угол дуги эллипса, на которой могут располагаться игроки
 */
function setUsersPositionsByCoords(areaAngle = 310) {

    let playersCircle = document.querySelector('#playersCircle'),
        container = playersCircle.querySelector('.players-сircle__container'),
        users = container.querySelectorAll('.user-game-avatar'),
        playersCircleSizes = {
            w: playersCircle.getBoundingClientRect().width,
            h: playersCircle.getBoundingClientRect().height,
            userW: users[0].getBoundingClientRect().width,
            userH: users[0].getBoundingClientRect().height
        }

    users = container.querySelectorAll('.user-game-avatar');

    //размер зоны (угол в градусах), в которой не располагаются пользователи(зона снизу)
    let notUsedAngle = 360 - areaAngle;

    //ширина эллипса / 2 (радиус эллипса в 0 градусов)
    let ellipseHorAxe = playersCircleSizes.w / 2;
    //высота эллипса / 2 (радиус эллипса в 90 градусах)
    let ellipseVertAxe = playersCircleSizes.h / 2;

    //угол, с которого начинается зона расположения пользователей
    let startAngle = 270 - notUsedAngle / 2;
    //угол, на котором заканчивается зона расположения пользователей
    let endAngle = -90 + notUsedAngle / 2;

    let coords = getCoordsByArcLength(ellipseHorAxe, ellipseVertAxe, endAngle, startAngle, users.length);

    let coord;

    for (let i = 0; i < users.length; i++) {

        coord = coords[i + 1];

        let transformX = coord.x - playersCircleSizes.userW / 2;

        let transformY = -(coord.y + playersCircleSizes.userH / 2);

        users[i].style.position = "absolute";
        users[i].style.top = "50%";
        users[i].style.left = "50%";
        users[i].style.transform = "translate(" + transformX + "px, " + transformY + "px)";

    }
}

/**
 * Располагает иконки пользователей на игровом поле, используя углы точек на эллипсе
 * @param {number} areaAngle - угол дуги эллипса, на которой могут располагаться игроки
 */
function setUsersPositionsByAngles(areaAngle = 300) {

    let playersCircle = document.querySelector('#playersCircle'),
        container = playersCircle.querySelector('.players-сircle__container'),
        users = container.querySelectorAll('.user-game-avatar'),
        playersCircleSizes = {
            w: playersCircle.getBoundingClientRect().width,
            h: playersCircle.getBoundingClientRect().height,
            userW: users[0].getBoundingClientRect().width,
            userH: users[0].getBoundingClientRect().height
        }

    users = container.querySelectorAll('.user-game-avatar');

    //размер зоны (угол в градусах), в которой не располагаются пользователи(зона снизу)
    let notUsedAngle = 360 - areaAngle;

    //ширина эллипса / 2 (радиус эллипса в 0 градусов)
    let ellipseHorAxe = playersCircleSizes.w / 2;
    //высота эллипса / 2 (радиус эллипса в 90 градусах)
    let ellipseVertAxe = playersCircleSizes.h / 2;

    //угол, с которого начинается зона расположения пользователей
    let startAngle = 270 - notUsedAngle / 2;
    //угол, на котором заканчивается зона расположения пользователей
    let endAngle = -90 + notUsedAngle / 2;

    let angles = getAnglesByArcLength(ellipseHorAxe, ellipseVertAxe, endAngle, startAngle, users.length);

    let angle;

    for (let i = 0; i < users.length; i++) {

        angle = angles[i + 1];
        // let angle = startAngle;

        let sin = Math.sin(percentsToRadians(angle));
        let cos = Math.cos(percentsToRadians(angle));

        let ellipseRadius = ellipseHorAxe * ellipseVertAxe / Math.sqrt((ellipseHorAxe ** 2) * (sin ** 2) + (ellipseVertAxe ** 2) * (cos ** 2));

        let transformY = -(sin * ellipseRadius + playersCircleSizes.userH / 2);

        let transformX = cos * ellipseRadius - playersCircleSizes.userW / 2;


        users[i].style.position = "absolute";
        users[i].style.top = "50%";
        users[i].style.left = "50%";
        users[i].style.transform = "translate(" + transformX + "px, " + transformY + "px)";
    }
}

/**
 * Вычисляет расстояние между двумя точками
 * @param {Object} coords1 - координаты первой точки
 * @param {Object} coords2 - координаты второй точки
 * @param {number} coords1.x - координата первой точки по оси X
 * @param {number} coords1.y - координата первой точки по оси Y
 * @param {number} coords2.x - координата второй точки по оси X
 * @param {number} coords2.y - координата второй точки по оси Y
 * @returns {number} - расстояние между точками
 */
function getDistanceBetweenCoords({x: x1, y: y1}, {x: x2, y: y2}) {
    return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

/**
 * Вычисляет координату точки на эллипсе
 * @param {number} a - горизонтальная полуось эллипса
 * @param {number} b - вертикальная полуось эллипса
 * @param {number} angle - угол точки на эллипсе (обход идет против часовой стрелки, 0 градусов лежит на положительном
 * направлении горизонтальной оси)
 * @returns {Object} - объект с двумя свойствами 'x' и 'y', содержащими координаты по оси X и по оси Y соответственно
 */
function getEllipseDotCoord(a, b, angle) {
    let sin = Math.sin(percentsToRadians(angle));
    let cos = Math.cos(percentsToRadians(angle));

    //определение радиуса эллипса в заданном углу
    let ellipseRadius = a * b / Math.sqrt((a ** 2) * (sin ** 2) + (b ** 2) * (cos ** 2));

    return {
        x: cos * ellipseRadius,
        y: sin * ellipseRadius
    }

}

/**
 * Вычисляет длину дуги эллипса
 * @param {number} a - горизонтальная полуось эллипса
 * @param {number} b - вертикальная полуось эллипса
 * @param {number} t1 - угол начала дуги (обход идет против часовой стрелки, 0 градусов лежит на положительном
 * направлении горизонтальной оси)
 * @param {number} t2 - угол конца дуги (обход идет против часовой стрелки, 0 градусов лежит на положительном
 * направлении горизонтальной оси)
 * @param {number} diffStep - угол отклонения(дельта отклонения) в градусах, с которым мы считаем хорды для
 * вычисления длины дуги (определяет точность подсчета длины дуги)
 * @returns {number} - длина дуги эллипса
 */
function getEllipseArcLength(a, b, t1, t2, diffStep = 0.1) {

    let prevCoord = getEllipseDotCoord(a, b, t1);
    let curCoord;
    let sum = 0;
    for (let i = t1 + 1; i <= t2; i += diffStep) {
        i = +i.toFixed(2);

        curCoord = getEllipseDotCoord(a, b, i);

        sum += getDistanceBetweenCoords(curCoord, prevCoord);

        prevCoord = curCoord;
    }

    return sum;

}

/**
 * Вычисляет углы равноудаленных друг от друга(вдоль дуги) точек на дуге эллипса
 * @param {number} a - горизонтальная полуось эллипса
 * @param {number} b - вертикальная полуось эллипса
 * @param {number} t1 - угол начала дуги (обход идет против часовой стрелки, 0 градусов лежит на положительном
 * направлении горизонтальной оси)
 * @param {number} t2 - угол конца дуги (обход идет против часовой стрелки, 0 градусов лежит на положительном
 * направлении горизонтальной оси)
 * @param {number} dotsAmount - количество точек, которые нужно расположить на дуге эллипса
 * @param {number} diffStep - угол отклонения(дельта отклонения) в градусах, с которым мы считаем хорды для
 * вычисления длины дуги (определяет точность подсчета длины дуги)
 * @returns {Array} - массив полученных углов от угла начала дуги до угла конца в очередности обхода(против
 * часовой стрелки)
 */
function getAnglesByArcLength(a, b, t1, t2, dotsAmount, diffStep = 0.1) {

    if (dotsAmount === 0) {
        console.log("Ошибка: нет точек");
        return [];
    }
    let arcLength = getEllipseArcLength(a, b, t1, t2);
    //+1 т.к. нам также нужны отступы по краям от крайних точек
    let arcPartLength = arcLength / (dotsAmount + 1);
    let angles = [];
    let prevCoord = getEllipseDotCoord(a, b, t1);
    let curCoord;
    let sum = 0;

    angles.push(t1);

    for (let i = t1; i <= t2; i += diffStep) {
        i = +i.toFixed(2);

        if (angles.length >= dotsAmount + 2) {
            break;
        }

        curCoord = getEllipseDotCoord(a, b, i);

        sum += getDistanceBetweenCoords(curCoord, prevCoord);

        if (sum >= arcPartLength || i >= t2) {
            sum = 0;
            angles.push(i);
        }

        prevCoord = curCoord;
    }

    return angles;

}

/**
 * Вычисляет координаты равноудаленных друг от друга(вдоль дуги) точек на дуге эллипса
 * @param {number} a - горизонтальная полуось эллипса
 * @param {number} b - вертикальная полуось эллипса
 * @param {number} t1 - угол начала дуги (обход идет против часовой стрелки, 0 градусов лежит на положительном
 * направлении горизонтальной оси)
 * @param {number} t2 - угол конца дуги (обход идет против часовой стрелки, 0 градусов лежит на положительном
 * направлении горизонтальной оси)
 * @param {number} dotsAmount - количество точек, которые нужно расположить на дуге эллипса
 * @param {number} diffStep - угол отклонения(дельта отклонения) в градусах, с которым мы считаем хорды для
 * вычисления длины дуги (определяет точность подсчета длины дуги)
 * @returns {Array<Object>} - массив полученных координат(каждая в виде объекта с двумя свойствами 'x' и 'y',
 * содержащими координаты по оси X и по оси Y соответственно) от угла начала дуги до угла конца в очередности
 * обхода(против часовой стрелки)
 */
function getCoordsByArcLength(a, b, t1, t2, dotsAmount, diffStep = 0.1) {

    if (dotsAmount === 0) {
        console.log("Ошибка: нет точек");
        return [];
    }
    let arcLength = getEllipseArcLength(a, b, t1, t2);
    //получаем длину дуг между точками
    //+1 т.к. нам также нужны отступы по краям от крайних точек
    let arcPartLength = arcLength / (dotsAmount + 1);
    let coords = [];
    let prevCoord = getEllipseDotCoord(a, b, t1);
    let curCoord;
    let sum = 0;

    coords.push(getEllipseDotCoord(a, b, t1));

    for (let i = t1; i <= t2; i += diffStep) {
        i = +i.toFixed(2);

        if (coords.length >= dotsAmount + 2) {
            break;
        }

        curCoord = getEllipseDotCoord(a, b, i);

        sum += getDistanceBetweenCoords(curCoord, prevCoord);

        if (sum >= arcPartLength || i >= t2) {
            sum = 0;
            coords.push(curCoord);
        }
        prevCoord = curCoord;
    }

    return coords;
}