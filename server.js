require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

const WeatherService = require('./weatherService');
const PromptGenerator = require('./promptGenerator');
const ImageGenerator = require('./imageGenerator');
const ZipCodeService = require('./zipCodeService');
const ImageCache = require('./imageCache');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

const weatherService = new WeatherService();
const promptGenerator = new PromptGenerator();
const imageGenerator = new ImageGenerator(process.env.OPENAI_API_KEY);
const zipCodeService = new ZipCodeService();
const imageCache = new ImageCache();

app.get('/generate', async (req, res) => {
  try {
    const { zip, date, cached } = req.query;
    
    if (!zip) {
      return res.status(400).json({ error: 'zip parameter is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Parse date or use current date
    const targetDate = date ? new Date(date) : new Date();
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Check if we should bypass cache
    const useCache = cached !== 'false';

    console.log(`Generating image for zip: ${zip}, date: ${targetDate.toISOString()}, useCache: ${useCache}`);

    // Check cache first (unless cached=false)
    if (useCache) {
      const cachedImage = await imageCache.get(zip, targetDate);
      if (cachedImage) {
        console.log('Serving cached image');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.sendFile(cachedImage.filepath);
      }
    } else {
      console.log('Cache bypassed by user request');
    }

    // Get location from zip code
    const location = await zipCodeService.getLocationFromZip(zip);
    console.log(`Location: ${location.locationName} (${location.latitude}, ${location.longitude})`);

    // Get weather for the location and date
    const weatherData = await weatherService.getWeather(
      location.latitude, 
      location.longitude,
      date ? targetDate : null
    );
    
    const enhancedWeather = {
      ...weatherData,
      weatherDescription: weatherService.getWeatherDescription(weatherData.weatherCode),
      windDirection: weatherService.getWindDirection(weatherData.windDirection)
    };

    console.log(`Weather: ${enhancedWeather.weatherDescription}, ${Math.round(enhancedWeather.temperature)}°F`);

    // Generate prompt
    const prompt = promptGenerator.generatePrompt(location.locationName, enhancedWeather, targetDate);
    
    // Generate image
    console.log('Generating new image...');
    const imageUrl = await imageGenerator.generateImage(prompt, {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard' // Use 'standard' for web serving
    });

    // Download and cache the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();
    
    const cachedPath = await imageCache.set(zip, targetDate, imageBuffer, location);
    
    // Send the image with proper headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(cachedPath);

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image', 
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Try to start server with error handling
const server = app.listen(PORT)
  .on('listening', () => {
    const addr = server.address();
    const actualPort = addr.port;
    console.log(`Server running on http://localhost:${actualPort}`);
    console.log(`Example: http://localhost:${actualPort}/generate?zip=07901&date=2025-07-24`);
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
      
      // Try alternative ports
      const altPort = parseInt(PORT) + 1;
      console.log(`Trying alternative port ${altPort}...`);
      
      app.listen(altPort)
        .on('listening', function() {
          console.log(`Server running on http://localhost:${altPort}`);
          console.log(`Example: http://localhost:${altPort}/generate?zip=07901&date=2025-07-24`);
        })
        .on('error', (err2) => {
          console.error('Failed to start server:', err2.message);
          console.log('\nTip: Set a custom port in your .env file:');
          console.log('PORT=8080');
          process.exit(1);
        });
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });