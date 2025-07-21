# WeatherCanvas

A web service that generates unique, AI-crafted weather visualizations for any day and location. Uses GPT-4.1 to create creative prompts and OpenAI's image generation to produce beautiful weather-based artwork.

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

- **AI-Powered Prompt Generation**: Uses GPT-4.1-2025-04-14 to create unique, creative prompts for each image
- **Beautiful Web Interface**: Modern, responsive design with glassmorphism effects
- **Automatic Location Detection**: Uses browser geolocation to find your zip code
- **Prompt Display**: Shows the full AI-generated prompt below each image
- **Smart Caching**: Reduces API calls while allowing forced regeneration with `cached=false`
- **Real-time Weather Data**: Fetches current and historical weather from Open-Meteo API
- **Season-Aware Generation**: Considers seasonal elements and local weather conditions
- **High-Quality Images**: Generated using OpenAI's image generation models
- **Docker Ready**: Complete containerization with health checks and security features

## API Endpoints

- `GET /generate?zip=ZIPCODE&date=YYYY-MM-DD` - Generate weather image
- `GET /health` - Health check endpoint

## Example

```bash
curl http://localhost:3000/generate?zip=10001&date=2025-07-20
```

This generates an image representing the weather in New York City (10001) on July 20, 2025.

## How It Works

1. **Weather Data**: Fetches real-time weather conditions from Open-Meteo API
2. **AI Prompt Generation**: GPT-4.1 creates a unique, detailed prompt based on:
   - Location and local landmarks
   - Current weather conditions (temperature, wind, clouds)
   - Seasonal characteristics
   - Atmospheric lighting (without time-of-day references)
3. **Image Generation**: OpenAI's image model creates the visualization
4. **Display**: Shows both the generated image and the AI prompt used to create it

Each image is completely unique, as GPT-4.1 generates creative prompts that capture the specific weather conditions and local character of any location.

## Docker Deployment

### Using Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/dackerman/weathercanvas.git
   cd weathercanvas
   ```

2. Create a `.env` file with your OpenAI API key:
   ```bash
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

3. Build and run with Docker Compose:
   ```bash
   docker compose up -d
   ```

4. Access the application at http://localhost:8080

### Using Docker directly

```bash
# Build the image
docker build -t weathercanvas .

# Run the container
docker run -d \
  -p 8080:3000 \
  -e OPENAI_API_KEY=your_api_key_here \
  -v $(pwd)/cache:/app/cache \
  -v $(pwd)/images:/app/images \
  --name weathercanvas \
  weathercanvas
```

### Docker Features

- Runs as non-root user for security
- Health checks for container monitoring
- Persistent volumes for cache and images
- Production-optimized Node.js Alpine image
- Automatic restart on failure