export default class CardsList {
    constructor() {
        this.cards = [];
    }

    addCard(id, orientation = 'horizontal') {
        this.cards.push({
            id,
            orientation
        });
    }

    drawCard(id) {
        let cardIndex = this.cards.findIndex(card => {
            return card.id === id;
        });
        return cardIndex !== -1 ? this.cards.splice(cardIndex, 1)[0] : null;
    }

    getAllCards() {
        return this.cards;
    }

    getCardsAmount() {
        return this.cards.length;
    }

}