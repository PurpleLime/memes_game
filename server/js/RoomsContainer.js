import Room from "./Room.js";

export default class RoomsContainer {
    constructor() {
        this.rooms = [];
    }

    addNewRoom(code) {
        if (!code) {
            do {
                code = this.generateRoomCode(4);
            } while (this.findRoomByCode(code) === -1);
        }
        let newRoom = new Room(code);
        newRoom.on('deleteMe', this.deleteRoom.bind(this));
        this.rooms.push(newRoom);
        return code;
    }

    findRoomByCode(code) {
        return this.rooms.find(room => room.code === code);
    }

    generateRoomCode(codeLength) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = '';
        for (let i = 0; i < codeLength; ++i) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    deleteRoom(code) {
        let deletingRoomIndex = this.rooms.findIndex(room => room.code === code);
        this.rooms.splice(deletingRoomIndex, 1);
    }
}