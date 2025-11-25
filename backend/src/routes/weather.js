const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { notFound } = require('../middleware/errorHandler');

/**
 * @swagger
 * /api/weather/city:
 *   get:
 *     summary: Get weather by city name
 *     description: Retrieve weather information for a specific city
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: The city name to get weather for
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     location:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                           example: "London"
 *                         country:
 *                           type: string
 *                           example: "GB"
 *                         coord:
 *                           type: object
 *                           properties:
 *                             lon:
 *                               type: number
 *                               example: -0.1257
 *                             lat:
 *                               type: number
 *                               example: 51.5085
 *                     weather:
 *                       type: object
 *                       properties:
 *                         main:
 *                           type: string
 *                           example: "Clouds"
 *                         description:
 *                           type: string
 *                           example: "overcast clouds"
 *                         temperature:
 *                           type: number
 *                           example: 15
 *                         humidity:
 *                           type: number
 *                           example: 81
 *                         wind_speed:
 *                           type: number
 *                           example: 4.12
 *                 meta:
 *                   type: object
 *                   properties:
 *                     cached:
 *                       type: boolean
 *                       example: false
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-11-25T05:30:00.000Z"
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       404:
 *         description: City not found
 *       500:
 *         description: Internal server error
 */
router.get('/city', weatherController.getWeatherByCity);

/**
 * @swagger
 * /api/weather/coordinates:
 *   get:
 *     summary: Get weather by coordinates
 *     description: Retrieve weather information for specific coordinates
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *     responses:
 *       200:
 *         description: Weather data retrieved successfully
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get('/coordinates', weatherController.getWeatherByCoords);

// 404 handler for /api/weather/*
router.all('*', notFound);

module.exports = router;
