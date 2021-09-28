const express = require("express");
const fs = require("fs")

const app = express();

app.get('/', (request, response) => {
    fs.readFile('src/pages/index.html', 'utf8', (err, html) => {
        response.send(html)
    });
});

app.use(express.static('src/pages'));
app.listen(3000, () => { console.log("App available on http://localhost:3000") });