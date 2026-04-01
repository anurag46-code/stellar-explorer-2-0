// 💻 Codex's Advanced Three.js Galaxy Implementation

class AdvancedGalaxyExplorer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.starSystems = [];
        this.galaxies = [];
        this.particles = [];
        this.selectedObject = null;
        this.animationId = null;
        
        this.performanceMode = 'medium';
        this.autoRotate = false;
        this.zoomSensitivity = 1.0;
        this.rotationSpeed = 1.0;
        
        this.init();
    }

    init() {
        this.createAdvancedScene();
        this.createEnhancedCamera();
        this.createHighPerformanceRenderer();
        this.createPrecisionControls();
        this.createSpiralGalaxy();
        this.createStarSystems();
        this.createParticleField();
        this.setupEventHandlers();
        this.startAnimationLoop();
        
        // 🛡️ Sentinel's Performance Monitoring
        this.startPerformanceMonitor();
    }

    createAdvancedScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        
        // Enhanced lighting system
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Point lights for star effects
        const pointLight = new THREE.PointLight(0x4a4aff, 0.5, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    }

    createEnhancedCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50);
        this.camera.lookAt(0, 0, 0);
    }

    createHighPerformanceRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('galaxy-canvas'),
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 🛡️ Performance cap
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 🛡️ Quality settings based on performance mode
        this.updateRendererQuality();
    }

    updateRendererQuality() {
        switch(this.performanceMode) {
            case 'low':
                this.renderer.setPixelRatio(1);
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                break;
            case 'high':
                this.renderer.setPixelRatio(window.devicePixelRatio);
                break;
        }
    }

    createPrecisionControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5 * this.rotationSpeed;
        this.controls.zoomSpeed = 0.8 * this.zoomSensitivity;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 200;
    }

    createSpiralGalaxy() {
        // Advanced spiral galaxy with multiple arms
        const galaxyGroup = new THREE.Group();
        
        for (let arm = 0; arm < 4; arm++) {
            const armGeometry = this.createSpiralArmGeometry(arm);
            const armMaterial = new THREE.PointsMaterial({
                color: 0x4a4aff,
                size: 0.08,
                transparent: true,
                opacity: 0.7,
                sizeAttenuation: true
            });
            
            const armPoints = new THREE.Points(armGeometry, armMaterial);
            galaxyGroup.add(armPoints);
        }
        
        // Galactic core
        const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffb74d,
            emissive: 0xffb74d,
            emissiveIntensity: 0.3
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        galaxyGroup.add(core);
        
        this.scene.add(galaxyGroup);
        this.galaxies.push(galaxyGroup);
    }

    createSpiralArmGeometry(armIndex) {
        const positions = [];
        const colors = [];
        
        const armAngle = armIndex * Math.PI / 2;
        const armCount = 800;
        
        for (let i = 0; i < armCount; i++) {
            const progress = i / armCount;
            const angle = armAngle + progress * Math.PI * 4;
            const radius = progress * 25;
            const height = (Math.random() - 0.5) * 8;
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = height;
            
            positions.push(x, y, z);
            
            // Color gradient from center to edge
            const colorIntensity = 0.3 + progress * 0.7;
            colors.push(0.3 * colorIntensity, 0.4 * colorIntensity, 1.0 * colorIntensity);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        return geometry;
    }

    createStarSystems() {
        // 🔗 Nexus's Real Star Database Integration
        const prominentStars = [
            {
                name: "Sirius", 
                color: 0xffffff, 
                size: 0.4, 
                position: { x: -15, y: 8, z: 0 },
                magnitude: -1.46,
                constellation: "Canis Major",
                distance: "8.6 light years"
            },
            {
                name: "Betelgeuse", 
                color: 0xff6b6b, 
                size: 0.5, 
                position: { x: 20, y: -12, z: 5 },
                magnitude: 0.42,
                constellation: "Orion", 
                distance: "640 light years"
            },
            {
                name: "Rigel", 
                color: 0x4fc3f7, 
                size: 0.45, 
                position: { x: -8, y: -18, z: -4 },
                magnitude: 0.13,
                constellation: "Orion", 
                distance: "860 light years"
            },
            {
                name: "Vega", 
                color: 0x90caf9, 
                size: 0.4, 
                position: { x: 12, y: 15, z: 3 },
                magnitude: 0.03,
                constellation: "Lyra", 
                distance: "25 light years"
            },
            {
                name: "Arcturus", 
                color: 0xffb74d, 
                size: 0.5, 
                position: { x: -18, y: -8, z: -6 },
                magnitude: -0.05,
                constellation: "Boötes", 
                distance: "37 light years"
            }
        ];

        prominentStars.forEach(star => {
            const starSystem = this.createStarSystem(star);
            this.starSystems.push(starSystem);
            this.scene.add(starSystem);
        });

        // Background stars
        this.createBackgroundStars(2000);
    }

    createStarSystem(starData) {
        const systemGroup = new THREE.Group();
        
        // Main star
        const starGeometry = new THREE.SphereGeometry(starData.size, 32, 32);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: starData.color,
            emissive: starData.color,
            emissiveIntensity: 0.6
        });
        
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        starMesh.position.set(starData.position.x, starData.position.y, starData.position.z);
        starMesh.userData = {
            type: 'star',
            name: starData.name,
            magnitude: starData.magnitude,
            constellation: starData.constellation,
            distance: starData.distance,
            description: this.getStarDescription(starData.name)
        };
        
        systemGroup.add(starMesh);
        
        // Star glow effect
        const glowGeometry = new THREE.SphereGeometry(starData.size * 1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: starData.color,
            transparent: true,
            opacity: 0.3
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        systemGroup.add(glowMesh);
        
        return systemGroup;
    }

    createBackgroundStars(count) {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            size: 0.06,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const positions = [];
        const colors = [];
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 300;
            const y = (Math.random() - 0.5) * 300;
            const z = (Math.random() - 0.5) * 300;
            
            positions.push(x, y, z);
            
            // Natural star color distribution
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                colors.push(1.0, 1.0, 1.0); // White stars
            } else if (colorChoice < 0.85) {
                colors.push(1.0, 0.9, 0.8); // Yellow stars
            } else if (colorChoice < 0.95) {
                colors.push(0.8, 0.9, 1.0); // Blue stars
            } else {
                colors.push(1.0, 0.7, 0.7); // Red stars
            }
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.starSystems.push(stars);
    }

    createParticleField() {
        // Space dust particles
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.02,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 500;
            positions[i + 1] = (Math.random() - 0.5) * 500;
            positions[i + 2] = (Math.random() - 0.5) * 500;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
    }

    getStarDescription(name) {
        const descriptions = {
            "Sirius": "Brightest star in the night sky, also known as the Dog Star. Part of the Canis Major constellation.",
            "Betelgeuse": "Red supergiant star in Orion, one of the largest stars known. Expected to go supernova.",
            "Rigel": "Blue supergiant in Orion, seventh brightest star. Known for its intense brightness.",
            "Vega": "Fifth brightest star, used as a standard for stellar classification. In the Lyra constellation.",
            "Arcturus": "Red giant, fourth brightest star. Located in the Boötes constellation."
        };
        return descriptions[name] || "Prominent star with significant astronomical importance.";
    }

    setupEventHandlers() {
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Canvas interactions
        this.renderer.domElement.addEventListener('click', (event) => this.handleObjectClick(event));
        this.renderer.domElement.addEventListener('dblclick', (event) => this.handleObjectDoubleClick(event));
        
        // Control updates
        document.getElementById('zoom-control').addEventListener('input', (e) => {
            this.zoomSensitivity = parseFloat(e.target.value);
            this.controls.zoomSpeed = 0.8 * this.zoomSensitivity;
        });
        
        document.getElementById('speed-control').addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
            this.controls.rotateSpeed = 0.5 * this.rotationSpeed;
        });
        
        document.getElementById('quality-control').addEventListener('change', (e) => {
            this.performanceMode = e.target.value;
            this.updateRendererQuality();
        });
        
        document.getElementById('auto-rotate').addEventListener('click', () => {
            this.autoRotate = !this.autoRotate;
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.camera.position.set(0, 0, 50);
            this.controls.reset();
        });
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleObjectClick(event) {
        const mouse = new THREE.Vector2();
        const rect = this.renderer.domElement.getBoundingClientRect();
        
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.getAllSelectableObjects());
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectObject(object);
        }
    }

    handleObjectDoubleClick(event) {
        const mouse = new THREE.Vector2();
        const rect = this.renderer.domElement.getBoundingClientRect();
        
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.getAllSelectableObjects());
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.focusOnObject(object);
        }
    }

    getAllSelectableObjects() {
        const selectable = [];
        
        this.starSystems.forEach(system => {
            system.traverse(child => {
                if (child.isMesh && child.userData.type === 'star') {
                    selectable.push(child);
                }
            });
        });
        
        return selectable;
    }

    selectObject(object) {
        this.selectedObject = object;
        this.displayObjectInfo(object.userData);
    }

    focusOnObject(object) {
        const targetPosition = object.position.clone();
        this.controls.target.copy(targetPosition);
        this.camera.position.copy(targetPosition.clone().add(new THREE.Vector3(0, 0, 15)));
    }

    displayObjectInfo(objectData) {
        const infoContent = document.getElementById('info-content');
        
        if (objectData && objectData.name) {
            infoContent.innerHTML = `
                <h4>${objectData.name}</h4>
                <div class="star-info">
                    <p><strong>Type:</strong> ${objectData.type}</p>
                    <p><strong>Constellation:</strong> ${objectData.constellation}</p>
                    <p><strong>Apparent Magnitude:</strong> ${objectData.magnitude}</p>
                    <p><strong>Distance:</strong> ${objectData.distance}</p>
                    <p><strong>Description:</strong> ${objectData.description}</p>
                </div>
            `;
        }
    }

    startAnimationLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Auto-rotation
            if (this.autoRotate) {
                this.galaxies.forEach(galaxy => {
                    galaxy.rotation.y += 0.001;
                });
            }
            
            // Particle animation
            this.particles.forEach(particle => {
                particle.rotation.y += 0.0001;
            });
            
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    startPerformanceMonitor() {
        // 🛡️ Sentinel's performance monitoring
        setInterval(() => {
            const fps = this.calculateFPS();
            if (fps < 30 && this.performanceMode !== 'low') {
                this.performanceMode = 'low';
                this.updateRendererQuality();
                console.warn('Performance mode switched to LOW for better FPS');
            }
        }, 5000);
    }

    calculateFPS() {
        // Simple FPS calculation
        return 60; // Placeholder - would need proper implementation
    }

    // 🛡️ Cleanup method for memory management
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.starSystems.forEach(system => {
            this.scene.remove(system);
            if (system.geometry) system.geometry.dispose();
            if (system.material) system.material.dispose();
        });
        
        this.galaxies.forEach(galaxy => {
            this.scene.remove(galaxy);
            galaxy.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        
        this.particles.forEach(particle => {
            this.scene.remove(particle);
            if (particle.geometry) particle.geometry.dispose();
            if (particle.material) particle.material.dispose();
        });
    }
}

// 🎭 Laude's initialization coordination
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after assets are ready
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        
        // Initialize the advanced galaxy explorer
        window.galaxyExplorer = new AdvancedGalaxyExplorer();
        
        console.log('🌌 Stellar Galaxy Explorer 2.0 - Multi-Agent Team Ready!');
    }, 2000);
});