const fetch = require('node-fetch');

class ZipCodeService {
  constructor() {
    this.cache = new Map();
  }

  async getLocationFromZip(zipCode) {
    if (this.cache.has(zipCode)) {
      return this.cache.get(zipCode);
    }

    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      
      if (!response.ok) {
        throw new Error(`Invalid zip code: ${zipCode}`);
      }

      const data = await response.json();
      
      const location = {
        latitude: parseFloat(data.places[0].latitude),
        longitude: parseFloat(data.places[0].longitude),
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation'],
        country: data.country,
        locationName: `${data.places[0]['place name']}, ${data.places[0]['state abbreviation']}`
      };

      this.cache.set(zipCode, location);
      return location;
      
    } catch (error) {
      console.error('Error fetching zip code data:', error);
      throw error;
    }
  }
}

module.exports = ZipCodeService;