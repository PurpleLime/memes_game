import Lobby from "./Lobby.js";

export default class LobbiesContainer {
    constructor() {
        this.lobbies = [];
    }

    addNewLobby(code) {
        if (!code) {
            do {
                code = this.generateLobbyCode(4);
            } while (this.findLobbyByCode(code) === -1);
        }
        this.lobbies.push(new Lobby(code));
        return code;
    }

    findLobbyByCode(code) {
        return this.lobbies.find(lobby => lobby.code === code);
    }

    generateLobbyCode(codeLength) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = '';
        for (let i = 0; i < codeLength; ++i) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }
}