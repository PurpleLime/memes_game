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
        console.log(id);
        let cardIndex = this.cards.findIndex(card => {
            console.log(card.id);
            return card.id === id;
        });
        return cardIndex !== -1 ? this.cards.splice(cardIndex, 1)[0] : null;
    }

    getAllCards() {
        return this.cards;
    }

}