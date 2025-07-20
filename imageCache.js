const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ImageCache {
  constructor() {
    this.cacheDir = path.join(__dirname, 'cache');
    this.metadataFile = path.join(this.cacheDir, 'metadata.json');
    this.metadata = new Map();
    this.maxCacheSize = 100; // Maximum number of cached images
    this.init();
  }

  async init() {
    await fs.mkdir(this.cacheDir, { recursive: true });
    await this.loadMetadata();
  }

  async loadMetadata() {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf-8');
      const parsed = JSON.parse(data);
      this.metadata = new Map(Object.entries(parsed));
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      this.metadata = new Map();
    }
  }

  async saveMetadata() {
    const data = Object.fromEntries(this.metadata);
    await fs.writeFile(this.metadataFile, JSON.stringify(data, null, 2));
  }

  generateCacheKey(zipCode, date) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    return crypto.createHash('md5').update(`${zipCode}-${dateStr}`).digest('hex');
  }

  async get(zipCode, date) {
    const key = this.generateCacheKey(zipCode, date);
    const metadata = this.metadata.get(key);
    
    if (!metadata) {
      return null;
    }

    const filepath = path.join(this.cacheDir, metadata.filename);
    
    try {
      await fs.access(filepath);
      return {
        filepath,
        metadata
      };
    } catch (error) {
      // File doesn't exist, remove from metadata
      this.metadata.delete(key);
      await this.saveMetadata();
      return null;
    }
  }

  async set(zipCode, date, imageBuffer, locationInfo) {
    const key = this.generateCacheKey(zipCode, date);
    const filename = `${key}.png`;
    const filepath = path.join(this.cacheDir, filename);
    
    await fs.writeFile(filepath, imageBuffer);
    
    this.metadata.set(key, {
      filename,
      zipCode,
      date: new Date(date).toISOString(),
      location: locationInfo,
      createdAt: new Date().toISOString()
    });

    // Implement simple LRU cache eviction
    if (this.metadata.size > this.maxCacheSize) {
      const oldestKey = this.metadata.keys().next().value;
      const oldestMeta = this.metadata.get(oldestKey);
      if (oldestMeta) {
        try {
          await fs.unlink(path.join(this.cacheDir, oldestMeta.filename));
        } catch (error) {
          console.error('Error removing old cache file:', error);
        }
        this.metadata.delete(oldestKey);
      }
    }

    await this.saveMetadata();
    return filepath;
  }
}

module.exports = ImageCache;