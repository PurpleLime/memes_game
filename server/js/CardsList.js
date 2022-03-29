export default class CardsList {
    constructor() {
        this.cards = [];
    }

    addCard(id) {
        this.cards.push({
            id,
        });
    }

    drawCard(id) {
        let cardIndex = this.cards.findIndex(card => card.id === id);
        return this.cards.splice(cardIndex, 1)[0];
    }

    getAllCards() {
        return this.cards;
    }

}