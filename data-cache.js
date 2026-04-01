/**
 * Smart Caching System for Stellar Galaxy Explorer 2.0
 * Handles data caching for NASA APIs and astronomical databases
 * Compatible with web storage and IndexedDB
 * Built by Nexus - API Integration Specialist
 */

class DataCache {
    constructor() {
        this.storageType = this.detectStorage();
        this.cachePrefix = 'sge2020_';
        this.maxAge = this.getCacheStrategy();
        
        // Cache sizes (in bytes)
        this.maxStorage = {
            localStorage: 5 * 1024 * 1024, // 5MB
            indexedDB: 100 * 1024 * 1024,  // 100MB
            memory: 50 * 1024 * 1024       // 50MB
        };
        
        this.stats = {
            hits: 0,
            misses: 0,
            size: 0,
            evictions: 0
        };
    }

    /**
     * Detect available storage mechanism
     * @returns {string} Storage type: indexedDB, localStorage, or memory
     */
    detectStorage() {
        try {
            if ('indexedDB' in window && typeof indexedDB !== 'undefined') {
                return 'indexedDB';
            }
            if ('localStorage' in window && localStorage) {
                return 'localStorage';
            }
        } catch (e) {
            console.log('No browser storage detected, falling back to memory');
        }
        return 'memory';
    }

    /**
     * Get cache strategy with smart defaults
     * @returns {Object} Cache strategy configuration
     */
    getCacheStrategy() {
        return {
            apod: 3600,        // 1 hour
            mars: 1800,        // 30 minutes
            neo: 3600,         // 1 hour  
            epic: 1800,        // 30 minutes
            simbad: 86400,     // 24 hours
            tap: 3600,         // 1 hour
            default: 600       // 10 minutes
        };
    }

    /**
     * Store data in cache
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in seconds
     * @returns {boolean} Success status
     */
    async set(key, data, ttl = null) {
        const cacheKey = this.cachePrefix + key;
        const ttlSeconds = ttl || this.maxAge.default;
        const expires = Date.now() + (ttlSeconds * 1000);
        
        const cacheEntry = {
            data: data,
            expires: expires,
            accessed: Date.now(),
            hits: 1
        };

        try {
            switch (this.storageType) {
                case 'indexedDB':
                    return this.saveToIndexedDB(cacheKey, cacheEntry);
                    
                case 'localStorage':
                    return this.saveToLocalStorage(cacheKey, cacheEntry);
                    
                case 'memory':
                default:
                    return this.saveToMemory(cacheKey, cacheEntry);
            }
        } catch (error) {
            console.error('Cache set failed:', error);
            return false;
        }
    }

    /**
     * Retrieve data from cache
     * @param {string} key - Cache key
     * @returns {any} Cached data or null
     */
    get(key) {
        const cacheKey = this.cachePrefix + key;
        
        try {
            let cacheEntry;
            
            switch (this.storageType) {
                case 'indexedDB':
                    cacheEntry = this.getFromIndexedDB(cacheKey);
                    break;
                    
                case 'localStorage':
                    cacheEntry = this.getFromLocalStorage(cacheKey);
                    break;
                    
                case 'memory':
                default:
                    cacheEntry = this.getFromMemory(cacheKey);
            }

            if (cacheEntry instanceof Promise) {
                return cacheEntry.then(entry => this.processCacheEntry(entry, key));
            } else {
                return this.processCacheEntry(cacheEntry, key);
            }
        } catch (error) {
            console.error('Cache get failed:', error);
            return null;
        }
    }

    /**
     * Process retrieved cache entry
     * @param {Object} entry - Cache entry
     * @param {string} key - Original key
     * @returns {any} Cached data or null
     */
    processCacheEntry(entry, key) {
        if (!entry || !entry.data) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (entry.expires && entry.expires < Date.now()) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }

        // Update access counter
        entry.hits = (entry.hits || 0) + 1;
        entry.accessed = Date.now();
        this.updateCacheEntry(key, entry);
        
        this.stats.hits++;
        return entry.data;
    }

    /**
     * Delete a cache entry
     * @param {string} key - Cache key
     * @returns {boolean} Success status
     */
    delete(key) {
        const cacheKey = this.cachePrefix + key;
        
        try {
            switch (this.storageType) {
                case 'indexedDB':
                    return this.deleteFromIndexedDB(cacheKey);
                    
                case 'localStorage':
                    return this.deleteFromLocalStorage(cacheKey);
                    
                case 'memory':
                    return this.deleteFromMemory(cacheKey);
                    
                default:
                    return true;
            }
        } catch (error) {
            console.error('Cache delete failed:', error);
            return false;
        }
    }

    /**
     * Clear all cache entries
     * @returns {Promise<boolean>} Success status
     */
    async clear() {
        try {
            switch (this.storageType) {
                case 'indexedDB':
                    return this.clearIndexedDB();
                    
                case 'localStorage':
                    return this.clearLocalStorage();
                    
                case 'memory':
                    return this.clearMemory();
                    
                default:
                    return true;
            }
        } catch (error) {
            console.error('Cache clear failed:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache performance stats
     */
    getStats() {
        return {
            ...this.stats,
            hitRate: (this.stats.hits / Math.max(this.stats.hits + this.stats.misses, 1) * 100).toFixed(2),
            storageType: this.storageType,
            estimatedSize: this.getCacheSize()
        };
    }

    /**
     * Save to localStorage
     * @private
     */
    saveToLocalStorage(key, entry) {
        if (this.isStorageFull('localStorage')) {
            this.evictOldEntries('localStorage');
        }
        
        localStorage.setItem(key, JSON.stringify(entry));
        return true;
    }

    /**
     * Get from localStorage
     * @private
     */
    getFromLocalStorage(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        try {
            return JSON.parse(item);
        } catch (e) {
            console.error('Invalid JSON in localStorage:', key);
            return null;
        }
    }

    /**
     * Delete from localStorage
     * @private
     */
    deleteFromLocalStorage(key) {
        localStorage.removeItem(key);
        return true;
    }

    /**
     * Clear localStorage
     * @private
     */
    clearLocalStorage() {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith(this.cachePrefix)) {
                localStorage.remove