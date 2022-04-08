export default class CardsList {
    constructor() {
        this.cards = [];
    }

    addCard(id, orientation = 'vertical') {
        if (id > 1000) {
            orientation = 'horizontal';
        }
        this.cards.push({
            id,
            orientation
        });
    }

    shuffle() {
        //алгоритм "Тасование Фишера — Йетса"
        for (let i = this.cards.length - 1; i > 0; --i) {

            // случайный индекс от 0 до i
            let j = Math.floor(Math.random() * (i + 1));

            // поменять элементы местами
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    drawCard(id) {
        let cardIndex = this.cards.findIndex(card => {
            return card.id === id;
        });
        return cardIndex !== -1 ? this.cards.splice(cardIndex, 1)[0] : null;
    }

    drawFirstCard() {
        return this.getCardsAmount() !== 0 ? this.cards.splice(0, 1)[0] : null;
    }

    getAllCards() {
        return this.cards;
    }

    clear() {
        this.cards.splice(0, this.getCardsAmount());
    }

    getCardsAmount() {
        return this.cards.length;
    }

}