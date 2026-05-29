const express = require('express');
const path = require('path');
const fs = require('fs');


const app = express();
const port = 3000;

app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');
app.use(express.static('../public'));


app.get('/', pageHandler('index'))

function pageHandler(viewPath, jsonData = 'json/defaultEmpty.json') {
    return withErrorHandling((req, res) => {
        res.render(viewPath, loadJson('defaultEmpty.json'))
    })
}

function withErrorHandling(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error(`Error rendering a page:`, error);
            next(error);
        }
    }
}

function loadJson(path) {
    try {
        const filePath = path.join(__dirname, path);
        const jsonString = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(`Error loading JSON file from "${path}".\n Check that JSON file is correct and not empty:\n`, error);
    }

}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});