import https from 'https';
import fs from 'fs';
import mime from 'mime';
import {WebSocketServer} from 'ws';
import express from 'express';
import path from 'path';
import GameSlot from "./js/GameSlot.js";
import Lobby from "./js/Lobby.js";

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

const lobbies = [];
lobbies.push(new Lobby('XXXX'));

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

        switch (message.messageType) {
            case 'connectLobby':
                let desiredLobby = lobbies.filter(lobby => lobby.code === message.lobbyCode);

                if (desiredLobby[0] !== undefined) {
                    let slot = new GameSlot(message.userNickname);

                    if (!desiredLobby[0].isFull()) {
                        desiredLobby[0].addPlayer(slot);
                        ws.send(JSON.stringify({
                            header: "lobbyInfo/ok",
                            data: desiredLobby[0],
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            header: "lobbyInfo/error",
                            errorMessage: "Лобби заполнено"
                        }));
                    }
                }
                break;

            default:
                break;
        }
    });

    ws.on('close', function () {
        clients.delete(ws);
    });

}

function acceptWS(req) {
    // все входящие запросы должны использовать websockets
    if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
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