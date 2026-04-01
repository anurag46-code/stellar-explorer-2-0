// 💻 Codex's Star Database & Management System

class StarDatabase {
    constructor() {
        this.stars = new Map();
        this.constellations = new Map();
        this.loadStarData();
    }

    loadStarData() {
        // 🔗 Nexus's Astronomical Database Integration
        this.stars.set("Sirius", {
            name: "Sirius",
            type: "Main Sequence Star",
            spectralClass: "A1V",
            magnitude: -1.46,
            distance: "8.6 light years",
            constellation: "Canis Major",
            coordinates: { ra: "06h 45m 08.9s", dec: "-16° 42′ 58″" },
            temperature: "9,940 K",
            mass: "2.02 M☉",
            radius: "1.711 R☉",
            description: "Brightest star in the night sky, also known as the Dog Star. Part of the Canis Major constellation."
        });

        this.stars.set("Betelgeuse", {
            name: "Betelgeuse",
            type: "Red Supergiant",
            spectralClass: "M1-2Ia-ab",
            magnitude: 0.42,
            distance: "640 light years",
            constellation: "Orion",
            coordinates: { ra: "05h 55m 10.3s", dec: "+07° 24′ 25″" },
            temperature: "3,500 K",
            mass: "11.6 M☉",
            radius: "887 R☉",
            description: "Red supergiant star in Orion, one of the largest stars known. Expected to go supernova."
        });

        this.stars.set("Rigel", {
            name: "Rigel",
            type: "Blue Supergiant",
            spectralClass: "B8Ia",
            magnitude: 0.13,
            distance: "860 light years",
            constellation: "Orion",
            coordinates: { ra: "05h 14m 32.3s", dec: "-08° 12′ 06″" },
            temperature: "12,100 K",
            mass: "21 M☉",
            radius: "78.9 R☉",
            description: "Blue supergiant in Orion, seventh brightest star. Known for its intense brightness."
        });

        this.stars.set("Vega", {
            name: "Vega",
            type: "Main Sequence Star",
            spectralClass: "A0V",
            magnitude: 0.03,
            distance: "25 light years",
            constellation: "Lyra",
            coordinates: { ra: "18h 36m 56.3s", dec: "+38° 47′ 01″" },
            temperature: "9,600 K",
            mass: "2.1 M☉",
            radius: "2.362 R☉",
            description: "Fifth brightest star, used as a standard for stellar classification. In the Lyra constellation."
        });

        this.stars.set("Arcturus", {
            name: "Arcturus",
            type: "Red Giant",
            spectralClass: "K1.5III",
            magnitude: -0.05,
            distance: "37 light years",
            constellation: "Boötes",
            coordinates: { ra: "14h 15m 39.7s", dec: "+19° 10′ 57″" },
            temperature: "4,286 K",
            mass: "1.08 M☉",
            radius: "25.4 R☉",
            description: "Red giant, fourth brightest star. Located in the Boötes constellation."
        });

        // Load constellation data
        this.loadConstellationData();
    }

    loadConstellationData() {
        this.constellations.set("Orion", {
            name: "Orion",
            abbreviation: "Ori",
            genitive: "Orionis",
            area: "594 sq. deg.",
            stars: ["Betelgeuse", "Rigel", "Bellatrix", "Mintaka", "Alnilam", "Alnitak", "Saiph"],
            mythology: "Hunter in Greek mythology",
            season: "Winter",
            visibility: "Worldwide"
        });

        this.constellations.set("Canis Major", {
            name: "Canis Major",
            abbreviation: "CMa",
            genitive: "Canis Majoris",
            area: "380 sq. deg.",
            stars: ["Sirius", "Mirzam", "Wezen", "Adhara"],
            mythology: "Greater Dog following Orion",
            season: "Winter",
            visibility: "Southern Hemisphere"
        });

        this.constellations.set("Lyra", {
            name: "Lyra",
            abbreviation: "Lyr",
            genitive: "Lyrae",
            area: "286 sq. deg.",
            stars: ["Vega", "Sheliak", "Sulafat"],
            mythology: "Lyre of Orpheus",
            season: "Summer",
            visibility: "Northern Hemisphere"
        });

        this.constellations.set("Boötes", {
            name: "Boötes",
            abbreviation: "Boo",
            genitive: "Boötis",
            area: "907 sq. deg.",
            stars: ["Arcturus", "Izar", "Muphrid"],
            mythology: "Herdsman or Plowman",
            season: "Spring",
            visibility: "Northern Hemisphere"
        });
    }

    getStar(name) {
        return this.stars.get(name);
    }

    getConstellation(name) {
        return this.constellations.get(name);
    }

    searchStars(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const [name, star] of this.stars) {
            if (name.toLowerCase().includes(lowerQuery) ||
                star.constellation.toLowerCase().includes(lowerQuery) ||
                star.type.toLowerCase().includes(lowerQuery)) {
                results.push(star);
            }
        }
        
        return results;
    }

    getStarsByConstellation(constellationName) {
        const constellation = this.constellations.get(constellationName);
        if (!constellation) return [];
        
        return constellation.stars.map(starName => this.stars.get(starName)).filter(Boolean);
    }

    getBrightestStars(limit = 10) {
        const allStars = Array.from(this.stars.values());
        return allStars
            .sort((a, b) => a.magnitude - b.magnitude)
            .slice(0, limit);
    }

    // 🔗 Nexus's Data Export for Integration
    exportStarData() {
        return {
            stars: Object.fromEntries(this.stars),
            constellations: Object.fromEntries(this.constellations),
            metadata: {
                totalStars: this.stars.size,
                totalConstellations: this.constellations.size,
                lastUpdated: new Date().toISOString()
            }
        };
    }
}

// 🛡️ Sentinel's Data Validation
class StarDataValidator {
    static validateStarData(starData) {
        const requiredFields = ['name', 'type', 'magnitude', 'distance', 'constellation'];
        const errors = [];
        
        for (const field of requiredFields) {
            if (!starData[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        if (typeof starData.magnitude !== 'number') {
            errors.push('Magnitude must be a number');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// 💻 Codex's Star Rendering Utilities
class StarRenderer {
    static createStarGeometry(size, segments = 32) {
        return new THREE.SphereGeometry(size, segments, segments);
    }

    static createStarMaterial(color, emissiveIntensity = 0.6) {
        return new THREE.MeshBasicMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: emissiveIntensity
        });
    }

    static createStarGlow(size, color, opacity = 0.3) {
        const geometry = new THREE.SphereGeometry(size * 1.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });
        
        return new THREE.Mesh(geometry, material);
    }

    static getStarColorByType(starType) {
        const colorMap = {
            'Blue Supergiant': 0x4fc3f7,
            'Red Supergiant': 0xff6b6b,
            'Red Giant': 0xffb74d,
            'Main Sequence Star': 0xffffff,
            'White Dwarf': 0x90caf9,
            'Neutron Star': 0xbb86fc
        };
        
        return colorMap[starType] || 0xffffff;
    }

    static getStarSizeByMagnitude(magnitude) {
        // Larger stars appear brighter (smaller magnitude numbers)
        const baseSize = 0.3;
        const magnitudeFactor = Math.max(0.1, 1 - (magnitude + 2) / 10);
        return baseSize * magnitudeFactor;
    }
}

// 🎭 Laude's Star System Factory
class StarSystemFactory {
    constructor() {
        this.database = new StarDatabase();
    }

    createStarSystem(starName) {
        const starData = this.database.getStar(starName);
        if (!starData) {
            console.warn(`Star data not found for: ${starName}`);
            return null;
        }

        // 🛡️ Validate star data
        const validation = StarDataValidator.validateStarData(starData);
        if (!validation.isValid) {
            console.error(`Invalid star data for ${starName}:`, validation.errors);
            return null;
        }

        const systemGroup = new THREE.Group();
        
        // Create main star
        const starColor = StarRenderer.getStarColorByType(starData.type);
        const starSize = StarRenderer.getStarSizeByMagnitude(starData.magnitude);
        
        const starGeometry = StarRenderer.createStarGeometry(starSize);
        const starMaterial = StarRenderer.createStarMaterial(starColor);
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        
        starMesh.userData = starData;
        systemGroup.add(starMesh);
        
        // Add glow effect
        const glowMesh = StarRenderer.createStarGlow(starSize, starColor);
        systemGroup.add(glowMesh);
        
        return systemGroup;
    }

    createMultipleStarSystems(starNames) {
        const systems = [];
        
        for (const starName of starNames) {
            const system = this.createStarSystem(starName);
            if (system) {
                systems.push(system);
            }
        }
        
        return systems;
    }

    // 🔗 Nexus's Batch Creation for Performance
    createStarSystemsBatch(starDataArray) {
        const systems = [];
        
        for (const starData of starDataArray) {
            const system = this.createStarSystemFromData(starData);
            if (system) {
                systems.push(system);
            }
        }
        
        return systems;
    }

    createStarSystemFromData(starData) {
        const validation = StarDataValidator.validateStarData(starData);
        if (!validation.isValid) {
            console.error('Invalid star data:', validation.errors);
            return null;
        }

        const systemGroup = new THREE.Group();
        
        const starColor = StarRenderer.getStarColorByType(starData.type);
        const starSize = StarRenderer.getStarSizeByMagnitude(starData.magnitude);
        
        const starGeometry = StarRenderer.createStarGeometry(starSize);
        const starMaterial = StarRenderer.createStarMaterial(starColor);
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        
        starMesh.userData = starData;
        systemGroup.add(starMesh);
        
        const glowMesh = StarRenderer.createStarGlow(starSize, starColor);
        systemGroup.add(glowMesh);
        
        return systemGroup;
    }
}

// Export for global access
window.StarDatabase = StarDatabase;
window.StarRenderer = StarRenderer;
window.StarSystemFactory = StarSystemFactory;
window.StarDataValidator = StarDataValidator;