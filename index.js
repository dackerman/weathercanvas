require('dotenv').config();
const WeatherService = require('./weatherService');
const PromptGenerator = require('./promptGenerator');
const ImageGenerator = require('./imageGenerator');

async function generateDailyImage() {
  try {
    const latitude = parseFloat(process.env.LATITUDE) || 42.3601;
    const longitude = parseFloat(process.env.LONGITUDE) || -71.0589;
    const locationName = process.env.LOCATION_NAME || 'Boston, MA';
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required. Please set it in your .env file');
    }

    console.log(`Generating daily image for ${locationName}`);
    console.log(`Coordinates: ${latitude}, ${longitude}`);
    console.log('');

    const weatherService = new WeatherService();
    console.log('Fetching weather data...');
    const weatherData = await weatherService.getWeather(latitude, longitude);
    
    const enhancedWeather = {
      ...weatherData,
      weatherDescription: weatherService.getWeatherDescription(weatherData.weatherCode),
      windDirection: weatherService.getWindDirection(weatherData.windDirection)
    };

    console.log(`Weather: ${enhancedWeather.weatherDescription}`);
    console.log(`Temperature: ${Math.round(enhancedWeather.temperature)}°${enhancedWeather.temperatureUnit}`);
    console.log(`Wind: ${Math.round(enhancedWeather.windSpeed)} mph from the ${enhancedWeather.windDirection}`);
    console.log(`Cloud cover: ${enhancedWeather.cloudCover}%`);
    console.log('');

    const promptGenerator = new PromptGenerator();
    const prompt = promptGenerator.generatePrompt(locationName, enhancedWeather);
    console.log('Generated prompt:');
    console.log(prompt);
    console.log('');

    const imageGenerator = new ImageGenerator(apiKey);
    console.log('Generating image...');
    const imageUrl = await imageGenerator.generateImage(prompt, {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'hd'
    });

    const filename = imageGenerator.generateFilename(locationName);
    const savedPath = await imageGenerator.saveImage(imageUrl, filename);
    
    console.log('');
    console.log('Success! Daily image generated.');
    console.log(`Image saved to: ${savedPath}`);
    console.log(`OpenAI URL: ${imageUrl}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  generateDailyImage();
}

module.exports = generateDailyImage;