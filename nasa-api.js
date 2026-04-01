/**
 * NASA API Integration for Stellar Galaxy Explorer 2.0
 * Handles APOD, Mars Rover Imagery, and Satellite data endpoints
 * Built by Nexus - API Integration Specialist
 */

import { dataCache } from './data-cache.js';

class NASAApiService {
    constructor() {
        this.baseUrl = 'https://api.nasa.gov';
        this.apiKey = 'DEMO_KEY'; // Fallback to DEMO_KEY if no key provided
        this.cache = dataCache;
        this.rateLimit = {
            callsPerHour: 1000,
            lastReset: Date.now()
        };
    }

    /**
     * Initialize NASA API with key
     * @param {string} apiKey - NASA API key
     */
    initialize(apiKey) {
        this.apiKey = apiKey || 'DEMO_KEY';
    }

    /**
     * Fetch Astronomy Picture of the Day
     * @param {Date} date - Specific date (optional)
     * @returns {Promise<Object>} APOD data
     */
    async getAPOD(date = null) {
        const cacheKey = `apod_${date || 'today'}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({ api_key: this.apiKey });
            if (date) params.append('date', date.toISOString().split('T')[0]);
            
            const response = await fetch(`${this.baseUrl}/planetary/apod?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, data, 3600); // Cache for 1 hour
            return data;
        } catch (error) {
            console.error('NASA API - APOD fetch failed:', error);
            this.cache.set(cacheKey, { error: error.message }, 600); // Cache error for 10 min
            return { error: error.message };
        }
    }

    /**
     * Fetch Mars Rover imagery
     * @param {string} rover - 'curiosity', 'opportunity', or 'spirit'
     * @param {string} sol - Martian sol (optional)
     * @param {string} camera - Camera type (optional)
     * @returns {Promise<Object>} Mars photos data
     */
    async getMarsRoverPhotos(rover = 'curiosity', sol = null, camera = null) {
        const cacheKey = `mars_${rover}_${sol}_${camera || 'all'}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({ api_key: this.apiKey });
            if (sol) params.append('sol', sol);
            if (camera) params.append('camera', camera);
            
            const response = await fetch(`${this.baseUrl}/mars-photos/api/v1/rovers/${rover}/photos?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, data, 1800); // Cache for 30 minutes
            return data;
        } catch (error) {
            console.error('NASA API - Mars photos fetch failed:', error);
            this.cache.set(cacheKey, { error: error.message }, 600);
            return { error: error.message };
        }
    }

    /**
     * Search near-earth objects
     * @param {string} date - Search date (YYYY-MM-DD format)
     * @param {string} endDate - End date for range search
     * @returns {Promise<Object>} NEO data
     */
    async getNearEarthObjects(startDate, endDate = null) {
        const cacheKey = `neo_${startDate}_${endDate || startDate}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({ api_key: this.apiKey });
            params.append('start_date', startDate);
            params.append('end_date', endDate || startDate);
            
            const response = await fetch(`${this.baseUrl}/neo/rest/v1/feed?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, data, 3600); // Cache for 1 hour
            return data;
        } catch (error) {
            console.error('NASA API - NEO fetch failed:', error);
            this.cache.set(cacheKey, { error: error.message }, 600);
            return { error: error.message };
        }
    }

    /**
     * Get epic earth imagery
     * @param {string} date - Natural date parameter
     * @returns {Promise<Object>} EPIC imagery data
     */
    async getEPICImagery(date = null) {
        const cacheKey = `epic_${date || 'recent'}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            let url = `${this.baseUrl}/EPIC/api/natural/images`;
            if (date) {
                const dateObj = new Date(date);
                url = `${this.baseUrl}/EPIC/api/natural/date/${dateObj.toISOString().split('T')[0]}`;
            }
            
            const params = new URLSearchParams({ api_key: this.apiKey });
            const response = await fetch(`${url}?${params}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, data, 1800); // Cache for 30 minutes
            return data;
        } catch (error) {
            console.error('NASA API - EPIC fetch failed:', error);
            this.cache.set(cacheKey, { error: error.message }, 600);
            return { error: error.message };
        }
    }

    /**
     * Rate limiting helper
     * @returns {boolean} Whether the next call is allowed
     */
    checkRateLimit() {
        const now = Date.now();
        const hourInMs = 3600000;
        
        if (now - this.rateLimit.lastReset > hourInMs) {
            this.rateLimit.lastReset = now;
            return true;
        }
        
        // Simple rate limiting - in production, use more sophisticated tracking
        return true;
    }

    /**
     * Batch fetch multiple data types efficiently
     * @param {Array} requests - Array of request objects
     * @returns {Promise<Object>} Combined data
     */
    async batchFetch(requests) {
        const results = {};
        
        for (const request of requests) {
            if (!this.checkRateLimit()) await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { type, params = {} } = request;
            
            switch (type) {
                case 'apod':
                    results[type] = await this.getAPOD(params.date);
                    break;
                case 'mars':
                    results[type] = await this.getMarsRoverPhotos(params.rover, params.sol, params.camera);
                    break;
                case 'neo':
                    results[type] = await this.getNearEarthObjects(params.startDate, params.endDate);
                    break;
                case 'epic':
                    results[type] = await this.getEPICImagery(params.date);
                    break;
            }
        }
        
        return results;
    }
}

export const nasaApiService = new NASAApiService();
export default NASAApiService;

// Usage examples:
/*
// Initialize with your API key
nasaApiService.initialize('YOUR_NASA_API_KEY');

// Get today's APOD
const apod = await nasaApiService.getAPOD();

// Get Mars photos
const marsPhotos = await nasaApiService.getMarsRoverPhotos('curiosity', 1000);

// Get near-earth objects
const neo = await nasaApiService.getNearEarthObjects('2024-01-01');

// Batch fetch multiple endpoints
const data = await nasaApiService.batchFetch([
  { type: 'apod' },
  { type: 'mars', params: { rover: 'curiosity', sol: 1000 } }
]);
*/