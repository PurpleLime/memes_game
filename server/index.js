import https from 'https';
import fs from 'fs';
import mime from 'mime';
import {WebSocketServer} from 'ws';
import express from 'express';
import path from 'path';
import GameSlot from "./js/GameSlot.js";
import Room from "./js/Room.js";
import RoomsContainer from "./js/RoomsContainer.js";
import serveStatic from "serve-static";

const __dirname = path.resolve();
const PORT = process.env.PORT ?? 3000;

const wss = new WebSocketServer({noServer: true}, () => console.log("WebSocket server started"));

const app = express();

app.use(serveStatic(path.join(__dirname, 'public'),{
    extensions: ['png'],
}));

//TODO: options
app.use(express.json({limit: "300Kb"}));
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
    if (req.query.nickname) {
        let newRoomCode = rooms.addNewRoom();
        res.json({roomCode: newRoomCode});
    }
});

// app.get('*', (req, res) => {
//
//     if (acceptWS(req)) {
//         try {
//             wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
//         } catch (e) {
//             console.log(e);
//         }
//         return
//     }
//
//
//     let file = 'index.html';
//
//     if (req.url !== '/') {
//         file = req.url.replace('/', '')
//     }
//
//     // res.setHeader('Content-Type', mime.getType(`public/${file}`));
//
//     if (file.includes('src/img/memes/')) {
//         file += '.png';
//     }
//
//     res.sendFile(path.resolve(__dirname, 'public', file));
// })

const clients = new Set();

// https.createServer(httpsOptions, app).listen(PORT, () => {
//     console.log(`Server has been started on port ${PORT}...`);
// })

const server = app.listen(PORT, () => {
    console.log(`Server has been started on port ${PORT}...`);
})

server.on('upgrade', function upgrade(request, socket, head) {

    // console.log(acceptWS(request));

    if (acceptWS(request)) {
        try {
            wss.handleUpgrade(request, socket, Buffer.alloc(0), onSocketConnect);
        }
        catch (e) {
            console.log(e);
        }
        return
    }
})




//websocket:
function onSocketConnect(ws) {

    clients.add(ws);
    let slot;

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

                if (!rooms.checkRoomExistence(message.roomCode)) {
                    ws.send(JSON.stringify({
                        header: "checkRoom/error",
                        errorMessage: "Комната не существует"
                    }));
                    break;
                }

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
                if (!desiredRoom) break;
                slot = desiredRoom.findPlayerByWS(ws);
                if (!slot) break;
                if (slot.isHost) {

                    if (desiredRoom.slots.length < 1) {
                        ws.send(JSON.stringify({
                            header: "startRoom/error",
                            errorMessage: "Недостаточно игроков для начала игры"
                        }));
                        break;
                    }

                    console.log("Начало игры");
                    desiredRoom.prepareToStartGame();
                    desiredRoom.sendToAll({
                        header: 'startGame/ok',
                        slots: desiredRoom.slots,
                    }, {needUpdateCards: true});
                    setTimeout(() => {
                        desiredRoom.startGame();
                    }, 1000);
                } else {
                    ws.send(JSON.stringify({
                        header: "startRoom/error",
                        errorMessage: "Нет прав для начала игры"
                    }));
                }
                break;

            case 'turnDone':
                desiredRoom = rooms.findRoomByCode(message.roomCode);
                if (!desiredRoom || desiredRoom.isTurnDone) break;
                slot = desiredRoom.findPlayerByWS(ws);
                if (!slot) break;
                let confirmedCard = slot.drawCard(Number(message.confirmedCardId));
                if (!confirmedCard) break;
                desiredRoom.playedMemesCards.addCard(confirmedCard.id);
                desiredRoom.roundResultsList.push({
                    cardId: confirmedCard.id,
                    cardOrientation: confirmedCard.orientation,
                    slotIndex: desiredRoom.slots.findIndex((slt) => slt === slot),
                });
                desiredRoom.isTurnDone = true;
                desiredRoom.sendToAll({
                    header: 'turnDone/ok',
                    confirmedCardId: confirmedCard.id,
                    confirmedCardOrientation: confirmedCard.orientation,
                });

                new Promise((resolve) => {
                    desiredRoom.skipPopupController = new AbortController();
                    desiredRoom.skipPopupController.signal.addEventListener('abort', resolve);
                    setTimeout(() => resolve(), 12000);
                }).then(() => {
                    desiredRoom.updateTurnData();
                })

                break;

            case 'skipPopup':
                desiredRoom = rooms.findRoomByCode(message.roomCode);
                if (!desiredRoom) break;
                slot = desiredRoom.findPlayerByWS(ws);
                if (!slot) break;
                slot.skipPopup = true;
                if (desiredRoom.allSkippedPopup()) {
                    desiredRoom.skipPopupController.abort();
                    desiredRoom.disableAllSkipsPopup();
                }

                break;

            case 'roundWinnerIsChosen':
                desiredRoom = rooms.findRoomByCode(message.roomCode);
                if (!desiredRoom) break;
                slot = desiredRoom.findPlayerByWS(ws);
                if (!slot) break;
                let slotIndex = desiredRoom.slots.findIndex((slt) => slt === slot);
                if (slotIndex !== desiredRoom.curJudgeIndex) break;
                desiredRoom.roundWinnerIsChosen(message.cardId);
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