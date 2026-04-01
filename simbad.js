/**
 * SIMBAD Astronomical Database Integration
 * Provides access to astronomical catalog and celestial object data
 * Built by Nexus - API Integration Specialist
 */

import { dataCache } from './data-cache.js';

class SIMBADService {
    constructor() {
        this.baseUrl = 'https://simbad.u-strasbg.fr/simbad/sim-id';
        this.votableUrl = 'https://simbad.u-strasbg.fr/simbad/sim-tap/sync';
        this.cache = dataCache;
        this.timeout = 10000; // 10 second timeout
    }

    /**
     * Query SIMBAD for basic object information
     * @param {string} objectName - Name of celestial object
     * @returns {Promise<Object>} SIMBAD object data
     */
    async queryObject(objectName) {
        const cacheKey = `simbad_object_${objectName.toLowerCase().replace(/\s+/g, '_')}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const params = new URLSearchParams({
                output.format: 'JSON',
                ident: objectName,
                list.idsel: 'on'
            });

            const response = await fetch(`${this.baseUrl}?${params}`, {
                timeout: this.timeout,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, data, 86400); // Cache for 24 hours
            return this.processObjectData(data);
        } catch (error) {
            console.error('SIMBAD API - Object query failed:', error);
            this.cache.set(cacheKey, { error: error.message }, 3600); // Cache error for 1 hour
            return { error: error.message };
        }
    }

    /**
     * Query SIMBAD with TAP (Table Access Protocol)
     * @param {string} query - ADQL (Astronomical Data Query Language) query
     * @returns {Promise<Object>} TAP query results
     */
    async tapQuery(query) {
        const cacheKey = `simbad_tap_${Buffer.from(query).toString('base64').substring(0, 50)}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const formData = new FormData();
            formData.append('REQUEST', 'doQuery');
            formData.append('LANG', 'ADQL');
            formData.append('FORMAT', 'json');
            formData.append('QUERY', query);

            const response = await fetch(this.votableUrl, {
                method: 'POST',
                body: formData,
                timeout: this.timeout
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, data, 3600); // Cache for 1 hour
            return this.processTAPResults(data);
        } catch (error) {
            console.error('SIMBAD TAP - Query failed:', error);
            this.cache.set(cacheKey, { error: error.message }, 600);
            return { error: error.message };
        }
    }

    /**
     * Search for stars by constellation
     * @param {string} constellation - Constellation name
     * @returns {Promise<Array>} List of stars
     */
    async searchConstellation(constellation) {
        const query = `
            SELECT TOP 100 oids.ra, oids.dec, ids.main_id, basic.main_id as name
            FROM basic
            JOIN oids ON basic.oid = oids.oidref
            WHERE basic.oidtype LIKE 'star'
            AND basicOTYPE LIKE '%${constellation}%'
            ORDER BY basic.main_id
        `;
        
        return this.tapQuery(query);
    }

    /**
     * Get detailed information about a specific star
     * @param {string} starName - Star identifier
     * @returns {Promise<Object>} Detailed star information
     */
    async getStarInfo(starName) {
        const objectData = await this.queryObject(starName);
        if (objectData.error) return objectData;

        const query = `
            SELECT ra, dec, pmra, pmdec, plx, rvz_radvel, jmag, kmag, flux_u, flux_b, flux_v, flux_g, flux_r
            FROM basic
            WHERE main_id = '${starName}'
        `;

        const additionalData = await this.tapQuery(query);
        return {
            ...objectData,
            astrophysical_data: additionalData
        };
    }

    /**
     * Search within a specific sky region
     * @param {number} ra - Right ascension (degrees)
     * @param {number} dec - Declination (degrees)
     * @param {number} radius - Search radius (degrees)
     * @returns {Promise<Array>} Objects in the region
     */
    async searchRegion(ra, dec, radius = 1.0) {
        const query = `
            SELECT TOP 50 oids.ra, oids.dec, basic.main_id, basic.otype_txt
            FROM basic
            JOIN oids ON basic.oid = ods.oidref
            WHERE oids.ra BETWEEN ${ra - radius} AND ${ra + radius}
            AND oids.dec BETWEEN ${dec - radius} AND ${dec + radius}
            ORDER BY SQRT(POWER(oids.ra - ${ra}, 2) + POWER(oids.dec - ${dec}, 2))
        `;
        
        return this.tapQuery(query);
    }

