const express = require('express');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, '../public/views'));
app.set('view engine', 'ejs');
app.use(express.static('../public'));
app.use(express.json());

const db = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const birminghamPlaces = [
    { name: "Birmingham Central Foodbank", address: "Bartholomew Street, Birmingham, B5 5NY", openingTimes: "Tue & Fri 10am - 1:30pm", category: "Food Bank", area: "B5" },
    { name: "Ladywood Foodbank", address: "St John's & St Peter's Church, Ladywood, B16 8SZ", openingTimes: "Thu 12pm - 2pm", category: "Food Bank", area: "B16" },
    { name: "SIFA Fireside", address: "48-52 Allcock Street, Deritend, B9 4DY", openingTimes: "Mon-Fri 9am - 12:30pm", category: "Homeless Support", area: "B9" },
    { name: "Birmingham Settlement", address: "359-361 Witton Road, Aston, B6 6NS", openingTimes: "Wed & Thu 10am - 1pm", category: "Food Bank", area: "B6" },
    { name: "Karis Neighbour Scheme", address: "Belgrave Road, Edgbaston, B15 3PP", openingTimes: "Mon-Thu 9am - 4pm (appointment only)", category: "Food Support", area: "B15" },
    { name: "Birmingham City Mission", address: "The ForBusiness Centre, B19 3NH", openingTimes: "Tue & Wed 10am - 2pm", category: "Food Bank", area: "B19" },
    { name: "St Luke's Church", address: "Great Colmore Street, Lee Bank, B15 2AT", openingTimes: "Wed 10am - 12pm", category: "Community Food", area: "B15" },
    { name: "Birmingham Care Group", address: "Kitts Green Road, Birmingham, B33 9HG", openingTimes: "Mon-Fri 9:30am - 3:30pm", category: "Food Support", area: "B33" },
    { name: "Trussell Trust - Northfield", address: "Northfield, Birmingham, B31", openingTimes: "Contact for times", category: "Food Bank", area: "B31" },
    { name: "Aston Community Food Aid", address: "Aston, Birmingham, B6", openingTimes: "Sat 10am - 12pm", category: "Food Bank", area: "B6" }
];

function getPlacesNearAddress(address) {
    const upper = address.toUpperCase();
    const match = upper.match(/\bB(\d{1,2})\b/);

    if (!match) {
        return birminghamPlaces;
    }

    const userNum = parseInt(match[1]);

    const sorted = birminghamPlaces.slice().sort((a, b) => {
        const aNum = parseInt(a.area.replace("B", ""));
        const bNum = parseInt(b.area.replace("B", ""));
        const aDiff = Math.abs(aNum - userNum);
        const bDiff = Math.abs(bNum - userNum);
        return aDiff - bDiff;
    });

    return sorted.slice(0, 8);
}


app.get('/', pageHandler('index', 'json/home.json'));
app.get('/quiz', pageHandler('quiz', 'json/quiz.json'));
app.get('/foodbank', pageHandler('foodbank', 'json/foodbank.json'));
app.get('/aboutus', pageHandler('aboutus', 'json/aboutus.json'));



app.get('/api/foodbanks', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v2/places?categories=service.social_facility.food&filter=circle:${-1.8899},${52.4815},5000&bias=proximity:${-1.8899},${52.4815}&limit=20&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const textList = data.features.map(f => `${f.properties.name || 'Food Bank'} — ${f.properties.address_line2}`);
        res.json(textList);
    } catch (error) {
        res.status(500).json(["Could not retrieve data."]);
    }
});

app.post('/api/foodsupport', async (req, res) => {
    const formData = req.body;
    formData.submittedAt = new Date().toISOString();

    const submissionsPath = path.join(__dirname, 'submissions.json');
    let submissions = [];

    if (fs.existsSync(submissionsPath)) {
        const fileContent = fs.readFileSync(submissionsPath, 'utf8');
        submissions = JSON.parse(fileContent);
    }

    submissions.push(formData);
    fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2));

    try {
        await db.query(
            `INSERT INTO submissions
                (role, name, email, phone, address, housing, home_address, people_count, submitted_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                formData.role,
                formData.name,
                formData.email,
                formData.phone,
                formData.address,
                formData.housing     || null,
                formData.homeAddress || null,
                formData.peopleCount || null,
                formData.submittedAt
            ]
        );
    } catch (err) {
        console.log("db error: " + err.message);
    }

    const places = getPlacesNearAddress(formData.address);
    res.json({ places: places });
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
