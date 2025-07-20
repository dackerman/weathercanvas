class PromptGenerator {
  constructor() {
    this.seasons = {
      winter: { months: [12, 1, 2], keywords: 'winter, snow, cold, frost' },
      spring: { months: [3, 4, 5], keywords: 'spring, blooming, fresh, renewal' },
      summer: { months: [6, 7, 8], keywords: 'summer, warm, sunny, vibrant' },
      fall: { months: [9, 10, 11], keywords: 'autumn, fall, colorful leaves, harvest' }
    };
  }

  getCurrentSeason(date = new Date()) {
    const month = date.getMonth() + 1;
    for (const [season, data] of Object.entries(this.seasons)) {
      if (data.months.includes(month)) {
        return { name: season, keywords: data.keywords };
      }
    }
    return { name: 'unknown', keywords: '' };
  }

  getTimeOfDay(date = new Date()) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 9) return 'early morning sunrise';
    if (hour >= 9 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'golden hour sunset';
    if (hour >= 20 || hour < 5) return 'night';
  }

  generatePrompt(locationName, weather, date = new Date()) {
    const season = this.getCurrentSeason(date);
    const timeOfDay = this.getTimeOfDay(date);
    const weatherDesc = weather.weatherDescription;
    const windDirection = weather.windDirection;
    
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let prompt = `Create a stunning, photorealistic landscape illustration of ${locationName} on ${dateStr} during ${timeOfDay}. `;
    
    prompt += `The scene captures a beautiful ${season.name} day with ${weatherDesc} conditions. `;
    
    if (weather.temperature) {
      prompt += `The temperature is ${Math.round(weather.temperature)}°${weather.temperatureUnit}, `;
      if (weather.temperature > 80) {
        prompt += 'creating a warm, inviting atmosphere. ';
      } else if (weather.temperature < 40) {
        prompt += 'giving the scene a crisp, cool feeling. ';
      } else {
        prompt += 'making for comfortable conditions. ';
      }
    }
    
    if (weather.windSpeed > 0) {
      prompt += `Gentle ${windDirection} winds at ${Math.round(weather.windSpeed)} mph `;
      if (weather.windSpeed > 15) {
        prompt += 'create dynamic movement in the scene, with trees swaying and clouds drifting across the sky. ';
      } else {
        prompt += 'add subtle movement to leaves and grass. ';
      }
    }
    
    if (weather.cloudCover !== undefined) {
      if (weather.cloudCover < 20) {
        prompt += 'The sky is mostly clear with brilliant blue expanses. ';
      } else if (weather.cloudCover < 50) {
        prompt += 'Scattered clouds create interesting patterns in the sky. ';
      } else if (weather.cloudCover < 80) {
        prompt += 'The sky is filled with dramatic cloud formations. ';
      } else {
        prompt += 'Heavy cloud cover creates a moody, atmospheric scene. ';
      }
    }
    
    prompt += `Include iconic local landmarks or typical scenery of ${locationName}. `;
    prompt += `The lighting should reflect the ${timeOfDay} with appropriate shadows and color temperature. `;
    prompt += `Use a color palette that emphasizes the ${season.keywords} atmosphere. `;
    prompt += 'The overall mood should be inspiring and capture the unique character of this specific day and location. ';
    prompt += 'Render in high detail with professional photography composition.';

    return prompt;
  }
}

module.exports = PromptGenerator;