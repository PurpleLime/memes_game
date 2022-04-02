import Router from "../Router.js";
import BaseView from './BaseView.js'
import IngameModel from "../models/IngameModel.js";
import {
    degreesToRadians,
    getDistanceBetweenCoords,
    getEllipseDotCoord,
    getEllipseArcLength,
    getAnglesByArcLength,
    getCoordsByArcLength
} from "../utils.js"

class IngameView extends BaseView {

    constructor(IngameModel) {
        super();
        this._model = IngameModel;
        this.wrapper = document.getElementById('wrapper');
        //часть карты, перекрываемая следующей картой
        this.cardCoverArea = 1 / 5;
        //угол поворота между двумя соседними картами
        this.cardBetweenAngle = 7;
        this.selectedCard = -1;
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

        this.renderPlayerHand();
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

    async renderPlayerHand() {
        let playerHand = document.getElementById('playerHand');

        let playerSlot = this._model.slots.find(slot => slot.id === this._model.playerId);
        let playerCards = playerSlot.cards;

        //удаляем из руки карты, которых не должно быть
        playerHand.querySelectorAll('.meme-card').forEach((memeCard) => {
            if (!playerCards.find(card => card.id === memeCard.id)) {
                memeCard.remove();
                this.arrangeCardsInHand();
            }
        })

        //добавляем в руку карты, которых не хватает
        let promises = [];
        let promiseCounter = 1;
        playerCards.forEach((card) => {
            if (!playerHand.querySelector(`#card${card.id}`)) {
                promises.push(new Promise((resolve, reject) => {
                    setTimeout(() => resolve(), 800 * promiseCounter++);
                }).then(() => {
                    playerHand.insertAdjacentHTML('beforeend', ingameCardTemplate({}));
                    let addedCard = document.querySelector('#playerHand > .meme-card:last-child');
                    addedCard.id = `cardID${card.id}`;
                    addedCard.querySelector('.meme-card__meme').style.backgroundImage = `url(src/img/memes/${card.id})`;

                    this.arrangeCardsInHand();

                    this.takingCardAnimation(addedCard);

                    addedCard.style.transition = 'all 0.2s ease-in 0s';


                    })
                );

            }
        });

        await Promise.all(promises);

        this.arrangeCardsInHand();

        playerHand.querySelectorAll('.meme-card').forEach((card) => {
            card.addEventListener('mouseover', this.cardMouseoverHandler);
            card.addEventListener('mouseleave', this.cardMouseleaveHandler);
            card.addEventListener('click', this.cardClickHandler.bind(this));
        });

        let confirmButton = document.getElementById('confirmButton');
        confirmButton.addEventListener('click', this.confirmSelectedCard.bind(this));

    }

    //повернуть(и сдвинуть) карты в руке
    arrangeCardsInHand() {
        let playerHand = document.getElementById('playerHand');
        let playerCards = playerHand.querySelectorAll('.meme-card');

        if (playerCards.length === 0) return;

        //угол поворота между первой и последней картами
        let entireAngle = (playerCards.length - 1) * this.cardBetweenAngle;
        //угол поворота текущей карты (начинаем с карйней левой)
        let curAngle = -entireAngle / 2;

        // let cardWidth = playerCards[0].getBoundingClientRect().width;

        //также можно создать клон одно из карт, убрать у него transform, сделать visibility none, добавить в body,
        //взять его getBoundingClientRect и удалить со страницы
        let cardWidth = playerCards[0].offsetWidth;

        playerCards.forEach((card, cardIndex) => {

            // let deltaHeight = Math.floor(cardWidth * Math.sin(percentsToRadians(Math.abs(curAngle)) / 2));
            let deltaHeight = 0;

            let tempAngle = curAngle;

            //чтобы выстроить карты по дуге, нужно их все (кроме центральной, если нечетное кол-во) сдвигать вниз
            // (т.к. при повороте карты становятся чуть больше по высоте),
            // поэтому сдвиг каждой карты = сдвиг соседней(которая ближе к центру) + сдвиг самой карты,
            //центральная карта(если их нечетное кол-во) не сдвигается
            //можно через рекурсию, но будет слишком сложночитаемо
            if (tempAngle < 0) {
                while (tempAngle < 0) {
                    deltaHeight += this.calculateCardDeltaHeight(cardWidth, tempAngle);
                    tempAngle += this.cardBetweenAngle;
                }
            } else if (tempAngle > 0) {
                while (tempAngle > 0) {
                    deltaHeight += this.calculateCardDeltaHeight(cardWidth, tempAngle);
                    tempAngle -= this.cardBetweenAngle;
                }
            }

            //все карты, кроме крайней левой залезают на соседнюю слева
            if (cardIndex !== 0) {
                card.style.marginLeft = `-${cardWidth * this.cardCoverArea}px`;
            } else {
                card.style.marginLeft = '0px';
            }

            //для карт, повернутых по часовой стрелке, ориджином является точка на верхней границе, удаленная от
            // правой ганицы на величину, на которую она перекрывается следующей картой
            //для карт, повернутых против часовой стрелки - удаленная от левой границы на ту же величину
            //расположение ориджинов в этих точках необходимо, чтобы карты верно позиционировались друг рядом с другом
            if (curAngle < 0) {
                card.style.transformOrigin = `${(this.cardCoverArea) * 100}% top`;
            } else if (curAngle > 0) {
                card.style.transformOrigin = `${(1 - this.cardCoverArea) * 100}% top`;
            } else {
                card.style.transformOrigin = 'center top'
            }

            card.style.transform = `translate(0, ${deltaHeight}px) rotate(${curAngle}deg)`;

            curAngle += this.cardBetweenAngle;
        })
    }

    //обработчик наведения курсора на карту в руке
    cardMouseoverHandler(e) {
        //все равно, что let card = this; :
        let card = e.currentTarget;
        if (!card.style.transform.includes('scale')) {
            // card.style.transformOrigin = 'center top';
            //при наведении, карты из левой половины увеличиваются и перекрывают карты справа,
            // для исправления нужно при наведении немного сдвигать их влево (увеличивать так,
            // как если бы transform-origin был бы по центру верхней грани)
            //сдвигать вверх нужно, чтобы при увеличении карты не вылазили за нижнюю границу экрана
            let fixingTranslate = parseFloat(card.style.transformOrigin) - 50;
            card.style.transform += ` translate( ${fixingTranslate < 0 ? fixingTranslate : 0}%, -${card.clientHeight / 2}px) scale(1.5)`;
        }
    }

    //обработчик увода курсора с карты
    cardMouseleaveHandler(e) {
        let card = e.currentTarget;
        if (card.style.transform.includes('scale')) {
            let index = card.style.transform.lastIndexOf('translate');
            card.style.transform = card.style.transform.slice(0, index);
            // card.style.transformOrigin = origin;
        }
    }

    cardClickHandler(e) {

        if (this.selectedCard !== -1) {
            this.selectedCard.classList.remove('meme-card_selected');
        }

        this.selectedCard = e.currentTarget;

        e.currentTarget.classList.add('meme-card_selected');
    }

    confirmSelectedCard(e) {
        if (this.selectedCard === -1) return;

        let card = this.selectedCard;

        this.selectedCard = -1;

        let clone = card.cloneNode(true);
        clone.style.position = 'absolute';
        let transformProps = clone.style.transform.split(' ');
        clone.style.transform = transformProps.filter((prop) => {
            return (prop.includes('rotate') || prop.includes('scale'))
        }).join(' ');

        let rotation = transformProps.find(prop => prop.includes('rotate'));
        let rotationAngle = rotation ? rotation.slice(rotation.indexOf('(') + 1, rotation.indexOf(')')) : 0;
        rotationAngle = parseFloat(rotationAngle);

        let scale = transformProps.find(prop => prop.includes('scale'));
        let scaleValue = scale ? scale.slice(scale.indexOf('(') + 1, scale.indexOf(')')) : 1;
        scaleValue = parseFloat(scaleValue);

        let cardCoords = card.getBoundingClientRect();

        //нам нужна именно координата левого верхнего угла карты, а не прямоугольника, заключающего эту карту, а
        //т.к. карты повернута, то их углы не совпадают, поэтому находим расстояние между их углами
        let fixingX = rotationAngle > 0 ? Math.sin(degreesToRadians(rotationAngle)) * card.offsetHeight * scaleValue : 0;
        let fixingY = rotationAngle < 0 ? Math.sin(degreesToRadians(rotationAngle)) * card.offsetWidth * scaleValue : 0;

        clone.style.left = `${cardCoords.x + window.scrollX + fixingX}px`;
        clone.style.top = `${cardCoords.y + window.scrollY - fixingY}px`;

        clone.style.marginLeft = '';
        clone.style.transformOrigin = 'left top';
        clone.style.pointerEvents = 'none';
        clone.style.transition = 'top 0.5s ease-in 0s, left 1s ease-in 0s, transform 0.5s ease-in 0s';
        document.body.appendChild(clone)
        setTimeout(() => {
            clone.style.transform = '';
            clone.style.top = `-50%`;
            clone.style.left = '50%';
        }, 0);

        console.log(`x: ${cardCoords.x}; y: ${cardCoords.y}`);
        console.log(`mouseX: ${event.clientX}; mouseY: ${event.clientY}`);
        card.remove();

        this.arrangeCardsInHand();

        clone.addEventListener('transitionend', () => {
           clone.remove();
        });
    }

    takingCardAnimation(card) {

        console.log(`${card.id} animationX: ${card.getBoundingClientRect().x}`);
        let flippingCard = document.createElement('div');
        flippingCard.classList.add('flipping-card');

        let backSide = document.createElement('div');
        backSide.classList.add('flipping-card__back-side');

        let clone = card.cloneNode(true);

        flippingCard.append(clone);
        flippingCard.append(backSide);

        let memeCardDeck = document.getElementById('memeCardDeck');
        let memeCardDeckCoords = memeCardDeck.getBoundingClientRect();
        clone.style.position = 'absolute';
        clone.style.width = '100%';
        clone.style.height = '100%';
        flippingCard.style.left = `${memeCardDeckCoords.x + window.scrollX}px`;
        flippingCard.style.top = `${memeCardDeckCoords.y + window.scrollY}px`;
        clone.style.marginLeft = '';
        flippingCard.style.transform = 'translate(100%, 0) rotateY(180deg)';
        clone.style.transform = '';
        flippingCard.style.transformOrigin = 'left top';
        flippingCard.style.pointerEvents = 'none';
        clone.style.pointerEvents = 'none';
        flippingCard.style.transition = 'top 0.5s ease-in 0s, left 0.5s ease-in 0s, transform 0.5s ease-in 0s';

        flippingCard.style.visibility = 'visible';
        clone.style.visibility = 'visible';


        let transformProps = card.style.transform.split(' ');
        let rotation = transformProps.find(prop => prop.includes('rotate'));
        let rotationAngle = rotation ? rotation.slice(rotation.indexOf('(') + 1, rotation.indexOf(')')) : 0;
        rotationAngle = parseFloat(rotationAngle);

        let scale = transformProps.find(prop => prop.includes('scale'));
        let scaleValue = scale ? scale.slice(scale.indexOf('(') + 1, scale.indexOf(')')) : 1;
        scaleValue = parseFloat(scaleValue);

        let cardCoords = card.getBoundingClientRect();

        let fixingX = rotationAngle > 0 ? Math.sin(degreesToRadians(rotationAngle)) * card.offsetHeight * scaleValue : 0;
        let fixingY = rotationAngle < 0 ? Math.sin(degreesToRadians(rotationAngle)) * card.offsetWidth * scaleValue : 0;

        document.body.append(flippingCard);


        //выставление координат и трансформаций карты в руке:
        setTimeout(() => {
            flippingCard.style.transform = transformProps.filter((prop) => {
                return (prop.includes('rotate') || prop.includes('scale'))
            }).join(' ');
        }, 0);

        flippingCard.style.left = `${cardCoords.x + window.scrollX + fixingX}px`;
        flippingCard.style.top = `${cardCoords.y + window.scrollY - fixingY}px`;
        flippingCard.style.transformOrigin = 'left top';


        flippingCard.addEventListener('transitionend', () => {
            let cardBounding = card.getBoundingClientRect();
            let cloneBounding = clone.getBoundingClientRect()
            // console.log(`Card#${card.id}`);
            // console.log(`cardX: ${cardBounding.x}; cardY: ${cardBounding.y};`);
            // console.log(`cloneX: ${cloneBounding.x}; cloneY: ${cloneBounding.y};`);
            card.style.visibility = 'visible';
            setTimeout(() => {
                flippingCard.remove();
            }, 10);
        });
    }

    /***
     * Расчет дельты высоты карты (половины дельты, считается только приращение высоты с одного конца карты),
     * после поворота на заданный угол
     * @param cardWidth - ширина карты
     * @param angle - угол, на который карта поворачивается
     * @return {number} - приращение высоты карты(половина приращения)
     */
    calculateCardDeltaHeight(cardWidth, angle) {
        return Math.floor(cardWidth * Math.sin(degreesToRadians(Math.abs(angle))) * (1 - this.cardCoverArea))
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

            let sin = Math.sin(degreesToRadians(angle));
            let cos = Math.cos(degreesToRadians(angle));

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