    /**
     * Get magnitude/brightness information
     * @param {string} objectName - Object identifier
     * @returns {Promise<Object>} Magnitude data
     */
    async getMagnitude(objectName) {
        const query = `
            SELECT 
                basic.main_id,
                allfluxes.B AS B_mag,
                allfluxes.V AS V_mag,
                allfluxes.R AS R_mag,
                allfluxes.I AS I_mag,
                allfluxes.J AS J_mag,
                allfluxes.K AS K_mag,
                allfluxes.IRAC1 as IRAC1_mag
            FROM basic
            JOIN allfluxes ON basic.oid = allfluxes.oidref
            WHERE basic.main_id = '${objectName}'
        `;
        
        return this.tapQuery(query);
    }

    /**
     * Process object data from SIMBAD response
     * @param {Object} rawData - Raw SIMBAD response
     * @returns {Object} Processed object data
     */
    processObjectData(rawData) {
        if (!rawData || !rawData.data || !rawData.data.length) {
            return { name: null, found: false };
        }

        const mainInfo = rawData.data[0];
        return {
            name: mainInfo[0] || null,
            ra: mainInfo[1] || null,
            dec: mainInfo[2] || null,
            magnitude: mainInfo[3] || null,
            spectral_type: mainInfo[4] || null,
            object_type: mainInfo[5] || null,
            found: true,
            raw_data: rawData
        };
    }

    /**
     * Process TAP query results
     * @param {Object} rawData - Raw TAP response
     * @returns {Array} Processed results
     */
    processTAPResults(rawData) {
        if (!rawData || !rawData.data) {
            return [];
        }

        const headers = rawData.columns || [];
        return rawData.data.map(row => {
            const result = {};
            headers.forEach((header, index) => {
                result[header.name] = row[index];
            });
            return result;
        });
    }

    /**
     * Cross-reference objects between SIMBAD and NASA data
     * @param {Array} objects - Objects to cross-reference
     * @returns {Promise<Array>} Cross-referenced data
     */
    async crossReferenceNASA(objects) {
        const results = [];
        
        for (const obj of objects) {
            if (obj.name) {
                const simbadData = await this.queryObject(obj.name);
                const nasaCompatible = {
                    ...simbadData,
                    nasa_directory: {
                        mars_target: this.isMarsTarget(obj.name),
                        neo_classification: this.getNEOClassification(obj.name),
                        epic_coordinates: {
                            ra: simbadData.ra,
                            dec: simbadData.dec
                        }
                    }
                };
                results.push(nasaCompatible);
            }
        }
        
        return results;
    }

    /**
     * Check if object is relevant for NASA Mars missions
     * @param {string} objectName - Object to check
     * @returns {boolean} Is Mars-related
     */
    isMarsTarget(objectName) {
        const marsPatterns = [/mars/i, /ares/i, /martis/i, /deimos/i, /phobos/i];
        return marsPatterns.some(pattern => pattern.test(objectName));
    }

    /**
     * Get NEO classification for object
     * @param {string} objectName - Object to classify
     * @returns {string} NEO classification
     */
    getNEOClassification(objectName) {
        const asteroidPatterns = [/asteroid/i, /comet/i, /meteor/i, /eso/i];
        const planetPatterns = [/planet/i, /jupiter/i, /saturn/i, /mercury/i];
        
        if (asteroidPatterns.some(pattern => pattern.test(objectName))) return 'asteroid';
        if (planetPatterns.some(pattern => pattern.test(objectName))) return 'planet';
        return 'other';
    }
}

export const simbadService = new SIMBADService();
export default SIMBADService;

// Usage examples:
/*
// Basic object query
const sirus = await simbadService.queryObject('Sirius');

// TAP query for stars in a region
const stars = await simbadService.searchRegion(123.456, 45.678, 2.0);

// Get constellation stars
const orionStars = await simbadService.searchConstellation('orion');

// Get detailed star info
const proximaInfo = await simbadService.getStarInfo('Proxima Centauri');

// Batch operations
const objects = ['HD 209458', 'Kepler-22', 'TRAPPIST-1'];
const crossRef = await simbadService.crossReferenceNASA(objects.map(name => ({ name })));
*/
