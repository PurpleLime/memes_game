import { v4 as uuidv4 } from 'uuid';

export default class GameSlot {

    constructor(nickname) {
        this.id = uuidv4();
        this.nickname = nickname;
        this.isHost = false;
    }

    makeHost() {
        this.isHost = true;
    }

    removeHost() {
        this.isHost = false;
    }

}