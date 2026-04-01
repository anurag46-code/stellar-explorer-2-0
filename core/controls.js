// 💻 Codex's Advanced Control System

class GalaxyControls {
    constructor(galaxyExplorer) {
        this.explorer = galaxyExplorer;
        this.isFullscreen = false;
        this.currentTheme = 'dark';
        this.searchHistory = [];
        
        this.initControls();
    }

    initControls() {
        this.setupSearchFunctionality();
        this.setupThemeToggle();
        this.setupFullscreenToggle();
        this.setupModalSystem();
        this.setupErrorHandling();
        this.setupPerformanceControls();
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('search');
        const searchButton = document.getElementById('search-btn');
        
        searchButton.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        // Search suggestions
        searchInput.addEventListener('input', (e) => {
            this.showSearchSuggestions(e.target.value);
        });
    }

    performSearch() {
        const query = document.getElementById('search').value.trim();
        if (!query) return;
        
        // Add to search history
        this.addToSearchHistory(query);
        
        // Search in star database
        const results = window.starDatabase?.searchStars(query) || [];
        
        if (results.length > 0) {
            const firstResult = results[0];
            this.explorer.displayObjectInfo(firstResult);
            
            // Try to focus on the star if it exists in the scene
            this.focusOnStar(firstResult.name);
        } else {
            this.showSearchResults(query, results);
        }
    }

    focusOnStar(starName) {
        const starObjects = this.explorer.getAllSelectableObjects();
        const targetStar = starObjects.find(obj => obj.userData?.name === starName);
        
        if (targetStar) {
            this.explorer.focusOnObject(targetStar);
        }
    }

