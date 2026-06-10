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
app.get('/aboutus', pageHandler('aboutus', 'json/aboutus.json'));

app.get('/api/aboutus', (req, res) => {
    res.json(loadJson('json/aboutus.json'));
});

app.get('/api/foodbanks', async (req, res) => {
    const lat = req.query.lat || 52.4815;
    const lon = req.query.lon || -1.8899;
    const apiKey = process.env.GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v2/places?categories=service.social_facility.food&filter=circle:${lon},${lat},5000&bias=proximity:${lon},${lat}&limit=20&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const results = data.features.map(f => {
            const props = f.properties || {};
            const postcode = props.postcode || '';
            const area = postcode.split(' ')[0] || 'Unknown';
            const cats = Array.isArray(props.categories) ? props.categories : [];

            let category = 'Food Bank';
            if (cats.some(c => c.includes('homeless')))       category = 'Homeless Support';
            else if (cats.some(c => c.includes('community'))) category = 'Community Food';
            else if (cats.some(c => c.includes('social')))    category = 'Food Support';

            return {
                name: props.name || 'Food Bank',
                address: props.formatted || props.address_line2 || 'Address not available',
                openingTimes: props.opening_hours || 'Contact for times',
                category,
                area
            };
        });

        res.json(results.length ? results : birminghamPlaces);
    } catch (error) {
        console.error("Geoapify fetch error:", error);
        res.json(birminghamPlaces);
    }
});

function pageHandler(viewPath, jsonDataPath = 'json/defaultEmpty.json') {
    return withErrorHandling((req, res) => {
        res.render(viewPath, loadJson(jsonDataPath));
    });
}

function withErrorHandling(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error(`Error rendering a page:`, error);
            next(error);
        }
    };
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