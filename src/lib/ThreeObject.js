import * as THREE from 'three';
import { TextureLoader } from 'three';
import { base } from '$app/paths';
import { audioSystem } from '$lib/AudioSystem.js';

import { browser } from '$app/environment';

// Create a new TextureLoader
let loader;
let texture = [];

if (browser) {
    loader = new TextureLoader();
    // Initialize with placeholders (1x1 transparent pixel)
    // This prevents 404s or WebGL errors while waiting for real textures
    const placeholder = new THREE.Texture();
    texture = [
        placeholder, placeholder, placeholder, placeholder,
        placeholder, placeholder, placeholder
    ];

    // Immediate load of the first texture
    loader.load(`${base}/my-photo.webp`, (loadedTexture) => {
        texture[0] = loadedTexture;
        // If sphere is already created, update it immediately
        if (typeof SPHERE !== 'undefined' && SPHERE && SPHERE.material) {
            SPHERE.material.uniforms.tDiffuse1.value = loadedTexture;
            SPHERE.material.uniforms.tDiffuse1.needsUpdate = true;
        }
    });
}

// Exported function to set the initial texture from a pre-loaded image
export const setInitialTexture = (img) => {
    if (!img) return;

    const loadedTexture = new THREE.Texture(img);
    loadedTexture.needsUpdate = true;
    texture[0] = loadedTexture;

    // If sphere is already created, update it immediately
    if (typeof SPHERE !== 'undefined' && SPHERE && SPHERE.material) {
        SPHERE.material.uniforms.tDiffuse1.value = loadedTexture;
        SPHERE.material.uniforms.tDiffuse1.needsUpdate = true;
    }
};

// Exported function to load textures lazily
export const loadTextures = () => {
    if (!browser || !loader) return;

    console.log('Lazy loading textures...');

    const textureUrls = [
        `${base}/my-photo.webp`,
        `${base}/my-photo2.webp`,
        `${base}/photo3.webp`,
        `${base}/photo4.webp`,
        `${base}/photo5.webp`,
        `${base}/photo6.webp`,
        `${base}/photo8.webp`
    ];

    textureUrls.forEach((url, index) => {
        // Skip the first texture as it is loaded immediately on init or via setInitialTexture
        if (index === 0) return;

        loader.load(url, (loadedTexture) => {
            texture[index] = loadedTexture;

            // Update shader uniforms if this texture is currently in use
            if (SPHERE && SPHERE.material) {
                // We need to trigger a re-render or update uniforms if they are currently using this index
                // Since we cycle through textures, we can just let the next cycle pick it up, 
                // or we can force update if it's the very first one.
                if (index === 0 && SPHERE.material.uniforms.tDiffuse1.value === placeholder) {
                    SPHERE.material.uniforms.tDiffuse1.value = loadedTexture;
                    SPHERE.material.uniforms.tDiffuse1.needsUpdate = true;
                }
            }
        });
    });
};

let Renderer;
const SCENE = new THREE.Scene();
let n = 0.2;

// Drag controls variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let sphereRotation = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
const rotationSpeed = 0.002; // Reduced from 0.008
const dampingFactor = 0.03; // Reduced from 0.05
let dragStartTime = 0;
let hasMovedWhileDragging = false;

