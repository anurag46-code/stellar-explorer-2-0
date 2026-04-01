// 🔗 Nexus's NASA API Integration System

class NASAApiIntegration {
    constructor() {
        this.baseURL = 'https://api.nasa.gov';
        this.apiKey = 'DEMO_KEY'; // Default demo key
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.endpoints = {
            apod: '/planetary/apod', // Astronomy Picture of the Day
            neo: '/neo/rest/v1/feed', // Near Earth Objects
            epic: '/EPIC/api/natural/images', // Earth Polychromatic Imaging Camera
            mars: '/mars-photos/api/v1/rovers/curiosity/photos' // Mars Rover Photos
        };
    }

    async getAstronomyPictureOfTheDay(date = null) {
        const cacheKey = `apod_${date || 'today'}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const params = new URLSearchParams({
                api_key: this.apiKey
            });
            
            if (date) {
                params.append('date', date);
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.apod}?${params}`);
            
            if (!response.ok) {
                throw new Error(`NASA API error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('Failed to fetch APOD:', error);
            return this.getFallbackAPOD();
        }
    }

    async getNearEarthObjects(startDate, endDate = null) {
        const cacheKey = `neo_${startDate}_${endDate || startDate}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const params = new URLSearchParams({
                api_key: this.apiKey,
                start_date: startDate
            });
            
            if (endDate) {
                params.append('end_date', endDate);
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.neo}?${params}`);
            
            if (!response.ok) {
                throw new Error(`NASA NEO API error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('Failed to fetch NEO data:', error);
            return null;
        }
    }

    async getEarthImages(date = null) {
        const cacheKey = `epic_${date || 'latest'}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            let url = `${this.baseURL}${this.endpoints.epic}`;
            
            if (date) {
                url += `/date/${date}`;
            } else {
                url += '?api_key=' + this.apiKey;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`NASA EPIC API error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('Failed to fetch EPIC data:', error);
            return null;
        }
    }

    async getMarsRoverPhotos(sol = 1000, camera = 'FHAZ') {
        const cacheKey = `mars_${sol}_${camera}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            const params = new URLSearchParams({
                api_key: this.apiKey,
                sol: sol.toString(),
                camera: camera
            });

            const response = await fetch(`${this.baseURL}${this.endpoints.mars}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Mars Rover API error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('Failed to fetch Mars photos:', error);
            return null;
        }
    }

    // 🛡️ Sentinel's Cache Management
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        return cached ? cached.data : null;
    }

    isCached(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        return (Date.now() - cached.timestamp) < this.cacheTimeout;
    }

    clearCache() {
        this.cache.clear();
    }

    // Fallback data when API fails
    getFallbackAPOD() {
        const fallbackImages = [
            {
                title: "The Eagle Nebula",
                explanation: "A stunning view of star formation in the Eagle Nebula.",
                url: "https://apod.nasa.gov/apod/image/2401/M16_HST_4096.jpg",
                hdurl: "https://apod.nasa.gov/apod/image/2401/M16_HST_4096.jpg",
                date: new Date().toISOString().split('T')[0]
            },
            {
                title: "The Orion Nebula",
                explanation: "One of the brightest nebulae visible to the naked eye.",
                url: "https://apod.nasa.gov/apod/image/2401/Orion_HST_960.jpg",
                hdurl: "https://apod.nasa.gov/apod/image/2401/Orion_HST_960.jpg",
                date: new Date().toISOString().split('T')[0]
            }
        ];
        
        return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }

    // 🔗 Nexus's Data Processing
    processAPODData(apodData) {
        return {
            title: apodData.title,
            description: apodData.explanation,
            imageUrl: apodData.url,
            hdImageUrl: apodData.hdurl,
            date: apodData.date,
            mediaType: apodData.media_type,
            copyright: apodData.copyright || 'NASA'
        };
    }

    processNEOData(neoData) {
        if (!neoData || !neoData.near_earth_objects) return null;
        
        const objects = [];
        
        for (const date in neoData.near_earth_objects) {
            neoData.near_earth_objects[date].forEach(obj => {
                objects.push({
                    name: obj.name,
                    diameter: obj.estimated_diameter,
                    hazardous: obj.is_potentially_hazardous_asteroid,
                    closeApproachDate: obj.close_approach_data[0]?.close_approach_date,
                    missDistance: obj.close_approach_data[0]?.miss_distance
                });
            });
        }
        
        return objects;
    }

    // 🎭 Laude's Integration Methods
    async integrateWithGalaxyExplorer() {
        try {
            const apod = await this.getAstronomyPictureOfTheDay();
            const processedAPOD = this.processAPODData(apod);
            
            // Update UI with NASA data
            this.updateGalaxyWithNASAData(processedAPOD);
            
            return processedAPOD;
        } catch (error) {
            console.error('NASA integration failed:', error);
            return null;
        }
    }

    updateGalaxyWithNASAData(apodData) {
        // This would update the galaxy explorer with NASA data
        // For example, showing the Astronomy Picture of the Day in a special section
        
        if (apodData && apodData.mediaType === 'image') {
            const nasaSection = document.createElement('div');
            nasaSection.className = 'nasa-feature';
            nasaSection.innerHTML = `
                <h4>🌌 NASA Astronomy Picture of the Day</h4>
                <h5>${apodData.title}</h5>
                <img src="${apodData.imageUrl}" alt="${apodData.title}" style="max-width: 100%; border-radius: 8px;">
                <p>${apodData.description.substring(0, 200)}...</p>
                <small>Credit: ${apodData.copyright}</small>
            `;
            
            // Add to info panel
            const infoContent = document.getElementById('info-content');
            if (infoContent) {
                infoContent.appendChild(nasaSection);
            }
        }
    }

    // 🛡️ Sentinel's Error Handling
    handleAPIError(error, endpoint) {
        console.error(`NASA API Error (${endpoint}):`, error);
        
        // Show user-friendly error message
        this.showErrorMessage(`Failed to load NASA data: ${error.message}`);
        
        return null;
    }

    showErrorMessage(message) {
        // Could be implemented to show errors in the UI
        console.warn('NASA API Error:', message);
    }

    // 🔗 Nexus's Status Monitoring
    async checkAPIStatus() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.apod}?api_key=${this.apiKey}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    getAPIStatus() {
        return {
            baseURL: this.baseURL,
            apiKey: this.apiKey ? 'Configured' : 'Not Configured',
            cacheSize: this.cache.size,
            cacheHits: this.getCacheStats().hits,
            cacheMisses: this.getCacheStats().misses,
            lastUpdate: new Date().toISOString()
        };
    }

    getCacheStats() {
        // Simple cache statistics
        return {
            hits: 0, // Would need proper tracking
            misses: 0,
            size: this.cache.size
        };
    }
}

// Initialize NASA integration
window.nasaAPI = new NASAApiIntegration();

// Export for global access
window.NASAApiIntegration = NASAApiIntegration;