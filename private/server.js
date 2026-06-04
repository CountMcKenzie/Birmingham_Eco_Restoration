const express = require('express');
require('dotenv').config();
const path = require('path');
const fs = require('fs');


const app = express();
const port = 3000;

app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');
app.use(express.static('../public'));


app.get('/', pageHandler('index', 'json/home.json'));
app.get('/quiz', pageHandler('quiz', 'json/quiz.json'));
app.get('/foodbank', pageHandler('foodbank', 'json/foodbank.json')); 


app.get('/api/foodbanks', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v2/places?categories=service.social_facility.food&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=5&apiKey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const textList = data.features.map(f => `${f.properties.name || 'Food Bank'} — ${f.properties.address_line2}`);
        res.json(textList);
    } catch (error) {
        res.status(500).json(["Could not retrieve data."]);
    }
});

function pageHandler(viewPath, jsonDataPath = 'json/defaultEmpty.json') {
    return withErrorHandling((req, res) => {
        res.render(viewPath, loadJson(jsonDataPath))
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

function loadJson(jsonPath) {
    try {
        const filePath = path.join(__dirname, jsonPath);
        const jsonString = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonString);
    } catch (error) {
        console.error(`Error loading JSON file from "${path}".\n Check that JSON file is correct and not empty:\n`, error);
    }

}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});