// Custom ShaderMaterial for morphing with wave-based texture distortion
const morphShader = {
    uniforms: {
        tDiffuse1: { value: texture[0] },
        tDiffuse2: { value: texture[1] },
        morphFactor: { value: n },
        time: { value: 0 },
        uAudioLow: { value: 0 },
        uAudioMid: { value: 0 },
        uAudioHigh: { value: 0 }
    },
    vertexShader: `
        uniform float time;
        uniform float uAudioLow;
        uniform float uAudioMid;
        uniform float uAudioHigh;
        varying vec2 vUv;
        varying float vDisplacement;

        void main() {
            vUv = uv;
            vec3 pos = position;
            
            // Rhythmic wave displacement
            // Create a standing wave pattern that reacts to bass
            float wave = sin(pos.y * 5.0 + time * 2.0) * cos(pos.x * 5.0 + time) * 0.1;
            float bassWave = sin(pos.z * 10.0 + time * 5.0) * uAudioLow * 0.8; // Boosted from 0.2
            
            // High frequency jitter
            float jitter = sin(time * 20.0 + pos.x * 20.0) * uAudioHigh * 0.2; // Boosted from 0.05
            
            float totalDisplacement = wave + bassWave + jitter;
            vDisplacement = totalDisplacement;
            
            pos = pos + normal * totalDisplacement;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform float morphFactor;
        uniform float time;
        uniform float uAudioLow;
        uniform float uAudioHigh;
        varying vec2 vUv;
        varying float vDisplacement;

        void main() {
            vec2 uv = vUv;
            
            // Ripple effect on texture coordinates
            // Create concentric ripples based on audio energy
            float dist = length(uv - 0.5);
            float ripple = sin(dist * 20.0 - time * 5.0) * uAudioLow * 0.2; // Boosted from 0.05
            uv += ripple;
            
            // Chromatic aberration based on high frequencies
            float aberration = uAudioHigh * 0.05; // Boosted from 0.02
            
            vec4 color1_r = texture2D(tDiffuse1, uv + vec2(aberration, 0.0));
            vec4 color1_g = texture2D(tDiffuse1, uv);
            vec4 color1_b = texture2D(tDiffuse1, uv - vec2(aberration, 0.0));
            vec4 color1 = vec4(color1_r.r, color1_g.g, color1_b.b, 1.0);
            
            vec4 color2_r = texture2D(tDiffuse2, uv + vec2(aberration, 0.0));
            vec4 color2_g = texture2D(tDiffuse2, uv);
            vec4 color2_b = texture2D(tDiffuse2, uv - vec2(aberration, 0.0));
            vec4 color2 = vec4(color2_r.r, color2_g.g, color2_b.b, 1.0);
            
            vec4 mixedColor = mix(color1, color2, morphFactor);
            
            // Highlight peaks of the waves
            float highlight = smoothstep(0.05, 0.1, vDisplacement) * 0.2;
            mixedColor.rgb += highlight;
            
            gl_FragColor = mixedColor;
        }
    `
};

const SPHERE = new THREE.Mesh(
    new THREE.SphereGeometry(1, 200, 200),
    new THREE.ShaderMaterial(morphShader)
);

SPHERE.scale.set(1.3, 1.3, 1.3);
SPHERE.position.set(0, 0, 0);
SCENE.add(SPHERE);

// Add light sources
const light = new THREE.AmbientLight(0x404040);
SCENE.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight2.position.set(-1, 0, 1);
SCENE.add(directionalLight2);
SCENE.add(directionalLight);

let z = 5;
let m = 0.2;
let CAMERA;
if (browser) {
    CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, m, z);
} else {
    CAMERA = new THREE.PerspectiveCamera(75, 1, m, z);
}
CAMERA.position.z = 2.2;

const projectPoints = new THREE.Group();
SCENE.add(projectPoints);

// Store projects data globally to be set from Svelte
let allProjects = [];

// Declare raycaster, mouse, and INTERSECTED in the global scope
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null;
let interactionObjects = [];
let cinemaVideo = null; // Track background video for audio control

// Set audio system reference
export const setAudioSystem = (system) => {
    // Audio system is imported directly now
};

// Audio initialization
const initAudio = async () => {
    if (isAudioInitialized) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Master gain
        masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(0.92, audioContext.currentTime);
        masterGain.connect(audioContext.destination);

        // Create reverb
        const reverbTime = 2.8;
        const reverbLength = audioContext.sampleRate * reverbTime;
        reverb = audioContext.createConvolver();
        const impulseBuffer = audioContext.createBuffer(2, reverbLength, audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulseBuffer.getChannelData(channel);
            for (let i = 0; i < reverbLength; i++) {
                const decay = Math.pow(1 - i / reverbLength, 1.1);
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
            }
        }
        reverb.buffer = impulseBuffer;
        reverb.connect(masterGain);

        // Create delay
        delay = audioContext.createDelay(1.0);
        delay.delayTime.setValueAtTime(0.25, audioContext.currentTime);

        const delayFeedback = audioContext.createGain();
        delayFeedback.gain.setValueAtTime(0.3, audioContext.currentTime);

        const delayWet = audioContext.createGain();
        delayWet.gain.setValueAtTime(0.2, audioContext.currentTime);

        delay.connect(delayFeedback);
        delayFeedback.connect(delay);
        delay.connect(delayWet);
        delayWet.connect(masterGain);

        isAudioInitialized = true;
        console.log('Audio initialized successfully');

        // Hide audio notice
        const audioNotice = document.querySelector('.audio-notice');
        if (audioNotice) {
            audioNotice.style.opacity = '0';
            audioNotice.style.transform = 'translateY(-20px) translateX(-50%)';
            setTimeout(() => audioNotice?.remove(), 300);
        }

        // Welcome sound
        playWelcomeSound();

    } catch (error) {
        console.warn('Audio init failed:', error);
    }
};

// Audio functions
const playWelcomeSound = () => {
    if (!isAudioInitialized) return;

    const currentTime = audioContext.currentTime;
    const welcome = audioContext.createOscillator();
    welcome.type = 'sine';
    welcome.frequency.setValueAtTime(523, currentTime);

    const welcomeGain = audioContext.createGain();
    welcomeGain.gain.setValueAtTime(0.02, currentTime);
    welcomeGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.0);

    welcome.connect(welcomeGain);
    welcomeGain.connect(reverb);
    welcome.start();
    welcome.stop(currentTime + 1.0);
};

const playDragSound = () => {
    if (!isAudioInitialized) return;

    const currentTime = audioContext.currentTime;

    const dragOsc = audioContext.createOscillator();
    dragOsc.type = 'triangle';
    dragOsc.frequency.setValueAtTime(120 + Math.random() * 80, currentTime);

    const dragGain = audioContext.createGain();
    dragGain.gain.setValueAtTime(0.015, currentTime);
    dragGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.4);

    dragOsc.connect(dragGain);
    dragGain.connect(delay);
    dragOsc.start();
    dragOsc.stop(currentTime + 0.4);
};

const playClickSound = () => {
    if (!isAudioInitialized) return

    const currentTime = audioContext.currentTime;

    // FM synthesis click
    const carrier = audioContext.createOscillator();
    const modulator = audioContext.createOscillator();

    carrier.type = 'sine';
    modulator.type = 'sine';

    const carrierFreq = 400 + Math.random() * 200;
    carrier.frequency.setValueAtTime(carrierFreq, currentTime);
    modulator.frequency.setValueAtTime(carrierFreq * 3, currentTime);

    const modGain = audioContext.createGain();
    modGain.gain.setValueAtTime(50, currentTime);
    modGain.gain.exponentialRampToValueAtTime(5, currentTime + 0.2);

    const clickGain = audioContext.createGain();
    clickGain.gain.setValueAtTime(0.03, currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.5);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(clickGain);
    clickGain.connect(reverb);
    clickGain.connect(delay);

    carrier.start();
    modulator.start();
    carrier.stop(currentTime + 1.5);
    modulator.stop(currentTime + 1.5);
};

const playHoverSound = () => {
    if (!isAudioInitialized) return;

    const currentTime = audioContext.currentTime;

    const hover = audioContext.createOscillator();
    hover.type = 'sine';
    hover.frequency.setValueAtTime(800 + Math.random() * 400, currentTime);

    const hoverGain = audioContext.createGain();
    hoverGain.gain.setValueAtTime(0.01, currentTime);
    hoverGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.2);

    hover.connect(hoverGain);
    hoverGain.connect(reverb);
    hover.start();
    hover.stop(currentTime + 1.2);
};

const playMorphSound = () => {
    if (!isAudioInitialized) return;

    const currentTime = audioContext.currentTime;

    const morph = audioContext.createOscillator();
    morph.type = 'triangle';
    morph.frequency.setValueAtTime(150, currentTime);
    morph.frequency.exponentialRampToValueAtTime(300, currentTime + 1.0);

    const morphGain = audioContext.createGain();
    morphGain.gain.setValueAtTime(0.02, currentTime);
    morphGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.2);

    morph.connect(morphGain);
    morphGain.connect(delay);
    morph.start();
    morph.stop(currentTime + 1.2);
};

/**
 * Updates the Three.js scene with project data and regenerates points.
 */
/**
 * Updates the Three.js scene with project data and regenerates points.
 * Uses batch processing to avoid freezing the main thread.
 */
export const updateProjects = (musicProjects, programmingProjects) => {
    // Clear existing points
    while (projectPoints.children.length > 0) {
        projectPoints.remove(projectPoints.children[0]);
    }

    // Combine all projects and add IDs
    allProjects = [
        ...musicProjects.map((project, index) => ({
            ...project,
            type: 'music',
            index: index,
            id: `music-${index}`
        })),
        ...programmingProjects.map((project, index) => ({
            ...project,
            type: 'programming',
            index: index,
            id: `programming-${index}`
        }))
    ];

    // Batch creation variables
    let currentIndex = 0;
    const batchSize = 2; // Create 2 points per frame

    const processBatch = () => {
        const endIndex = Math.min(currentIndex + batchSize, allProjects.length);

        for (let i = currentIndex; i < endIndex; i++) {
            const project = allProjects[i];
            const globalIndex = i;

            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            const y = 1 - (globalIndex / (allProjects.length - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = goldenAngle * globalIndex;

            const pointMesh = createDestructiblePoint(project, {
                phi: Math.acos(y),
                theta: theta
            });
            projectPoints.add(pointMesh);
        }

        currentIndex = endIndex;

        if (currentIndex < allProjects.length) {
            requestAnimationFrame(processBatch);
        } else {
            // Finished creating points
            // Collect interaction spheres for raycasting
            interactionObjects = projectPoints.children.map(group => group.children.find(child => child instanceof THREE.Mesh));
            console.log('Finished creating project points');
        }
    };

    // Start batch processing
    processBatch();
};

let currentFocusedId = null;

/**
 * Focuses on a specific project by ID.
 * Rotates the sphere and triggers visual effects.
 */
export const focusProject = (id) => {
    // console.log("focusProject called with:", id);

    // Always find the group to ensure it exists
    const pointGroup = projectPoints.children.find(p => p.userData.id === id);

    if (pointGroup) {
        // Reset hover state for all points
        projectPoints.children.forEach(p => {
            if (p !== pointGroup) {
                p.userData.isHovered = false;
            }
        });

        // Highlight the focused point
        pointGroup.userData.isHovered = true;

        // Trigger morph effect
        const now = performance.now();
        if (!morphing || (now - lastMorphTime > 1000)) {
            morphing = true;
            morphProgress = 0;
            lastMorphTime = now;

            const uniforms = SPHERE.material.uniforms;
            uniforms.tDiffuse1.value = texture[currentTextureIndex];
            currentTextureIndex = (currentTextureIndex + 1) % texture.length;
            uniforms.tDiffuse2.value = texture[currentTextureIndex];

            // Audio removed from scroll interaction per user request
        }

        // Calculate target rotation to bring point to front (0, 0, r)
        const p = pointGroup.userData.originalPosition;

        // Calculate the rotation needed to bring p to (0, 0, r)
        // angle = atan2(x, z) is the angle of the point. We want to rotate by -angle.
        const targetY = -Math.atan2(p.x, p.z);

        // Rotation X (around horizontal axis) handles Y/Z plane
        const zProjected = Math.sqrt(p.x * p.x + p.z * p.z);
        const targetX = Math.atan2(p.y, zProjected);

        // Compensate for auto-rotation
        const autoRotationX = now * 0.00019;
        const autoRotationY = now * 0.00019;

        // Apply rotation
        targetRotation.y = targetY - autoRotationY;
        targetRotation.x = targetX - autoRotationX;

        // Force a small "kick" to ensure the loop wakes up if it was sleeping (though it shouldn't be)
        // and to make the movement feel more "active"
        sphereRotation.x += (targetRotation.x - sphereRotation.x) * 0.02; // Reduced from 0.1
        sphereRotation.y += (targetRotation.y - sphereRotation.y) * 0.02; // Reduced from 0.1
    }
};

/**
 * Creates a destructible point group with particles and interaction sphere.
 */
const createDestructiblePoint = (project, position) => {
    const pointGroup = new THREE.Group();

    // Particle system
    const particleCount = 5;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radius = 0.005 + Math.random() * 0.01;

        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta);

        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.0 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;

        sizes[i] = 1 + Math.random() * 1.2;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            destructionFactor: { value: 0 },
            hoverFactor: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float destructionFactor;
            uniform float hoverFactor;
            
            void main() {
                vColor = color;
                
                vec3 pos = position;
                
                pos += normalize(position) * hoverFactor * 0.1;
                
                if (destructionFactor > 0.0) {
                    float explosionForce = destructionFactor * 2.0;
                    pos += normalize(position) * explosionForce;
                    pos += vec3(
                        sin(time * 10.0 + position.x * 20.0) * destructionFactor * 0.05,
                        cos(time * 8.0 + position.y * 15.0) * destructionFactor * 0.05,
                        sin(time * 12.0 + position.z * 18.0) * destructionFactor * 0.05
                    );
                }
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (200.0 / -mvPosition.z) * (1.0 - destructionFactor * 0.5);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            uniform float destructionFactor;
            
            void main() {
                float distance = length(gl_PointCoord - vec2(0.5));
                if (distance > 0.5) discard;
                
                float alpha = 1.0 - distance * 2.0;
                alpha *= (1.0 - destructionFactor * 0.7);
                
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    pointGroup.add(particleSystem);

    // Add interaction sphere for raycasting
    const interactionSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8), // był 0.05
        new THREE.MeshBasicMaterial({ visible: false })
    );
    pointGroup.add(interactionSphere);

    // Position the group on the sphere
    const sphereRadius = 1.6;
    pointGroup.position.x = sphereRadius * Math.sin(position.phi) * Math.cos(position.theta);
    pointGroup.position.y = sphereRadius * Math.sin(position.phi) * Math.sin(position.theta);
    pointGroup.position.z = sphereRadius * Math.cos(position.phi);

    // Store project data
    pointGroup.userData = {
        ...project,
        originalPosition: pointGroup.position.clone(),
        particleMaterial: particleMaterial,
        destructionFactor: 0,
        hoverFactor: 0,
        isHovered: false,
        isClicked: false,
        movementOffset: Math.random() * 2 * Math.PI
    };

    return pointGroup;
};

// Variables for morphing logic
let currentTextureIndex = 0;
let morphing = false;
let morphProgress = 0; // New variable for smooth easing
let baseMorphSpeed = 0.00001; // Reduced from 0.00005
let morphSpeed = baseMorphSpeed;
const morphDelay = 4000; // Increased delay (was 1500)
let lastMorphTime = 20;
let scrollPosition = 0;
let lastMorphSoundTime = 0;

// Scroll tracking
const updateScrollPosition = () => {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const scrollMultiplier = 1 + (scrollPosition / 1000) * 2;
    morphSpeed = baseMorphSpeed * Math.min(scrollMultiplier, 5);
};

if (browser) {
    window.addEventListener('scroll', updateScrollPosition);
}

const animate = async () => {
    requestAnimationFrame(animate);

    const now = performance.now();

    // Update time uniform for sphere's noise animation
    SPHERE.material.uniforms.time.value = now * 0.00001;

    // Update Audio Uniforms
    if (audioSystem && audioSystem.isInitialized) {
        const analysis = audioSystem.getAnalysis();

        // Smooth interpolation (Lerp)
        const lerp = (start, end, factor) => start + (end - start) * factor;
        const smoothFactor = 0.1; // Lower = smoother

        SPHERE.material.uniforms.uAudioLow.value = lerp(SPHERE.material.uniforms.uAudioLow.value, analysis.low, smoothFactor);
        SPHERE.material.uniforms.uAudioMid.value = lerp(SPHERE.material.uniforms.uAudioMid.value, analysis.mid, smoothFactor);
        SPHERE.material.uniforms.uAudioHigh.value = lerp(SPHERE.material.uniforms.uAudioHigh.value, analysis.high, smoothFactor);
    }

    const uniforms = SPHERE.material.uniforms;

    // Handle morphing with scroll-based speed
    // Calculate dynamic delay based on current texture type
    let currentDelay = morphDelay;
    const currentTexture = texture[currentTextureIndex];
    if (currentTexture && currentTexture.userData && currentTexture.userData.video) {
        const video = currentTexture.userData.video;
        if (video.duration) {
            // Use video duration (in ms) minus a small buffer for transition
            currentDelay = (video.duration * 1000) - 1000;
        }
    }

    if (!morphing && now - lastMorphTime > currentDelay) {
        morphing = true;
        morphProgress = 0; // Reset progress
        uniforms.tDiffuse1.value = texture[currentTextureIndex];
        currentTextureIndex = (currentTextureIndex + 1) % texture.length;
        uniforms.tDiffuse2.value = texture[currentTextureIndex];
        // uniforms.morphFactor.value = 0.5; // Removed initial jump
        lastMorphTime = now; // Reset time to now, not constant

        // Play morph sound once per morph cycle
        if (now - lastMorphSoundTime > currentDelay) {
            try {
                audioSystem.playMorphSound(uniforms.morphFactor.value);
            } catch (e) {
                // Ignore audio errors
            }
            lastMorphSoundTime = now;
        }
    }

    if (morphing) {
        morphProgress += morphSpeed * 100.0; // Adjust speed scale for progress (0-1)

        if (morphProgress >= 1.0) {
            morphProgress = 1.0;
            morphing = false;
        }

        // SmoothStep easing: t * t * (3 - 2 * t)
        const smoothed = morphProgress * morphProgress * (3.0 - 2.0 * morphProgress);
        uniforms.morphFactor.value = smoothed;
    }

    // --- Audio Logic ---
    if (audioSystem.isInitialized) {
        // Background Cinema Audio
        if (cinemaVideo) {
            cinemaVideo.muted = false;
            // Smooth fade in if needed, or just set volume
            if (cinemaVideo.volume < 0.8) {
                cinemaVideo.volume += 0.01;
            }
            if (cinemaVideo.paused) cinemaVideo.play().catch(() => { });
        }
    } else {
        // Ensure video stays muted if audio not initialized
        if (cinemaVideo) {
            cinemaVideo.muted = true;
        }
    }
    // -------------------

    // Apply drag-based rotation with smooth interpolation
    if (!isDragging) {
        sphereRotation.x += (targetRotation.x - sphereRotation.x) * dampingFactor;
        sphereRotation.y += (targetRotation.y - sphereRotation.y) * dampingFactor;
    }

    // Apply rotation to sphere and project points
    const autoRotationX = now * 0.00019;
    const autoRotationY = now * 0.00019;

    SPHERE.rotation.x = sphereRotation.x + autoRotationX;
    SPHERE.rotation.y = sphereRotation.y + autoRotationY;
    projectPoints.rotation.x = sphereRotation.x + autoRotationX;
    projectPoints.rotation.y = sphereRotation.y + autoRotationY;

    z = scrollPosition / 60 + 2;
    m = scrollPosition / 5929 + 0.01;
    n = z - 2;

    // Update particle animations
    projectPoints.children.forEach(pointGroup => {
        const userData = pointGroup.userData;
        const material = userData.particleMaterial;

        // Slow breathing movement for each point
        const timeFactor = (now * 0.0005) + userData.movementOffset;
        const movementScale = 0.05 * Math.sin(timeFactor);
        const newPosition = userData.originalPosition.clone().multiplyScalar(1 + movementScale);
        pointGroup.position.copy(newPosition);

        if (material && material.uniforms) {
            material.uniforms.time.value = now * 0.00001;

            // Hover animation
            if (userData.isHovered && userData.hoverFactor < 1.0) {
                userData.hoverFactor += 0.1;
            } else if (!userData.isHovered && userData.hoverFactor > 0.0) {
                userData.hoverFactor -= 0.1;
            }
            material.uniforms.hoverFactor.value = userData.hoverFactor;

            // Click destruction
            if (userData.isClicked && userData.destructionFactor < 3.0) {
                userData.destructionFactor += 0.1;
            }

            material.uniforms.destructionFactor.value = userData.destructionFactor;
        }
    });

    if (Renderer) {
        Renderer.render(SCENE, CAMERA);
    }
};

export const resize = async () => {
    if (Renderer) {
        Renderer.setPixelRatio(window.devicePixelRatio);
        Renderer.setSize(window.innerWidth, window.innerHeight);
        CAMERA.aspect = window.innerWidth / window.innerHeight;
        CAMERA.updateProjectionMatrix();

    }
};

// Mouse event handlers with safety checks
const onMouseDown = (event) => {
    if (!event) return;

    console.log('Mouse down detected at:', event.clientX, event.clientY);

    // Initialize audio on first user interaction
    if (!audioSystem.isInitialized) {
        audioSystem.init();
    }

    isDragging = true;
    hasMovedWhileDragging = false;
    dragStartTime = performance.now();
    currentFocusedId = null; // Allow re-focusing after manual interaction
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };

    document.body.style.cursor = 'grabbing';

    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
};

