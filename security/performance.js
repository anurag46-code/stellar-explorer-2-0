// 🛡️ Sentinel's Performance Monitoring System

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            memory: 0,
            loadTime: 0,
            renderTime: 0,
            frameCount: 0
        };
        
        this.thresholds = {
            lowFPS: 30,
            highMemory: 500, // MB
            longRender: 16.67 // ms (60fps target)
        };
        
        this.performanceLog = [];
        this.maxLogSize = 100;
        
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        
        this.startMonitoring();
    }

    startMonitoring() {
        this.setupFPSCounter();
        this.setupMemoryMonitor();
        this.setupRenderTimer();
        this.setupPerformanceObserver();
    }

    setupFPSCounter() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const calculateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                this.checkFPSThreshold();
            }
            
            requestAnimationFrame(calculateFPS);
        };
        
        calculateFPS();
    }

    setupMemoryMonitor() {
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                this.metrics.memory = memory.usedJSHeapSize / 1048576; // Convert to MB
                
                this.checkMemoryThreshold();
            }, 5000);
        }
    }

    setupRenderTimer() {
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        
        window.requestAnimationFrame = (callback) => {
            const startTime = performance.now();
            
            return originalRequestAnimationFrame((timestamp) => {
                const renderTime = performance.now() - startTime;
                this.metrics.renderTime = renderTime;
                
                this.checkRenderThreshold();
                callback(timestamp);
            });
        };
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.logPerformanceEntry(entry);
                });
            });
            
            observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
        }
    }

    checkFPSThreshold() {
        if (this.metrics.fps < this.thresholds.lowFPS) {
            this.triggerPerformanceAlert('low_fps', {
                currentFPS: this.metrics.fps,
                threshold: this.thresholds.lowFPS
            });
        }
    }

    checkMemoryThreshold() {
        if (this.metrics.memory > this.thresholds.highMemory) {
            this.triggerPerformanceAlert('high_memory', {
                currentMemory: this.metrics.memory,
                threshold: this.thresholds.highMemory
            });
        }
    }

    checkRenderThreshold() {
        if (this.metrics.renderTime > this.thresholds.longRender) {
            this.triggerPerformanceAlert('long_render', {
                renderTime: this.metrics.renderTime,
                threshold: this.thresholds.longRender
            });
        }
    }

    triggerPerformanceAlert(type, data) {
        const alert = {
            type: type,
            data: data,
            timestamp: new Date().toISOString(),
            severity: this.getAlertSeverity(type, data)
        };
        
        this.performanceLog.push(alert);
        
        // Keep log size manageable
        if (this.performanceLog.length > this.maxLogSize) {
            this.performanceLog.shift();
        }
        
        // Show user warning if severe
        if (alert.severity === 'high') {
            this.showPerformanceWarning(alert);
        }
        
        console.warn('Performance alert:', alert);
    }

    getAlertSeverity(type, data) {
        const thresholds = {
            low_fps: { low: 25, medium: 20, high: 15 },
            high_memory: { low: 600, medium: 800, high: 1000 },
            long_render: { low: 33, medium: 50, high: 66 }
        };
        
        const threshold = thresholds[type];
        if (!threshold) return 'low';
        
        const value = data.currentFPS || data.currentMemory || data.renderTime;
        
        if (value <= threshold.high) return 'high';
        if (value <= threshold.medium) return 'medium';
        return 'low';
    }

    showPerformanceWarning(alert) {
        // Create warning message
        const warningDiv = document.createElement('div');
        warningDiv.className = 'performance-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">Performance issue detected: ${alert.type}</span>
                <button class="warning-dismiss">×</button>
            </div>
        `;
        
        warningDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(warningDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.parentNode.removeChild(warningDiv);
            }
        }, 5000);
        
        // Manual dismiss
        warningDiv.querySelector('.warning-dismiss').addEventListener('click', () => {
            if (warningDiv.parentNode) {
                warningDiv.parentNode.removeChild(warningDiv);
            }
        });
    }

    logPerformanceEntry(entry) {
        const logEntry = {
            name: entry.name,
            type: entry.entryType,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: new Date().toISOString()
        };
        
        this.performanceLog.push(logEntry);
    }

    getPerformanceReport() {
        return {
            metrics: this.metrics,
            thresholds: this.thresholds,
            recentAlerts: this.performanceLog.slice(-10),
            timestamp: new Date().toISOString()
        };
    }

    optimizePerformance() {
        // Automatic performance optimization
        if (this.metrics.fps < 20) {
            this.reduceRenderingQuality();
        }
        
        if (this.metrics.memory > 800) {
            this.clearCaches();
        }
    }

    reduceRenderingQuality() {
        if (window.galaxyExplorer) {
            window.galaxyExplorer.performanceMode = 'low';
            window.galaxyExplorer.updateRendererQuality();
            console.log('Reduced rendering quality for better performance');
        }
    }

    clearCaches() {
        // Clear API caches
        if (window.nasaAPI) {
            window.nasaAPI.clearCache();
        }
        
        // Trigger garbage collection
        if (window.gc) {
            window.gc();
        }
        
        console.log('Cleared caches for memory optimization');
    }
}

// Initialize performance monitor
window.performanceMonitor = new PerformanceMonitor();