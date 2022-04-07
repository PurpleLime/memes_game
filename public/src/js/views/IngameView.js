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
        this.selectedCard = null;
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

        let situationCardDeck = document.getElementById('situationCardDeck');
        situationCardDeck.addEventListener('mouseover', this.showExtraSituationCard);
        situationCardDeck.addEventListener('mouseleave', this.hideExtraSituationCard);

        let confirmButton = document.getElementById('confirmButton');
        confirmButton.addEventListener('click', this.confirmSelectedCard.bind(this));

        this.renderPlayers();
        this.setUsersPositionsByCoords();

        // this.renderPlayerHand();
        // this.takingSituationCardAnimation();
    }

    newTurn() {
        this.updateConfirmButton();
        this.updateSelfJudgeEmblem();
        this.updateYourTurnTitle();
        this.updateCurrentPlayer();

    }

    newRound() {
        // this.updateMyTurnTitle();
        // this.updateConfirmButton();
        // this.updateSelfJudgeEmblem();
        this.newTurn();

        this.updatePlayersScores();
        this.updateJudge();

        this.renderPlayerHand()
            .then(() => this.removingSituationCardAnimation())
            .then(() => this.takingSituationCardAnimation());

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

        // let playerSlot = this._model.slots.find(slot => slot.id === this._model.playerId);
        // let playerCards = playerSlot.cards;

        let playerCards = this._model.cards;
        console.log(`playerCards: ${playerCards}`);

        //удаляем из руки карты, которых не должно быть
        playerHand.querySelectorAll('.meme-card').forEach((memeCard) => {
            if (!playerCards.find(card => `cardID${card.id}` === memeCard.id)) {
                memeCard.remove();
                this.arrangeCardsInHand();
            }
        })

        //добавляем в руку карты, которых не хватает
        let promises = [];
        let promiseCounter = 1;
        playerCards.forEach((card) => {
            if (!playerHand.querySelector(`#cardID${card.id}`)) {
                promises.push(new Promise((resolve, reject) => {
                        setTimeout(() => resolve(), 800 * promiseCounter++);
                    }).then(() => {
                        playerHand.insertAdjacentHTML('beforeend', ingameCardTemplate({}));
                        let addedCard = document.querySelector('#playerHand > .meme-card:last-child');
                        addedCard.id = `cardID${card.id}`;
                        addedCard.querySelector('.meme-card__meme').style.backgroundImage = `url(src/img/memes/${card.id})`;

                        addedCard.addEventListener('mouseover', this.cardMouseoverHandler);
                        addedCard.addEventListener('mouseleave', this.cardMouseleaveHandler);
                        addedCard.addEventListener('click', this.cardClickHandler.bind(this));

                        this.arrangeCardsInHand();

                        this.takingMemeCardAnimation(addedCard);

                        addedCard.style.transition = 'all 0.2s ease-in 0s';


                    })
                );

            }
        });

        return new Promise((resolve) => {
            resolve(Promise.all(promises));

        }).then(() => {
            this.arrangeCardsInHand();
        });

        // await Promise.all(promises);

        // this.arrangeCardsInHand();


    }

    updateConfirmButton() {
        let confirmButton = document.getElementById('confirmButton');
        if (this._model.isMyTurn) {
            confirmButton.classList.remove('disabled-button');
        } else {
            confirmButton.classList.add('disabled-button');
        }
    }

    updateSelfJudgeEmblem() {
        let selfJudgeEmblem = document.getElementById('selfJudgeEmblem');
        if (this._model.slotIndex === this._model.curJudgeIndex) {
            selfJudgeEmblem.classList.remove('self_judge_emblem_none');
        } else {
            selfJudgeEmblem.classList.add('self_judge_emblem_none');
        }
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

        if (this.selectedCard !== null) {
            this.selectedCard.classList.remove('meme-card_selected');
        }

        this.selectedCard = e.currentTarget;

        e.currentTarget.classList.add('meme-card_selected');
    }

    confirmSelectedCard(e) {
        console.log(`confirmSelectedCard:\nisMyTurn: ${this._model.isMyTurn}\nisTurnDone: ${this._model.isTurnDone}\nselectedCard: ${this.selectedCard}`);

        if (!this._model.isMyTurn || this._model.isTurnDone) return;

        if (this.selectedCard === null) return;


        let confirmButton = document.getElementById('confirmButton');
        confirmButton.classList.add('disabled-button');

        let card = this.selectedCard;

        this.selectedCard = null;

        this.removingMemeCardAnimation(card);

        let cardId = card.id.match(/\d+/);
        if (cardId === null) return;
        this.emit('confirmCard', card.id.match(/\d+/)[0]);

    }

    removingMemeCardAnimation(card) {
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

        card.remove();

        this.arrangeCardsInHand();

        clone.addEventListener('transitionend', () => {
            clone.remove();
        });
    }

    takingMemeCardAnimation(card) {

        let flippingCard = document.createElement('div');
        flippingCard.classList.add('flipping-card');

        let backSide = document.createElement('div');
        backSide.classList.add('flipping-card__back-side');
        backSide.classList.add('flipping-card__back-side_meme');

        let memeIcon = document.createElement('div');
        memeIcon.classList.add('meme-card-icon');

        backSide.append(memeIcon);

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
        flippingCard.style.width = `${memeCardDeckCoords.width}px`;
        flippingCard.style.height = `${memeCardDeckCoords.height}px`;
        clone.style.marginLeft = '';
        flippingCard.style.transform = 'translate(100%, 0) rotateY(180deg)';
        clone.style.transform = 'none';
        flippingCard.style.transformOrigin = 'left top';
        flippingCard.style.pointerEvents = 'none';
        clone.style.pointerEvents = 'none';
        flippingCard.style.transition = 'top 0.5s ease-in, left 0.5s ease-in, transform 0.5s ease-in, width 0.5s ease-in, height 0.5s ease-in';

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
        flippingCard.style.width = `${card.offsetWidth}px`;
        flippingCard.style.height = `${card.offsetHeight}px`;


        flippingCard.addEventListener('transitionend', () => {
            card.style.visibility = 'visible';
            setTimeout(() => {
                flippingCard.remove();
            }, 10);
        });
    }

    showPopupCard() {
        let popupCard = document.createElement('div');
        popupCard.classList.add('meme-card');
        popupCard.classList.add('meme-card_nohover');
        let popupCardMeme = document.createElement('div');
        popupCardMeme.classList.add('meme-card__meme');
        popupCardMeme.style.backgroundImage = `url(src/img/memes/${this._model.confirmedCardId})`
        popupCard.append(popupCardMeme);

        popupCard.id = 'popupCard';
        popupCard.style.position = 'absolute';
        popupCard.style.zIndex = '3';
        popupCard.style.pointerEvents = 'none';
        popupCard.style.left = '50%';
        popupCard.style.top = '-40%';
        popupCard.style.transformOrigin = 'center center';
        popupCard.style.visibility = 'visible';
        popupCard.style.transform = 'translate(-50%, -50%) scale(2.5)';
        popupCard.style.transition = 'all 0.6s ease-in'
        popupCard.style.borderWidth = '3px';
        popupCard.style.animation = 'animation-popup-card 0.6s ease-in 1'
        popupCard.style.animationFillMode = 'forwards';

        let closeButton = document.createElement('div');
        closeButton.classList.add('standart-button');
        closeButton.classList.add('standart-button_size_xs');
        let closeIcon = document.createElement('div');
        closeIcon.classList.add('close-icon');
        closeButton.append(closeIcon);

        closeButton.style.position = 'absolute';
        closeButton.style.top = '0';
        closeButton.style.left = '105%';
        closeButton.style.pointerEvents = 'auto';
        closeButton.style.visibility = 'hidden';
        closeButton.style.opacity = '0';
        closeButton.style.transition = 'opacity 0.3s linear'
        closeButton.addEventListener('click', this.popupCloseButtonClickHandler.bind(this));


        if (this._model.confirmedCardOrientation === 'horizontal') {
            popupCard.style.transform += 'rotate(90deg)';
            closeButton.style.left = '0';
            closeButton.style.top = '';
            closeButton.style.bottom = '105%';
        }


        popupCard.append(closeButton);

        document.body.append(popupCard);

        popupCard.addEventListener('animationend', () => {
            setTimeout(() => {
                closeButton.style.visibility = 'visible';
                closeButton.style.opacity = '1';
                popupCard.style.top = '40%';
                popupCard.style.animation = 'none';
            }, 1000);
        })

        setTimeout(() => {
            this.hidePopupCard();
        }, 10000);

    }

    popupCloseButtonClickHandler() {
        this.hidePopupCard();
    }

    roundWinnerCloseButtonClickHandler() {
        this.hideRoundWinner();
    }

    hidePopupCard() {
        let popupCard = document.getElementById('popupCard');
        if (!popupCard) return;

        popupCard.style.top = '-40%';

        popupCard.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'top') return;
            popupCard.remove();
            this.emit('skipPopup');
        })
    }

    takingSituationCardAnimation() {
        return new Promise((resolve) => {
            let flippingCard = document.createElement('div');
            flippingCard.classList.add('flipping-card');

            let backSide = document.createElement('div');
            backSide.classList.add('flipping-card__back-side');
            backSide.classList.add('flipping-card__back-side_situation');
            // backSide.classList.add('situation-card_backside');
            // backSide.style.transform = '';

            let situationIcon = document.createElement('div');
            situationIcon.classList.add('situation-card-icon');

            backSide.append(situationIcon);

            let frontSide = document.createElement('div');
            frontSide.classList.add('situation-card-deck');
            frontSide.style.top = 'unset';
            frontSide.style.left = 'unset';
            frontSide.style.position = 'absolute';
            frontSide.style.width = '100%';
            frontSide.style.height = '100%';
            frontSide.style.transform = 'none';
            frontSide.textContent = this._model.situation;

            // let clone = card.cloneNode(true);

            flippingCard.append(frontSide);
            flippingCard.append(backSide);

            let situationCardDeck = document.getElementById('situationCardDeck');
            let situationCardDeckCoords = situationCardDeck.getBoundingClientRect();

            flippingCard.style.left = `${situationCardDeckCoords.x + window.scrollX}px`;
            flippingCard.style.top = `${situationCardDeckCoords.y + window.scrollY}px`;
            flippingCard.style.width = `${situationCardDeckCoords.width}px`;
            flippingCard.style.height = `${situationCardDeckCoords.height}px`;
            flippingCard.style.transform = 'translate(-100%, 0) rotateY(-180deg)';
            flippingCard.style.transformOrigin = 'right center';
            flippingCard.style.pointerEvents = 'none';
            flippingCard.style.transition = 'top 0.5s ease-in, left 0.5s ease-in, transform 0.5s ease-in, width 0.5s ease-in, height 0.5s ease-in';
            flippingCard.style.visibility = 'visible';

            document.body.append(flippingCard);

            // flippingCard.style.left = `${cardCoords.x + window.scrollX + fixingX}px`;
            // flippingCard.style.top = `${cardCoords.y + window.scrollY - fixingY}px`;
            // flippingCard.style.transformOrigin = 'left top';
            // flippingCard.style.width = `${card.offsetWidth}px`;
            // flippingCard.style.height = `${card.offsetHeight}px`;

            setTimeout(() => {
                // flippingCard.style.transform = 'rotateY(180deg) translate(-20%, 0)';
                flippingCard.style.animation = 'animation-situation-card-take 2s ease-in 1'
                flippingCard.style.animationFillMode = 'forwards';
            }, 0);


            flippingCard.addEventListener('animationend', () => {
                //тут же удаляются и все дети у situationCardDeck
                situationCardDeck.textContent = frontSide.textContent;
                flippingCard.remove();
                resolve();
            })

        });
    }

    removingSituationCardAnimation() {
        return new Promise((resolve) => {

            let card = document.getElementById('situationCardDeck');

            console.log(`Строка ситуации пустая? - ${card.textContent === ''}`);
            if (card.textContent === '') {
                resolve();
                return;
            }

            let clone = card.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.transform = 'none';

            let cardCoords = card.getBoundingClientRect();

            clone.style.left = `${cardCoords.x + window.scrollX}px`;
            clone.style.top = `${cardCoords.y + window.scrollY}px`;

            clone.style.transition = 'top 0.5s ease-in 0s, left 1s ease-in 0s, transform 0.5s ease-in 0s';

            clone.style.animation = 'animation-situation-card-remove 0.5s ease-in 1'
            clone.style.animationFillMode = 'forwards';

            document.body.append(clone);

            let situationIcon = document.createElement('div');
            situationIcon.classList.add('situation-card-icon');

            card.textContent = '';
            card.append(situationIcon);

            clone.addEventListener('animationend', () => {
                clone.remove();
                resolve();
            });

        });

    }

    showExtraSituationCard(e) {
        let situationCard = e.currentTarget;
        let extraSituationCard = document.getElementById('extraSituationCard');
        if (situationCard.textContent === '') return;
        extraSituationCard.textContent = situationCard.textContent;
        situationCard.textContent = '';
        extraSituationCard.style.display = 'block';
    }

    hideExtraSituationCard(e) {
        let situationCard = document.getElementById('situationCardDeck');
        let extraSituationCard = document.getElementById('extraSituationCard');
        console.log(extraSituationCard.style.display);
        if (extraSituationCard.style.display === 'none' || extraSituationCard.style.display === '') return;
        situationCard.textContent = extraSituationCard.textContent;
        extraSituationCard.style.display = 'none';
    }

    showRoundResults() {
        let roundResults = this._model.roundResults;

        let container = document.getElementById('container');
        let roundResultsContainer = container.cloneNode(false);

        container.classList.add('container_nopointer');

        roundResultsContainer.id = 'roundResultsContainer';
        roundResultsContainer.classList.add('round-results-container');
        roundResultsContainer.style.animation = 'animation-show-round-results-container 1s ease-out 1'
        roundResultsContainer.style.animationFillMode = 'forwards';

        let roundResultsTitle = document.createElement('div');
        roundResultsTitle.classList.add('round-results-title');
        roundResultsTitle.textContent = 'Выбери победителя';

        let resultsList = document.createElement('div');
        resultsList.classList.add('results-list');

        roundResults.forEach((result) => {
            let card = document.createElement('div');
            card.classList.add('meme-card');
            card.classList.add('meme-card_size_m');
            card.style.visibility = 'visible';
            card.id = result.cardId;


            let meme = document.createElement('div');
            meme.classList.add('meme-card__meme');
            meme.style.backgroundImage = `url(src/img/memes/${result.cardId})`;

            if (result.cardOrientation === 'horizontal') card.style.transform = 'rotate(90deg)';

            card.append(meme);
            resultsList.append(card);

            card.addEventListener('click', () => {
                this.hideRoundResults().then(() => {
                    this.emit('roundWinnerIsChosen', card.id);
                });
            });

        });

        roundResultsContainer.append(roundResultsTitle);
        roundResultsContainer.append(resultsList);

        let wrapper = document.getElementById('wrapper');
        wrapper.append(roundResultsContainer);
    }

    hideRoundResults() {
        return new Promise((resolve) => {

            let container = document.getElementById('container');
            container.classList.remove('container_nopointer');

            let roundResultsContainer = document.getElementById('roundResultsContainer');
            roundResultsContainer.classList.add('container_nopointer');

            if (!roundResultsContainer) {
                resolve();
                return;
            }

            roundResultsContainer.addEventListener('animationend', (e) => {
                roundResultsContainer.remove();
                resolve();
            })

            roundResultsContainer.style.animation = 'animation-hide-round-results-container 1s ease-in 1';
        });
    }

    showRoundWinner() {
        let winnerCard = document.createElement('div');
        winnerCard.classList.add('meme-card');
        winnerCard.classList.add('meme-card_nohover');

        let winnerCardMeme = document.createElement('div');
        winnerCardMeme.classList.add('meme-card__meme');
        winnerCardMeme.style.backgroundImage = `url(src/img/memes/${this._model.roundWinnerCardId})`

        winnerCard.append(winnerCardMeme);

        winnerCard.id = 'roundWinnerCard';

        winnerCard.style.position = 'absolute';
        winnerCard.style.zIndex = '3';
        winnerCard.style.pointerEvents = 'none';
        winnerCard.style.left = '50%';
        winnerCard.style.top = '-40%';
        winnerCard.style.transformOrigin = 'center center';
        winnerCard.style.visibility = 'visible';
        winnerCard.style.transform = 'translate(-50%, -50%) scale(2.5)';
        winnerCard.style.transition = 'all 0.6s ease-in'
        winnerCard.style.borderWidth = '3px';
        winnerCard.style.animation = 'animation-popup-card 0.6s ease-in 1'
        winnerCard.style.animationFillMode = 'forwards';

        let closeButton = document.createElement('div');
        closeButton.classList.add('standart-button');
        closeButton.classList.add('standart-button_size_xs');
        let closeIcon = document.createElement('div');
        closeIcon.classList.add('close-icon');
        closeButton.append(closeIcon);

        closeButton.style.position = 'absolute';
        closeButton.style.top = '0';
        closeButton.style.left = '105%';
        closeButton.style.pointerEvents = 'auto';
        closeButton.style.visibility = 'hidden';
        closeButton.style.opacity = '0';
        closeButton.style.transition = 'opacity 0.3s linear'
        closeButton.addEventListener('click', this.roundWinnerCloseButtonClickHandler.bind(this));

        let roundWinnerTitle = document.createElement('div');
        roundWinnerTitle.classList.add('round-winner-title');
        roundWinnerTitle.textContent = 'Победитель раунда';

        let roundWinnerNickname = document.createElement('div');
        roundWinnerNickname.classList.add('round-winner-nickname');
        roundWinnerNickname.textContent = this._model.roundWinnerNickname;

        console.log(this._model.roundWinnerOrientation);
        if (this._model.roundWinnerOrientation === 'horizontal') {
            winnerCard.style.transform += ' rotate(90deg)';

            closeButton.style.left = '0';
            closeButton.style.top = '';
            closeButton.style.bottom = '105%';

            roundWinnerTitle.style.top = '50%';
            roundWinnerTitle.style.left = '-30%';
            roundWinnerTitle.style.transform = 'translate(-50%, -50%) rotate(-90deg)';

            roundWinnerNickname.style.top = '50%';
            roundWinnerNickname.style.left = '113%';
            roundWinnerNickname.style.transform = 'translate(-50%, -50%) rotate(-90deg)';
        }

        winnerCard.append(closeButton);
        winnerCard.append(roundWinnerTitle);
        winnerCard.append(roundWinnerNickname);

        document.body.append(winnerCard);

        winnerCard.addEventListener('animationend', () => {
            setTimeout(() => {
                closeButton.style.visibility = 'visible';
                closeButton.style.opacity = '1';
                winnerCard.style.top = '40%';
                winnerCard.style.animation = 'none';
            }, 1000);
        })

        setTimeout(() => {
            this.hideRoundWinner();
        }, 3000);


    }

    hideRoundWinner() {
        let roundWinner = document.getElementById('roundWinnerCard');
        if (!roundWinner) return;

        roundWinner.style.top = '-40%';

        roundWinner.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'top') return;
            roundWinner.remove();
        })
    }

    updatePlayersScores() {
        let players = this._model.slots;
        players.forEach((player, playerIndex) => {
            if (playerIndex === this._model.slotIndex) {
                let selfScore = document.getElementById('selfScore');
                selfScore.querySelector('.self-score-block__score-amount').textContent = player.score;

            } else {
                let playerSlot = document.getElementById(`playerSlot${playerIndex}`);
                playerSlot.querySelector('.user-game-avatar__score-amount').textContent = player.score;
            }
        });
    }

    updateYourTurnTitle() {
        console.log('myTurn');
        if (!this._model.isMyTurn) return;
        let yourTurnTitle = document.createElement('div');
        yourTurnTitle.classList.add('your-turn-title');
        yourTurnTitle.style.animation = 'animation-show-your-turn-title 0.6s ease-out 1';
        yourTurnTitle.style.transition = 'top 0.6s ease-in'
        yourTurnTitle.style.animationFillMode = 'forwards';
        yourTurnTitle.textContent = 'Твой ход';

        yourTurnTitle.addEventListener('transitionend', () => {
            yourTurnTitle.remove();
        });

        yourTurnTitle.addEventListener('animationend', () => {
            yourTurnTitle.style.animation = 'none';
            setTimeout(() => {
                yourTurnTitle.style.top = '-20%';
            }, 3000);
        })

        document.body.append(yourTurnTitle);
    }

    updateCurrentPlayer() {
        let players = this._model.slots;
        players.forEach((player, playerIndex) => {
            if (playerIndex === this._model.slotIndex) return;

            let playerSlot = document.getElementById(`playerSlot${playerIndex}`);
            if (playerIndex === this._model.playerTurnIndex) {
                playerSlot.classList.add('user-game-avatar_current');
            } else {
                playerSlot.classList.remove('user-game-avatar_current');
            }
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

    updateJudge() {
        let slots = this._model.slots;
        slots.forEach((slot, slotIndex) => {

            let userSlot = document.getElementById(`playerSlot${slotIndex}`);
            if (!userSlot) return;

            let emblem = userSlot.querySelector('.user-game-avatar__judge-emblem');

            if (slotIndex !== this._model.curJudgeIndex) {
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