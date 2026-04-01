// 🔗 Nexus's SIMBAD Astronomical Database Integration

class SIMBADIntegration {
    constructor() {
        this.baseURL = 'http://simbad.u-strasbg.fr/simbad/sim-id';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
        
        // SIMBAD object types we're interested in
        this.objectTypes = {
            STAR: 'star',
            GALAXY: 'galaxy',
            NEBULA: 'nebula',
            PLANETARY_NEBULA: 'planetary nebula',
            OPEN_CLUSTER: 'open cluster',
            GLOBULAR_CLUSTER: 'globular cluster'
        };
    }

    async queryObject(objectName) {
        const cacheKey = `simbad_${objectName.toLowerCase()}`;
        
        if (this.isCached(cacheKey)) {
            return this.getFromCache(cacheKey);
        }

        try {
            // SIMBAD requires specific formatting
            const formattedName = this.formatObjectName(objectName);
            const params = new URLSearchParams({
                Ident: formattedName,
                output: 'json'
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`SIMBAD API error: ${response.status}`);
            }

            const data = await response.json();
            this.setCache(cacheKey, data);
            
            return this.processSIMBADData(data);
        } catch (error) {
            console.error('Failed to query SIMBAD:', error);
            return this.getFallbackData(objectName);
        }
    }

    formatObjectName(name) {
        // SIMBAD has specific naming conventions
        return name.replace(/\s+/g, '+').toUpperCase();
    }

    processSIMBADData(simbadData) {
        if (!simbadData || !simbadData.data) {
            return null;
        }

        const data = simbadData.data;
        
        return {
            name: data.oid || data.main_id,
            coordinates: {
                ra: data.ra,
                dec: data.dec
            },
            magnitude: data.flux && data.flux.V ? data.flux.V : null,
            spectralType: data.sp_type,
            distance: data.distance ? `${data.distance} parsecs` : null,
            objectType: data.otype,
            references: data.references,
            lastUpdated: new Date().toISOString()
        };
    }

    async searchObjects(query, objectType = null) {
        try {
            // SIMBAD search endpoint
            const searchParams = new URLSearchParams({
                script: 'submit script',
                Criteria: query,
                output: 'json'
            });

            if (objectType) {
                searchParams.append('otype', objectType);
            }

            const response = await fetch('http://simbad.u-strasbg.fr/simbad/sim-script?' + searchParams);
            
            if (!response.ok) {
                throw new Error(`SIMBAD search error: ${response.status}`);
            }

            const data = await response.json();
            return this.processSearchResults(data);
        } catch (error) {
            console.error('SIMBAD search failed:', error);
            return [];
        }
    }

    processSearchResults(searchData) {
        if (!searchData || !searchData.data) {
            return [];
        }

        return searchData.data.map(item => ({
            name: item.oid || item.main_id,
            objectType: item.otype,
            coordinates: {
                ra: item.ra,
                dec: item.dec
            },
            magnitude: item.flux && item.flux.V ? item.flux.V : null
        }));
    }

    getFallbackData(objectName) {
        // Fallback data when SIMBAD is unavailable
        const fallbackDatabase = {
            'SIRIUS': {
                name: 'Sirius',
                coordinates: { ra: '06h 45m 08.9s', dec: '-16° 42′ 58″' },
                magnitude: -1.46,
                spectralType: 'A1V',
                distance: '2.64 parsecs',
                objectType: 'star'
            },
            'BETELGEUSE': {
                name: 'Betelgeuse',
                coordinates: { ra: '05h 55m 10.3s', dec: '+07° 24′ 25″' },
                magnitude: 0.42,
                spectralType: 'M1-2Ia-ab',
                distance: '197 parsecs',
                objectType: 'star'
            },
            'RIGEL': {
                name: 'Rigel',
                coordinates: { ra: '05h 14m 32.3s', dec: '-08° 12′ 06″' },
                magnitude: 0.13,
                spectralType: 'B8Ia',
                distance: '264 parsecs',
                objectType: 'star'
            }
        };

        return fallbackDatabase[objectName.toUpperCase()] || null;
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

    // 🔗 Nexus's Data Enhancement
    async enhanceStarData(starName) {
        const simbadData = await this.queryObject(starName);
        
        if (simbadData) {
            return {
                ...simbadData,
                source: 'SIMBAD',
                reliability: 'high'
            };
        }
        
        return {
            name: starName,
            source: 'fallback',
            reliability: 'medium',
            note: 'Data from fallback database'
        };
    }

    // 🎭 Laude's Integration Methods
    async integrateWithGalaxyExplorer() {
        // Enhance existing star data with SIMBAD information
        const prominentStars = ['Sirius', 'Betelgeuse', 'Rigel', 'Vega', 'Arcturus'];
        
        const enhancedData = {};
        
        for (const starName of prominentStars) {
            try {
                const enhanced = await this.enhanceStarData(starName);
                enhancedData[starName] = enhanced;
            } catch (error) {
                console.error(`Failed to enhance ${starName}:`, error);
            }
        }
        
        return enhancedData;
    }

    // 🛡️ Sentinel's Error Handling
    handleSIMBADError(error, operation) {
        console.error(`SIMBAD Error (${operation}):`, error);
        
        // Could show user-friendly message
        this.showSIMBADStatus('SIMBAD service temporarily unavailable');
        
        return null;
    }

    showSIMBADStatus(message) {
        // Update status in the UI
        const sourceStatus = document.querySelector('.source-item[data-status]');
        if (sourceStatus) {
            sourceStatus.setAttribute('data-status', 'standby');
            sourceStatus.title = message;
        }
    }

    // 🔗 Nexus's Status Monitoring
    async checkServiceStatus() {
        try {
            const testResponse = await fetch('http://simbad.u-strasbg.fr/simbad/sim-id?Ident=sirius&output=json');
            return testResponse.ok;
        } catch (error) {
            return false;
        }
    }

    getServiceStatus() {
        return {
            service: 'SIMBAD',
            baseURL: this.baseURL,
            cacheSize: this.cache.size,
            lastCheck: new Date().toISOString(),
            status: 'operational' // Would need actual status check
        };
    }
}

// Initialize SIMBAD integration
window.simbadAPI = new SIMBADIntegration();

// Export for global access
window.SIMBADIntegration = SIMBADIntegration;