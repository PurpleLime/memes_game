const http = require('http');

const server = http.createServer((req, res) => {
    console.log('request', req.url);

    if (req.url === '/') {
        res.write('hi');  //записываем что-то в ответ сервера
    }

    res.end(); //заканчиваем ответ сервера (иначе в браузере будет бесконечно крутиться спиннер загрузки страницы)
})

server. listen(3000);