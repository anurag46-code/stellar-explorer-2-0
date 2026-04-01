// 🔗 Nexus's Data Caching System

class DataCache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 10 * 60 * 1000; // 10 minutes
        this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
        
        this.startCleanupTimer();
    }

    set(key, data, ttl = this.defaultTTL) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
        };
        
        this.cache.set(key, cacheEntry);
        return true;
    }

    get(key) {
        const cacheEntry = this.cache.get(key);
        
        if (!cacheEntry) {
            return null;
        }
        
        // Check if expired
        if (Date.now() > cacheEntry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return cacheEntry.data;
    }

    has(key) {
        const cacheEntry = this.cache.get(key);
        
        if (!cacheEntry) {
            return false;
        }
        
        if (Date.now() > cacheEntry.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        
        return true;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    startCleanupTimer() {
        setInterval(() => {
            this.cleanupExpired();
        }, this.cleanupInterval);
    }

    cleanupExpired() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`Cleaned ${cleanedCount} expired cache entries`);
        }
    }

    // Cache statistics
    getStats() {
        const now = Date.now();
        let validCount = 0;
        let expiredCount = 0;
        
        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) {
                expiredCount++;
            } else {
                validCount++;
            }
        }
        
        return {
            total: this.cache.size,
            valid: validCount,
            expired: expiredCount,
            memoryUsage: this.estimateMemoryUsage(),
            lastCleanup: new Date().toISOString()
        };
    }

    estimateMemoryUsage() {
        // Rough memory estimation
        let size = 0;
        
        for (const [key, value] of this.cache.entries()) {
            size += key.length;
            size += JSON.stringify(value.data).length;
        }
        
        return size;
    }

    // Cache with fallback function
    async getWithFallback(key, fallbackFunction, ttl = this.defaultTTL) {
        const cachedData = this.get(key);
        
        if (cachedData !== null) {
            return cachedData;
        }
        
        try {
            const freshData = await fallbackFunction();
            this.set(key, freshData, ttl);
            return freshData;
        } catch (error) {
            console.error(`Fallback function failed for key ${key}:`, error);
            throw error;
        }
    }

    // Batch operations
    setMultiple(entries) {
        let successCount = 0;
        
        for (const { key, data, ttl } of entries) {
            if (this.set(key, data, ttl)) {
                successCount++;
            }
        }
        
        return {
            total: entries.length,
            success: successCount,
            failed: entries.length - successCount
        };
    }

    getMultiple(keys) {
        const results = {};
        const missing = [];
        
        for (const key of keys) {
            const data = this.get(key);
            if (data !== null) {
                results[key] = data;
            } else {
                missing.push(key);
            }
        }
        
        return {
            results: results,
            missing: missing
        };
    }

    // Cache invalidation patterns
    invalidateByPattern(pattern) {
        const regex = new RegExp(pattern);
        let invalidatedCount = 0;
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                invalidatedCount++;
            }
        }
        
        return invalidatedCount;
    }

    invalidateByPrefix(prefix) {
        return this.invalidateByPattern(`^${prefix}`);
    }

    invalidateBySuffix(suffix) {
        return this.invalidateByPattern(`${suffix}$`);
    }

    // Cache persistence (localStorage)
    persistToStorage() {
        try {
            const serialized = JSON.stringify(Array.from(this.cache.entries()));
            localStorage.setItem('galaxyDataCache', serialized);
            return true;
        } catch (error) {
            console.error('Failed to persist cache:', error);
            return false;
        }
    }

    loadFromStorage() {
        try {
            const serialized = localStorage.getItem('galaxyDataCache');
            if (serialized) {
                const entries = JSON.parse(serialized);
                this.cache = new Map(entries);
                return true;
            }
        } catch (error) {
            console.error('Failed to load cache:', error);
        }
        
        return false;
    }

    // Cache warming
    async warmCache(warmupData) {
        const results = [];
        
        for (const { key, data, ttl } of warmupData) {
            try {
                this.set(key, data, ttl);
                results.push({ key, status: 'success' });
            } catch (error) {
                results.push({ key, status: 'error', error: error.message });
            }
        }
        
        return results;
    }
}

// Initialize data cache
window.dataCache = new DataCache();