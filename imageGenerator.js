const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class ImageGenerator {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
  }

  async generateImage(prompt, options = {}) {
    try {
      const {
        model = 'dall-e-3',
        size = '1024x1024',
        quality = 'standard',
        n = 1
      } = options;

      console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');

      const response = await this.openai.images.generate({
        model,
        prompt,
        size,
        quality,
        n
      });

      return response.data[0].url;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async saveImage(imageUrl, filename) {
    try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      
      const imagesDir = path.join(__dirname, 'images');
      await fs.mkdir(imagesDir, { recursive: true });
      
      const filepath = path.join(imagesDir, filename);
      await fs.writeFile(filepath, Buffer.from(buffer));
      
      console.log(`Image saved to: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  generateFilename(locationName, date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    const locationSlug = locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `${locationSlug}-${dateStr}.png`;
  }
}

module.exports = ImageGenerator;