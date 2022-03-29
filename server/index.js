import https from 'https';
import fs from 'fs';
import mime from 'mime';
import {WebSocketServer} from 'ws';
import express from 'express';
import path from 'path';
import GameSlot from "./js/GameSlot.js";
import Room from "./js/Room.js";
import RoomsContainer from "./js/RoomsContainer.js";

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

const rooms = new RoomsContainer();
rooms.addNewRoom('XXXX');

app.get("/createRoom", (req, res) => {
    console.log(`request for creating room: ${req.query.nickname}`);
    if  (req.query.nickname) {
        let newRoomCode = rooms.addNewRoom();
        res.json({roomCode: newRoomCode});
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

        let desiredRoom;

        switch (message.header) {
            case 'checkRoom':
                // desiredRoom = rooms.find(room => room.code === message.roomCode);
                desiredRoom = rooms.findRoomByCode(message.roomCode);

                if (desiredRoom !== undefined) {

                    if (!desiredRoom.isFull()) {
                        ws.send(JSON.stringify({
                            header: "checkRoom/ok",
                            roomCode: message.roomCode,
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            header: "checkRoom/error",
                            errorMessage: "Комната заполнена"
                        }));
                    }
                }
                break;

            case 'enterRoom':
                desiredRoom = rooms.findRoomByCode(message.roomCode);

                if (desiredRoom !== undefined) {
                    let slot = new GameSlot(message.userNickname, ws);

                    if (!desiredRoom.isFull()) {
                        desiredRoom.addPlayer(slot);

                        desiredRoom.sendToAllExcept({
                            header: "updateRoom",
                            data: desiredRoom,
                        }, slot);

                        ws.send(JSON.stringify({
                            header: "enterRoom/ok",
                            isHost: slot.isHost,
                            userId: slot.id,
                            data: desiredRoom,
                        }));

                        ws.on('close', function () {
                            desiredRoom.deletePlayerByWS(ws);

                            console.log(rooms);

                            desiredRoom.sendToAllExcept({
                                header: "updateRoom",
                                data: desiredRoom,
                            }, slot);

                        });

                    } else {
                        ws.send(JSON.stringify({
                            header: "enterRoom/error",
                            errorMessage: "Комната заполнена"
                        }));
                    }
                }

                break;

            case 'leaveLobby':
                ws.close(1000, "выход из лобби");
                break;

            case 'startGame':
                desiredRoom = rooms.findRoomByCode(message.roomCode);
                let slot = desiredRoom.findPlayerByWS(ws);
                if (slot.isHost) {
                    console.log("Начало игры");
                    desiredRoom.startGame();
                    desiredRoom.sendToAll({
                        header: 'startGame/ok'
                    });
                }
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
    //в примере было !=
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