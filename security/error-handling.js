// 🛡️ Sentinel's Error Handling System

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxErrors = 100;
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'runtime',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason
            });
        });

        // Three.js error handling
        this.setupThreeJSErrorHandling();
    }

    setupThreeJSErrorHandling() {
        // Override console.error to catch Three.js errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleError({
                type: 'threejs',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalConsoleError.apply(console, args);
        };
    }

    handleError(errorData) {
        const enhancedError = {
            ...errorData,
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(enhancedError);
        
        // Keep log size manageable
        if (this.errorLog.length > this.maxErrors) {
            this.errorLog.shift();
        }

        this.displayErrorToUser(enhancedError);
        this.logError(enhancedError);
    }

    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    displayErrorToUser(error) {
        // Only show critical errors to users
        if (this.isCriticalError(error)) {
            this.showErrorOverlay(error);
        }
    }

    isCriticalError(error) {
        const criticalPatterns = [
            /three\.js/i,
            /webgl/i,
            /canvas/i,
            /memory/i,
            /security/i
        ];

        return criticalPatterns.some(pattern => 
            pattern.test(error.message) || 
            pattern.test(error.type)
        );
    }

    showErrorOverlay(error) {
        const overlay = document.getElementById('error-boundary');
        if (!overlay) return;

        const errorContent = overlay.querySelector('.error-content');
        errorContent.innerHTML = `
            <h3>⚠️ Technical Issue Detected</h3>
            <p>Our team is working to resolve this issue.</p>
            <div class="error-details" style="display: none;">
                <p><strong>Error:</strong> ${error.message}</p>
                <p><strong>Type:</strong> ${error.type}</p>
                <p><strong>Time:</strong> ${new Date(error.timestamp).toLocaleTimeString()}</p>
            </div>
            <button id="retry-btn" class="action-btn">🔄 Retry</button>
            <button id="toggle-details" class="action-btn secondary">Show Details</button>
        `;

        overlay.style.display = 'flex';

        // Setup event handlers
        document.getElementById('retry-btn').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('toggle-details').addEventListener('click', (e) => {
            const details = document.querySelector('.error-details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
            e.target.textContent = details.style.display === 'none' ? 'Show Details' : 'Hide Details';
        });
    }

    logError(error) {
        // Send error to analytics/service (optional)
        console.warn('Error handled:', error);
    }

    getErrorSummary() {
        const summary = {
            total: this.errorLog.length,
            byType: {},
            recent: this.errorLog.slice(-10),
            critical: this.errorLog.filter(err => this.isCriticalError(err))
        };

        this.errorLog.forEach(error => {
            summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
        });

        return summary;
    }

    clearErrors() {
        this.errorLog = [];
    }

    // Recovery methods
    attemptRecovery() {
        // Try to recover from common errors
        if (this.isWebGLError()) {
            this.recoverWebGL();
        } else if (this.isMemoryError()) {
            this.recoverMemory();
        }
    }

    isWebGLError() {
        return this.errorLog.some(error => 
            error.message.includes('WebGL') || 
            error.message.includes('three.js')
        );
    }

    isMemoryError() {
        return this.errorLog.some(error => 
            error.message.includes('memory') || 
            error.message.includes('Memory')
        );
    }

    recoverWebGL() {
        console.log('Attempting WebGL recovery...');
        // Could try to reinitialize WebGL context
    }

    recoverMemory() {
        console.log('Attempting memory recovery...');
        // Trigger garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
}

// Initialize error handler
window.errorHandler = new ErrorHandler();