const onMouseMove = (event) => {
    if (!event) return;

    // Update mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        if (Math.abs(deltaMove.x) > 1 || Math.abs(deltaMove.y) > 1) {
            hasMovedWhileDragging = true;
            console.log('Dragging with delta:', deltaMove.x, deltaMove.y);

            // Play drag sound occasionally
            if (Math.random() < 0.58) {
                audioSystem.playDragSound();
            }

            // Update rotation
            targetRotation.y += deltaMove.x * rotationSpeed;
            targetRotation.x -= deltaMove.y * rotationSpeed;
            sphereRotation.y = targetRotation.y;
            sphereRotation.x = targetRotation.x;

            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }

        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
    } else {
        // Handle hover effects
        raycaster.setFromCamera(mouse, CAMERA);
        const intersects = raycaster.intersectObjects(interactionObjects, true);

        if (intersects.length > 0) {
            let intersectedSphere = intersects[0].object;
            let pointGroup = intersectedSphere.parent;

            if (INTERSECTED !== pointGroup && !pointGroup.userData.isClicked) {
                if (INTERSECTED) {
                    INTERSECTED.userData.isHovered = false;
                }

                INTERSECTED = pointGroup;
                INTERSECTED.userData.isHovered = true;

                // Play hover sound occasionally
                if (Math.random() < 0.3) {
                    audioSystem.playHoverSound();
                }
            }
        } else {
            if (INTERSECTED) {
                INTERSECTED.userData.isHovered = false;
                INTERSECTED = null;
            }
        }

        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    }
};

