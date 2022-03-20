// const http = require('http');
// const fs = require('fs');
// const mime = require('mime');
// const ws = require('ws');

import http from 'http';
import fs from 'fs';
import mime from 'mime';
import {WebSocketServer} from 'ws';
import express from 'express';

const PORT = process.env.PORT ?? 3000;

const app = express();


const wss = new WebSocketServer({noServer: true}, () => console.log("WebSocket server started"));

const server = http.createServer((req, res) => {

    console.log(acceptWS(req, res));
    if (acceptWS(req, res)) {
        try {
            wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
        }
        catch (e) {
            console.log(e);
        }
        return
    }

    console.log('request', req.url);

    let file = 'index.html';

    if (req.url !== '/') {
        file = req.url.replace('/', '')
    }

    fs.readFile(`public/${file}`, (err, data) => {
        if (err) {
            console.log('error', err);
            res.end();
            return;
        }

        console.log('mime: ', mime.getType(`public/${file}`));
        res.setHeader('Content-Type', mime.getType(`public/${file}`));
        res.write(data);
        res.end();  //заканчиваем ответ сервера (иначе в браузере будет бесконечно крутиться спиннер загрузки страницы)
    })

})

const clients = new Set();

server.listen(3000);


//websocket:

function onSocketConnect(ws) {

    clients.add(ws);

    ws.on('message', function(message) {
        message = message.slice(0, 50); // максимальный размер сообщения 50
        console.log("Получено сообщение: ", String(message));

        for(let client of clients) {
            // client.send(message);
            client.send("Получено");
        }
    });

    ws.on('close', function() {
        clients.delete(ws);
    });

}

function acceptWS(req, res) {
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