/**
 * Перевод из градусов в радианы
 * @param {number} degrees - величина угла в градусах
 * @return {number} - величина угла в радианах
 */
export function percentsToRadians(degrees) {
    return degrees * Math.PI / 180;
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
export function getDistanceBetweenCoords({x: x1, y: y1}, {x: x2, y: y2}) {
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
export function getEllipseDotCoord(a, b, angle) {
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
export function getEllipseArcLength(a, b, t1, t2, diffStep = 0.1) {

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
export function getAnglesByArcLength(a, b, t1, t2, dotsAmount, diffStep = 0.1) {

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
export function getCoordsByArcLength(a, b, t1, t2, dotsAmount, diffStep = 0.1) {

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

