import https from 'https';
import fs from 'fs';
import mime from 'mime';
import {WebSocketServer} from 'ws';
import express from 'express';
import path from 'path';
import GameSlot from "./js/GameSlot.js";
import Lobby from "./js/Lobby.js";
import LobbiesContainer from "./js/LobbiesContainer.js";

const __dirname = path.resolve();
const PORT = process.env.PORT ?? 3000;

const wss = new WebSocketServer({noServer: true}, () => console.log("WebSocket server started"));

const app = express();

// app.on('upgrade', function upgrade(request, socket, head) {
//
//     console.log(acceptWS(request));
//
//     if (acceptWS(request)) {
//         try {
//             wss.handleUpgrade(request, socket, Buffer.alloc(0), onSocketConnect);
//         }
//         catch (e) {
//             console.log(e);
//         }
//         return
//     }
// })



// const httpsOptions = {
//     cert: fs.readFileSync('path...'),
//     key: fs.readFileSync('path..')
// }

const lobbies = new LobbiesContainer();
lobbies.addNewLobby('XXXX');

app.get("/createLobby", (req, res) => {
    console.log(`request for creating lobby: ${req.query.nickname}`);
    if  (req.query.nickname) {
        let newLobbyCode = lobbies.addNewLobby();
        res.json({lobbyCode: newLobbyCode});
    }
});

app.get('*', (req, res) => {

    console.log(acceptWS(req));

    if (acceptWS(req)) {
        try {
            wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
        } catch (e) {
            console.log(e);
        }
        return
    }

    console.log('request', req.url);

    let file = 'index.html';

    if (req.url !== '/') {
        file = req.url.replace('/', '')
    }

    console.log('mime: ', mime.getType(path.resolve(__dirname, 'public', file)));
    // res.setHeader('Content-Type', mime.getType(`public/${file}`));

    res.sendFile(path.resolve(__dirname, 'public', file));
})

const clients = new Set();

// lobbies.push(new Lobby('XXXX'));

// https.createServer(httpsOptions, app).listen(PORT, () => {
//     console.log(`Server has been started on port ${PORT}...`);
// })

app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}...`);
})


//websocket:

function onSocketConnect(ws) {

    clients.add(ws);

    ws.on('message', function (message) {
        message = JSON.parse(message);
        console.log("Получено сообщение: ", message);

        // for (let client of clients) {
        //     client.send("Получено");
        // }

        let desiredLobby;

        switch (message.header) {
            case 'checkLobby':
                // desiredLobby = lobbies.find(lobby => lobby.code === message.lobbyCode);
                desiredLobby = lobbies.findLobbyByCode(message.lobbyCode);

                if (desiredLobby !== undefined) {

                    if (!desiredLobby.isFull()) {
                        ws.send(JSON.stringify({
                            header: "checkLobby/ok",
                            lobbyCode: message.lobbyCode,
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            header: "checkLobby/error",
                            errorMessage: "Лобби заполнено"
                        }));
                    }
                }
                break;

            case 'enterLobby':
                // desiredLobby = lobbies.find(lobby => lobby.code === message.lobbyCode);
                desiredLobby = lobbies.findLobbyByCode(message.lobbyCode);

                if (desiredLobby !== undefined) {
                    let slot = new GameSlot(message.userNickname, ws);

                    if (!desiredLobby.isFull()) {
                        desiredLobby.addPlayer(slot);

                        desiredLobby.sendAllExcept({
                            header: "updateLobby",
                            data: desiredLobby,
                        }, slot);

                        ws.send(JSON.stringify({
                            header: "enterLobby/ok",
                            userId: slot.id,
                            data: desiredLobby,
                        }));

                        ws.on('close', function () {
                            desiredLobby.deletePlayerByWS(ws);

                            desiredLobby.sendAllExcept({
                                header: "updateLobby",
                                data: desiredLobby,
                            }, slot);

                        });

                    } else {
                        ws.send(JSON.stringify({
                            header: "enterLobby/error",
                            errorMessage: "Лобби заполнено"
                        }));
                    }
                }

                break;

            case 'leaveLobby':
                ws.close(1000, "выход из лобби");
                break;

            default:
                break;
        }
    });

    // ws.on('close', function (code, reason) {
    //     console.log(`WebSocket закрыт с кодом ${code} причина: ${String(reason)}`);
    //     clients.delete(ws);
    // });

}

function acceptWS(req) {
    // все входящие запросы должны использовать websockets
    //а примере было !=
    if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() !== 'websocket') {
        // res.end();
        return false;
    }

    // может быть заголовок Connection: keep-alive, Upgrade
    if (!req.headers.connection.match(/\bupgrade\b/i)) {
        // res.end();
        return false;
    }

    return true;

    // wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
}