const onMouseUp = (event) => {
    console.log('Mouse up detected, was dragging:', isDragging, 'moved while dragging:', hasMovedWhileDragging);

    const dragDuration = performance.now() - dragStartTime;
    const wasDragging = isDragging && (dragDuration > 100 || hasMovedWhileDragging);

    isDragging = false;
    hasMovedWhileDragging = false;

    document.body.style.cursor = 'grab';

    if (!wasDragging) {
        handleProjectClick(event);
    }
};

const handleProjectClick = (event) => {
    if (!event) return;

    // Re-calculate mouse position for accurate raycasting
    const rect = Renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, CAMERA);
    const intersects = raycaster.intersectObjects(interactionObjects);

    if (intersects.length > 0) {
        let clickedSphere = intersects[0].object;
        let clickedGroup = clickedSphere.parent;
        const project = clickedGroup.userData;
        // Play click sound
        audioSystem.playClickSound();
        console.log('Project clicked:', project.id);



        // Mark as clicked and start permanent destruction
        if (!clickedGroup.userData.isClicked) {
            clickedGroup.userData.isClicked = true;
            clickedGroup.userData.isHovered = false;
        }

        // Scroll to the project section
        const projectElement = document.getElementById(project.id);
        if (projectElement) {
            console.log('Scrolling to project:', project.id);
            projectElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Add highlight effect
            projectElement.style.transform = 'scale(1.02)';
            projectElement.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                projectElement.style.transform = 'scale(1)';
            }, 1000);
        } else {
            console.warn('Project element not found:', project.id);
        }
    }
};

