import Router from "../Router.js";
import BaseView from './BaseView.js'
import IngameModel from "../models/IngameModel.js";
import {percentsToRadians, getDistanceBetweenCoords, getEllipseDotCoord, getEllipseArcLength, getAnglesByArcLength, getCoordsByArcLength} from "../utils.js"

class IngameView extends BaseView {

    constructor(IngameModel) {
        super();
        this._model = IngameModel;
        this.wrapper = document.getElementById('wrapper');
    }

    init() {
        return new Promise((resolve, reject) => {
            this.renderIngamePage();
            resolve();
        })
    }

    update() {

    }

    leave() {

    }

    renderIngamePage() {
        window.scroll(0, 0);
        document.title = 'Memes Game';

        this.wrapper.innerHTML = ingameTemplate({});

        this.renderPlayers();

        this.setUsersPositionsByCoords();
    }



    renderPlayers() {
        let container = document.getElementById('playersContainer');
        let playersAmount = this._model.slots.length;

        for (let i = 0; i < playersAmount - 1; ++i) {
            container.insertAdjacentHTML('beforeend', ingamePlayerTemplate({}));
        }

        let slots = this._model.slots;
        let players = document.querySelectorAll('.user-game-avatar');
        let nextPlayerIndex = this._model.slotIndex + 1;

        //распределение индексов игроков в массиве игроков по слотам на игровом поле
        players.forEach((playerSlot) => {
            playerSlot.id = `playerSlot${nextPlayerIndex++ % slots.length}`;
            playerSlot.classList.add('user-game-avatar_default_avatar');
        });

        slots.forEach((slot, slotIndex) => {
            if (slot.id !== this._model.playerId) {
                let userSlot = document.getElementById(`playerSlot${slotIndex}`);
                let userNickname = userSlot.querySelector('.user-game-avatar__name-container');
                userNickname.textContent = slot.nickname;
            }
        })

    }

    updateGame() {
        let slots = this._model.slots;
        slots.forEach((slot, slotIndex) => {

            let userSlot = document.getElementById(`playerSlot${slotIndex}`);
            if (!userSlot) return;

            let emblem = userSlot.querySelector('.user-game-avatar__judge-emblem');

            if (slotIndex !== this._model.curPlayerIndex) {
                emblem.classList.add('user-game-avatar__judge-emblem_none');
            } else {
                emblem.classList.remove('user-game-avatar__judge-emblem_none');
            }
        })

    }


    /**
     * Располагает иконки пользователей на игровом поле, используя координаты точек на эллипсе
     * @param {number} areaAngle - угол дуги эллипса, на которой могут располагаться игроки
     */
    setUsersPositionsByCoords(areaAngle = 310) {

        let playersCircle = document.querySelector('#playersCircle');
        let container = playersCircle.querySelector(".players-circle__container");
        let users = container.querySelectorAll('.user-game-avatar');
        if (users.length === 0) return
        let playersCircleSizes = {
                w: playersCircle.getBoundingClientRect().width,
                h: playersCircle.getBoundingClientRect().height,
                userW: users[0].getBoundingClientRect().width,
                userH: users[0].getBoundingClientRect().height
            }

        users = container.querySelectorAll('.user-game-avatar');

        //размер зоны (угол в градусах), в которой не располагаются пользователи(зона снизу)
        let notUsedAngle = 360 - areaAngle;

        //горизонтальная полуось эллипса (радиус эллипса в 0 градусов)
        let ellipseHorAxe = playersCircleSizes.w / 2;
        //вертикальная полуось эллипса (радиус эллипса в 90 градусах)
        let ellipseVertAxe = playersCircleSizes.h / 2;

        //угол, с которого начинается зона расположения пользователей
        let startAngle = 270 - notUsedAngle / 2;
        //угол, на котором заканчивается зона расположения пользователей
        let endAngle = -90 + notUsedAngle / 2;

        let coords = getCoordsByArcLength(ellipseHorAxe, ellipseVertAxe, endAngle, startAngle, users.length);

        let coord;

        for (let i = 0; i < users.length; ++i) {

            //располагать против часовой стрелке
            // coord = coords[i + 1];

            //располагать по часовой стрелке
            coord = coords[users.length - i]


            let transformX = coord.x - playersCircleSizes.userW / 2;

            let transformY = -(coord.y + playersCircleSizes.userH / 2);

            users[i].style.position = "absolute";
            users[i].style.top = "50%";
            users[i].style.left = "50%";
            users[i].style.transform = "translate(" + transformX + "px, " + transformY + "px)";

        }

        let users2 = container.querySelectorAll('.user-game-avatar');
    }


    /**
     * Располагает иконки пользователей на игровом поле, используя углы точек на эллипсе
     * @param {number} areaAngle - угол дуги эллипса, на которой могут располагаться игроки
     */
    setUsersPositionsByAngles(areaAngle = 300) {

        let playersCircle = document.querySelector('#playersCircle'),
            container = playersCircle.querySelector('.players-circle__container'),
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

            //располагать против часовой стрелке
            // angle = angles[i + 1];

            //располагать по часовой стрелке
            angle = angles[users.length - i];


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


}

export default new IngameView(IngameModel);