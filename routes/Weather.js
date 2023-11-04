import express from 'express';
import axios from 'axios';
import * as fs from 'node:fs/promises';

const router = express.Router();
const defaultCityName = process.env.DEFAULT_CITY_NAME;
const apiKey = process.env.OPENWEATHERMAP_API_KEY;


// Route pour afficher la météo
router.get('/index', async (req, res) => {
    try {

        // Retrieve city name from query params, or use default value
        const city = (req.query.city || defaultCityName).toLowerCase();


        // Retrieve forecast data
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', { params: { q: city, appid: apiKey, units: 'metric', lang: 'fr' } });
        const weatherData = weatherResponse.data;

        const temperature = weatherData.main.temp;
        const description = weatherData.weather[0].description;


        // Create the forecast object
        const forecast = {
            city,
            temperature,
            description,
            timestamp: Date.now()
        };


        // Load forecasts from saved file
        let forecasts;
        try {
            const forecastsData = await fs.readFile('data/forecasts.json', 'utf-8');
            forecasts = JSON.parse(forecastsData);
        } catch (error) {
            forecasts = []
        }

        // Add new forecast and save
        forecasts.push(forecast);
        await fs.writeFile('data/forecasts.json', JSON.stringify(forecasts, null, 2), 'utf-8');


        // Filter forecasts by city. Get only first 10 elements
        const lastForecasts = forecasts.filter(x => x.city === city).slice(-10);

        res.render('weather/index', { city, temperature, description, lastForecasts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Une erreur est survenue.');
    }
});

export default router;