// Touch event handlers
let touchStartX = 0;
let touchStartY = 0;

const onTouchStart = (event) => {
    if (!event || !event.touches) return;
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // Do NOT prevent default here to allow potential scrolling
    // We only prevent default if we determine it's a horizontal drag in onTouchMove

    onMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => { }, // No-op for start
        stopPropagation: () => event.stopPropagation()
    });
};

const onTouchMove = (event) => {
    if (!event || !event.touches) return;
    const touch = event.touches[0];

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // If movement is primarily horizontal, treat as rotation and block scroll
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (event.cancelable) event.preventDefault();
    }
    // If movement is primarily vertical, let the browser scroll (do nothing)

    onMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => { }, // Handled above
        stopPropagation: () => event.stopPropagation()
    });
};

const onTouchEnd = (event) => {
    onMouseUp({
        preventDefault: () => { },
        stopPropagation: () => event && event.stopPropagation ? event.stopPropagation() : null
    });
};

/**
 * Creates a video texture from a file
 */
const createVideoTexture = (videoFilename) => {
    // 1. Create HTML Video Element (In-Memory)
    const video = document.createElement('video');
    video.src = `${base}/${videoFilename}`; // Uses SvelteKit base path
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true; // Required for autoplay
    video.playsInline = true;

    video.play().catch(e => console.error('Video play failed:', e));


    // 2. Create Video Texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace; // Modern Three.js color fix
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // Store video element in userData for audio control
    videoTexture.userData = { video: video };

    return videoTexture;
};

