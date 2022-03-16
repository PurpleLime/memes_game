const http = require('http');
const fs = require('fs');
const mime = require('mime');

const server = http.createServer((req, res) => {
    console.log('request', req.url);

    // if (req.url === '/') {
    //     res.write('hi');  //записываем что-то в ответ сервера
    // }

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

server. listen(3000);