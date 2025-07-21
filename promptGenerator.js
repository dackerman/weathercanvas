const OpenAI = require("openai");

class PromptGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.seasons = {
      winter: { months: [12, 1, 2], keywords: "winter, snow, cold, frost" },
      spring: {
        months: [3, 4, 5],
        keywords: "spring, blooming, fresh, renewal",
      },
      summer: { months: [6, 7, 8], keywords: "summer, warm, sunny, vibrant" },
      fall: {
        months: [9, 10, 11],
        keywords: "autumn, fall, colorful leaves, harvest",
      },
    };
  }

  getCurrentSeason(date = new Date()) {
    const month = date.getMonth() + 1;
    for (const [season, data] of Object.entries(this.seasons)) {
      if (data.months.includes(month)) {
        return { name: season, keywords: data.keywords };
      }
    }
    return { name: "unknown", keywords: "" };
  }

  async generatePrompt(locationName, weather, date = new Date()) {
    const season = this.getCurrentSeason(date);
    const weatherDesc = weather.weatherDescription;
    const temperature = Math.round(weather.temperature);
    const windSpeed = Math.round(weather.windSpeed);
    const windDirection = weather.windDirection;
    const cloudCover = weather.cloudCover;

    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemPrompt = `You are an expert at creating detailed, artistic prompts for image generation.
Create vivid, imaginative prompts that capture the essence of a location's weather and atmosphere.
Focus on visual elements, lighting, mood, and artistic composition.
Be creative and specific about local landmarks, architecture, or natural features.`;

    const userMessage = `Create a detailed image generation prompt for:
Location: ${locationName}
Date: ${dateStr}
Season: ${season.name}
Weather: ${weatherDesc}
Temperature: ${temperature}°F
Wind: ${windSpeed} mph from the ${windDirection}
Cloud cover: ${cloudCover}%

First, using the date and location, browse the web to look up a famous or well-known event that happened (or happens) on this day. It could
be a historical event like the moon landing, or a recurring holiday like christmas. Ideally, it's a local event, but it doesn't have to be.

Once you find this event, include details of it in the final image prompt.

Create a rich, artistic prompt that captures this specific day and location. Include:
- The weather conditions and atmosphere
- Seasonal elements and colors
- Local landmarks or typical scenery
- Lighting conditions
- Artistic style and mood
- Compositional elements
- The event that you found while searching online.

Make it vivid and inspiring, suitable for generating a photorealistic image.`;

    console.log("Generating prompt with GPT-4.1...");
    const response = await this.openai.responses.create({
      model: "gpt-4.1",
      tools: [{ type: "web_search_preview" }],
      instructions: systemPrompt,
      input: userMessage,
    });

    const generatedPrompt = response.output_text.trim();
    console.log("GPT-4.1 generated prompt successfully");
    return generatedPrompt;
  }
}

module.exports = PromptGenerator;