/**
 * Creates a fullscreen CSS background video
 */
const createCinemaBackground = (videoFilename) => {
    // 1. Create Video Element (reusing helper, but we don't need the texture)
    const video = document.createElement('video');
    video.src = `${base}/${videoFilename}`;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    // 2. Style as Fullscreen Background
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.zIndex = '-1'; // Behind canvas
    document.body.appendChild(video);

    video.play().catch(e => console.error('Video play failed:', e));

    return video;
};

export const setScene = async (canvas) => {
    Renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    Renderer.setClearColor(0x000000, 0); // Transparent background

    // --- Background Cinema Setup ---
    // Make sure 'demo.mp4' exists in your 'static' folder!
    // cinemaVideo = createCinemaBackground('demo.mp4');
    // -------------------------------

    // Reset sphere to initial image texture
    SPHERE.material.uniforms.tDiffuse1.value = texture[0];

    canvas.style.cursor = 'grab';

    // Add event listeners
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousedown', onMouseDown, { passive: false });
    document.addEventListener('mousemove', onMouseMove, { passive: false });
    document.addEventListener('mouseup', onMouseUp, { passive: false });

    // Touch events
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    // Test event binding
    canvas.addEventListener('mouseenter', () => {
        console.log('Mouse entered canvas - events are working!');
    });

    console.log('Scene initialized with drag controls');

    await resize();
    await animate();
};