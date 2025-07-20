# Daily Weather Image Generator

A web service that generates representative images for any day and location based on weather conditions using OpenAI's DALL-E 3.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Configure your settings in `.env`:
   - `OPENAI_API_KEY`: Your OpenAI API key (required)
   - `PORT`: Server port (default: 3000)

## Usage

### Web Server

Start the server:
```bash
npm start
```

Open the web interface:
```
http://localhost:3000
```

Or use the API directly:
```
http://localhost:3000/generate?zip=07901&date=2025-07-24
```

Parameters:
- `zip`: US zip code (required)
- `date`: Date in YYYY-MM-DD format (optional, defaults to today)
- `cached`: Set to `false` to force regeneration (optional, defaults to true)

### Command Line

Generate an image for your configured location:
```bash
npm run generate
```

## Features

- Beautiful web interface with modern design
- Automatic location detection using browser geolocation
- Web API for on-demand image generation
- Zip code to location lookup
- Historical and future weather data support
- Image caching to reduce API calls
- Real-time weather data from Open-Meteo API
- Season and time-aware prompt generation
- High-quality image generation with DALL-E 3

## API Endpoints

- `GET /generate?zip=ZIPCODE&date=YYYY-MM-DD` - Generate weather image
- `GET /health` - Health check endpoint

## Example

```bash
curl http://localhost:3000/generate?zip=10001&date=2025-07-20
```

This generates an image representing the weather in New York City (10001) on July 20, 2025.