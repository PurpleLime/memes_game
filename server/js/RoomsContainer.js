import Room from "./Room.js";
import {generateRoomCode} from "./serverUtils.js";

export default class RoomsContainer {
    constructor() {
        this.rooms = [];
        this.roomsCodes = new Set();
    }

    addNewRoom(code) {
        if (!code) {
            do {
                code = generateRoomCode(4);
            } while (this.roomsCodes.has(code));
        }
        this.roomsCodes.add(code);
        let newRoom = new Room(code);
        // newRoom.on('deleteMe', this.deleteRoom.bind(this));
        newRoom.on('deleteMe', (code) => {
            this.deleteRoom(code);
        });
        this.rooms.push(newRoom);
        return code;
    }

    findRoomByCode(code) {
        return this.rooms.find(room => room.code === code);
    }

    deleteRoom(code) {
        let deletingRoomIndex = this.rooms.findIndex(room => room.code === code);
        this.rooms.splice(deletingRoomIndex, 1);
        this.roomsCodes.delete(code);
    }

    checkRoomExistence(code) {
        return this.roomsCodes.has(code);
    }
}