    showSearchResults(query, results) {
        const infoContent = document.getElementById('info-content');
        
        if (results.length === 0) {
            infoContent.innerHTML = `
                <div class="search-results">
                    <h4>🔍 Search Results for "${query}"</h4>
                    <p>No celestial objects found matching your search.</p>
                    <div class="search-suggestions">
                        <p>Try searching for:</p>
                        <ul>
                            <li>Star names (Sirius, Betelgeuse, Vega)</li>
                            <li>Constellations (Orion, Canis Major)</li>
                            <li>Star types (Red Giant, Blue Supergiant)</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            infoContent.innerHTML = `
                <div class="search-results">
                    <h4>🔍 Search Results for "${query}"</h4>
                    <p>Found ${results.length} matching objects:</p>
                    <div class="results-list">
                        ${results.map(star => `
                            <div class="result-item" data-star="${star.name}">
                                <strong>${star.name}</strong> - ${star.constellation} Constellation
                                <br><small>Magnitude: ${star.magnitude} • Distance: ${star.distance}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Add click handlers to result items
            document.querySelectorAll('.result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const starName = item.dataset.star;
                    this.focusOnStar(starName);
                });
            });
        }
    }

    showSearchSuggestions(query) {
        if (query.length < 2) return;
        
        // This would be enhanced with a proper suggestion system
        // For now, we'll just clear the field when typing
        const searchInput = document.getElementById('search');
        
        // You could implement a dropdown suggestion system here
        // This is a placeholder for future enhancement
    }

    addToSearchHistory(query) {
        this.searchHistory.unshift(query);
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // 🛡️ Sentinel's Local Storage for persistence
        try {
            localStorage.setItem('galaxySearchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Could not save search history:', error);
        }
    }

    loadSearchHistory() {
        try {
            const savedHistory = localStorage.getItem('galaxySearchHistory');
            if (savedHistory) {
                this.searchHistory = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.warn('Could not load search history:', error);
        }
    }

    setupThemeToggle() {
        const themeButton = document.getElementById('theme-btn');
        themeButton.addEventListener('click', () => this.toggleTheme());
        
        // Load saved theme preference
        this.loadThemePreference();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Update theme button icon
        const themeButton = document.getElementById('theme-btn');
        themeButton.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
        
        // 🛡️ Save preference
        this.saveThemePreference();
    }

    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('galaxyTheme');
            if (savedTheme) {
                this.currentTheme = savedTheme;
                document.body.setAttribute('data-theme', this.currentTheme);
                
                const themeButton = document.getElementById('theme-btn');
                themeButton.textContent = this.currentTheme === 'dark' ? '🌙' : '☀️';
            }
        } catch (error) {
            console.warn('Could not load theme preference:', error);
        }
    }

    saveThemePreference() {
        try {
            localStorage.setItem('galaxyTheme', this.currentTheme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    setupFullscreenToggle() {
        const fullscreenButton = document.getElementById('fullscreen-btn');
        fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
        
        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenButton();
        });
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    updateFullscreenButton() {
        const fullscreenButton = document.getElementById('fullscreen-btn');
        fullscreenButton.textContent = this.isFullscreen ? '⛶' : '⛶';
        fullscreenButton.title = this.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }

    setupModalSystem() {
        const infoButton = document.getElementById('info-btn');
        const modal = document.getElementById('modal');
        const closeButton = document.querySelector('.close-btn');
        
        infoButton.addEventListener('click', () => this.openModal());
        closeButton.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'block';
        
        // 🎨 Smooth animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    setupErrorHandling() {
        const retryButton = document.getElementById('retry-btn');
        retryButton.addEventListener('click', () => window.location.reload());
        
        // Global error handler
        window.addEventListener('error', (e) => {
            this.showError('A technical issue occurred. Please refresh the page.');
        });
        
        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (e) => {
            this.showError('A system error occurred. Please try again.');
        });
    }

    showError(message) {
        const errorOverlay = document.getElementById('error-boundary');
        const errorContent = errorOverlay.querySelector('.error-content');
        
        errorContent.innerHTML = `
            <h3>⚠️ Technical Issue Detected</h3>
            <p>${message}</p>
            <button id="retry-btn" class="action-btn">🔄 Retry</button>
        `;
        
        errorOverlay.style.display = 'flex';
        
        // Update retry button handler
        document.getElementById('retry-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    setupPerformanceControls() {
        const qualityControl = document.getElementById('quality-control');
        qualityControl.addEventListener('change', (e) => {
            this.explorer.performanceMode = e.target.value;
            this.explorer.updateRendererQuality();
        });
        
        const zoomControl = document.getElementById('zoom-control');
        zoomControl.addEventListener('input', (e) => {
            this.explorer.zoomSensitivity = parseFloat(e.target.value);
            this.explorer.controls.zoomSpeed = 0.8 * this.explorer.zoomSensitivity;
        });
        
        const speedControl = document.getElementById('speed-control');
        speedControl.addEventListener('input', (e) => {
            this.explorer.rotationSpeed = parseFloat(e.target.value);
            this.explorer.controls.rotateSpeed = 0.5 * this.explorer.rotationSpeed;
        });
        
        const autoRotateButton = document.getElementById('auto-rotate');
        autoRotateButton.addEventListener('click', () => {
            this.explorer.autoRotate = !this.explorer.autoRotate;
            autoRotateButton.textContent = this.explorer.autoRotate ? '⏹️ Stop Rotation' : '🌀 Auto Rotate';
        });
        
        const resetButton = document.getElementById('reset-view');
        resetButton.addEventListener('click', () => {
            this.explorer.camera.position.set(0, 0, 50);
            this.explorer.controls.reset();
        });
    }

    // 🛡️ Sentinel's Control Validation
    validateControlInput(input, min, max) {
        const value = parseFloat(input);
        return !isNaN(value) && value >= min && value <= max;
    }

    // 🔗 Nexus's Control State Export
    exportControlState() {
        return {
            theme: this.currentTheme,
            performanceMode: this.explorer.performanceMode,
            zoomSensitivity: this.explorer.zoomSensitivity,
            rotationSpeed: this.explorer.rotationSpeed,
            autoRotate: this.explorer.autoRotate,
            searchHistory: this.searchHistory,
            timestamp: new Date().toISOString()
        };
    }

    // 🎭 Laude's Control System Initialization
    initialize() {
        this.loadSearchHistory();
        this.loadThemePreference();
        console.log('🎮 Galaxy Controls System Initialized');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for galaxy explorer to be available
    setTimeout(() => {
        if (window.galaxyExplorer) {
            window.galaxyControls = new GalaxyControls(window.galaxyExplorer);
            window.galaxyControls.initialize();
        }
    }, 100);
});