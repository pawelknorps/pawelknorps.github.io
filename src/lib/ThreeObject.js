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

// Exported function to manually load a texture at a specific index
export const loadTextureAtIndex = (index) => {
    if (!browser || !loader) return;

    const textureUrls = [
        `${base}/my-photo.webp`,
        `${base}/my-photo2.webp`,
        `${base}/photo3.webp`,
        `${base}/photo4.webp`,
        `${base}/photo5.webp`,
        `${base}/photo6.webp`,
        `${base}/photo8.webp`
    ];

    if (index >= 0 && index < textureUrls.length) {
        const url = textureUrls[index];
        loader.load(url, (loadedTexture) => {
            texture[index] = loadedTexture;

            // Update shader uniforms if this texture is currently in use
            if (SPHERE && SPHERE.material) {
                if (index === 0 && SPHERE.material.uniforms.tDiffuse1.value === placeholder) {
                    SPHERE.material.uniforms.tDiffuse1.value = loadedTexture;
                    SPHERE.material.uniforms.tDiffuse1.needsUpdate = true;
                }
            }
        });
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

const ABOUT_TEXT_LINES = [
    'Pawel Knorps - artysta poruszajacy sie miedzy tradycja a eksploracja, oddany dzwiekowi jako sile przekraczajacej granice. Absolwent gitary jazzowej poznanskiej Akademii Muzycznej oraz kompozycji jazzowej na dunskiej Danish National Academy of Music w Odense.',
    'Jego muzyczna podroz jest skupiona wokol improwizacji - nie tylko na gitarze, ale rowniez jako basista, producent i kompozytor. Pawel poszukuje w muzyce przestrzeni wolnosci, miejsca, gdzie intuicja spotyka sie z ryzykiem, a dzwiek przeistacza sie w narracje.',
    'Jego zespol Pawel Knorps Group, tworzony z wybitnymi poznanskimi muzykami, to swiadectwo tej wizji - jazzowy dialog, wyrastajacy z lat doswiadczen muzycznych, ekspresji i otwartosci. Projekt ten zdobyl uznanie w finale Blue Note Competition 2024.',
    'Jego alter ego - enthymeme - to swiat elektronicznej improwizacji. W dzwiekach klubow takich jak Farby czy Dom Technika tworzy on pejzaze z pogranicza chaosu i struktury, gdzie technologia spotyka sie z ludzkim dotykiem.',
    'Dzis, po powrocie z Danii, Pawel zasila poznanskie projekty - od delikatnych brzmien Milomi, przez senne marzenia SNY, folkowo-djentowe eksploracje kolektywu Przesilenie, world-music z GanaVana, po alternatywne i orientalne brzmienia Aktas Erdogan Trio.',
    'Kazda z tych formacji jest przejawem niezaspokojonej ciekawosci w poszukiwaniu wlasnej ekspresji.'
];

const fallbackTextTexture = new THREE.DataTexture(
    new Uint8Array([0, 0, 0, 0]),
    1,
    1,
    THREE.RGBAFormat
);
fallbackTextTexture.needsUpdate = true;
const fallbackVideoTexture = new THREE.DataTexture(
    new Uint8Array([0, 0, 0, 255]),
    1,
    1,
    THREE.RGBAFormat
);
fallbackVideoTexture.needsUpdate = true;
const SRGB_COLOR_SPACE_KEY = 'SRGB' + 'ColorSpace';
const srgbColorSpace = THREE[SRGB_COLOR_SPACE_KEY];

const createAboutTextTexture = () => {
    if (typeof document === 'undefined') {
        return fallbackTextTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(5, 8, 16, 0.0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(214, 243, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(228, 244, 255, 1)');

    ctx.font = '700 30px "Space Grotesk", "Sora", sans-serif';
    ctx.fillStyle = gradient;
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(8, 16, 38, 0.95)';
    ctx.shadowBlur = 10;

    const lineHeight = 50;
    let y = 24;
    while (y < canvas.height + lineHeight) {
        const line = ABOUT_TEXT_LINES[Math.floor((y / lineHeight) % ABOUT_TEXT_LINES.length)];
        ctx.fillText(`${line}  //  `, 40, y);
        y += lineHeight;
    }

    const textTexture = new THREE.CanvasTexture(canvas);
    textTexture.wrapS = THREE.RepeatWrapping;
    textTexture.wrapT = THREE.RepeatWrapping;
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;
    textTexture.needsUpdate = true;
    return textTexture;
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
        tAboutText: { value: fallbackTextTexture },
        tVideo: { value: fallbackVideoTexture },
        videoMix: { value: 0 },
        aboutTextIntensity: { value: 0 },
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
        uniform sampler2D tAboutText;
        uniform sampler2D tVideo;
        uniform float videoMix;
        uniform float aboutTextIntensity;
        uniform float morphFactor;
        uniform float time;
        varying vec2 vUv;
        varying float vDisplacement;

        void main() {
            vec2 offset = vec2(0.3, 0.2);
            vec2 shiftedUv = fract(vUv + offset); 
            vec4 color1 = texture2D(tDiffuse1, shiftedUv);
            vec4 color2 = texture2D(tDiffuse2, shiftedUv);
            vec4 baseColor = mix(color1, color2, morphFactor);

            vec2 textUv = vec2(
                fract(vUv.x * 1.2 + time * 0.018),
                fract(vUv.y * 2.0 - time * 0.012)
            );
            vec4 textColor = texture2D(tAboutText, textUv);
            float textMask = smoothstep(0.08, 0.9, textColor.a) * aboutTextIntensity;

            float pulse = 0.6 + 0.4 * sin(time * 2.2 + vUv.y * 8.0);
            vec3 hologram = mix(vec3(0.78, 0.92, 1.0), vec3(1.0, 1.0, 1.0), pulse);

            float scanline = 0.96 + 0.04 * sin((vUv.y + time * 0.08) * 320.0);
            vec3 projected = baseColor.rgb + hologram * textMask * 0.95;
            vec3 finalColor = mix(baseColor.rgb, projected, textMask) * scanline;

            vec2 videoUv = vec2(fract(vUv.x + time * 0.006), 1.0 - vUv.y);
            vec3 videoColor = texture2D(tVideo, videoUv).rgb;
            float videoMask = smoothstep(0.12, 0.92, videoMix);
            finalColor = mix(finalColor, mix(finalColor, videoColor, 0.92), videoMask);

            gl_FragColor = vec4(finalColor, baseColor.a);
        }
    `
};

const SPHERE = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
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
const baseCameraFov = 75;
const focusCameraFov = 56;
const baseSphereScale = 1.3;
const focusSphereScale = 1.72;

const projectPoints = new THREE.Group();
SCENE.add(projectPoints);
let bioSpacePlane = null;

// Store projects data globally to be set from Svelte
let allProjects = [];

// Declare raycaster, mouse, and INTERSECTED in the global scope
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null;
let interactionObjects = [];
let projectOpenHandler = null;

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
// --- Instanced Shader Material ---
const instancedParticleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        attribute float aSize;
        attribute vec3 aColor;
        attribute vec3 aInstancePosition;
        attribute float aHoverFactor;
        attribute float aDestructionFactor;
        attribute float aMovementOffset;
        
        varying vec3 vColor;
        varying float vDestructionFactor;
        
        uniform float time;
        
        void main() {
            vColor = aColor;
            vDestructionFactor = aDestructionFactor;
            
            // Local vertex position (one of the points)
            vec3 pos = position;
            
            // Project position on sphere
            vec3 instancePos = aInstancePosition;
            
            // Local expansion during hover
            pos += normalize(position) * aHoverFactor * 0.1;
            
            // Final world position
            vec3 worldPos = instancePos + pos;
            
            // Destruction effect
            if (aDestructionFactor > 0.0) {
                float explosionForce = aDestructionFactor * 2.0;
                worldPos += normalize(pos) * explosionForce;
                worldPos += vec3(
                    sin(time * 10.0 + pos.x * 20.0) * aDestructionFactor * 0.05,
                    cos(time * 8.0 + pos.y * 15.0) * aDestructionFactor * 0.05,
                    sin(time * 12.0 + pos.z * 18.0) * aDestructionFactor * 0.05
                );
            }
            
            vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
            gl_PointSize = aSize * (200.0 / -mvPosition.z) * (1.0 - aDestructionFactor * 0.5);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        varying float vDestructionFactor;
        
        void main() {
            float distance = length(gl_PointCoord - vec2(0.5));
            if (distance > 0.5) discard;
            
            float alpha = 1.0 - distance * 2.0;
            alpha *= (1.0 - vDestructionFactor * 0.7);
            
            gl_FragColor = vec4(vColor, alpha);
        }
    `,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending
});

/**
 * Updates the Three.js scene with project data and regenerates points.
 * Uses instanced rendering for efficiency.
 */
export const updateProjects = (musicProjects, programmingProjects) => {
    // Clear existing points and dispose of resources
    projectPoints.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
    while (projectPoints.children.length > 0) {
        projectPoints.remove(projectPoints.children[0]);
    }
    interactionObjects.length = 0;
    instancedInteractionGroups = [];

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

    if (allProjects.length === 0) return;

    // Create Instanced Geometry
    const particleCountPerProject = 5;
    const baseGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(particleCountPerProject * 3);
    for (let i = 0; i < particleCountPerProject; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radius = 0.005 + Math.random() * 0.01;
        vertices[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        vertices[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        vertices[i * 3 + 2] = radius * Math.cos(theta);
    }
    baseGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    const instancedGeometry = new THREE.InstancedBufferGeometry();
    instancedGeometry.attributes.position = baseGeometry.attributes.position;

    const numInstances = allProjects.length;
    particleHoverFactors = new Float32Array(numInstances);
    particleDestructionFactors = new Float32Array(numInstances);
    const instancePositions = new Float32Array(numInstances * 3);
    const instanceColors = new Float32Array(numInstances * 3);
    const instanceSizes = new Float32Array(numInstances);
    const movementOffsets = new Float32Array(numInstances);

    instancedGeometry.setAttribute('aInstancePosition', new THREE.InstancedBufferAttribute(instancePositions, 3));
    instancedGeometry.setAttribute('aHoverFactor', new THREE.InstancedBufferAttribute(particleHoverFactors, 1));
    instancedGeometry.setAttribute('aDestructionFactor', new THREE.InstancedBufferAttribute(particleDestructionFactors, 1));
    instancedGeometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(instanceColors, 3));
    instancedGeometry.setAttribute('aSize', new THREE.InstancedBufferAttribute(instanceSizes, 1));
    instancedGeometry.setAttribute('aMovementOffset', new THREE.InstancedBufferAttribute(movementOffsets, 1));

    instancedParticleSystem = new THREE.Points(instancedGeometry, instancedParticleMaterial);
    instancedParticleSystem.frustumCulled = false; // Ensure it doesn't pop out
    projectPoints.add(instancedParticleSystem);

    // Batch creation of interaction objects
    let currentIndex = 0;
    const batchSize = 2;

    const processBatch = () => {
        const endIndex = Math.min(currentIndex + batchSize, allProjects.length);

        for (let i = currentIndex; i < endIndex; i++) {
            const project = allProjects[i];
            const globalIndex = i;

            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            const y = 1 - (globalIndex / (max(1, allProjects.length - 1))) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = goldenAngle * globalIndex;

            const phi = Math.acos(y);
            const sphereRadius = 1.6;
            const posX = sphereRadius * Math.sin(phi) * Math.cos(theta);
            const posY = sphereRadius * Math.sin(phi) * Math.sin(theta);
            const posZ = sphereRadius * Math.cos(phi);

            // Update instanced attributes
            instancePositions[i * 3] = posX;
            instancePositions[i * 3 + 1] = posY;
            instancePositions[i * 3 + 2] = posZ;

            instanceColors[i * 3] = 1.0;
            instanceColors[i * 3 + 1] = 0.0 + Math.random() * 0.2;
            instanceColors[i * 3 + 2] = 0.5 + Math.random() * 0.3;

            instanceSizes[i] = 1 + Math.random() * 1.2;
            movementOffsets[i] = Math.random() * 2 * Math.PI;

            // Create interaction group
            const pointGroup = new THREE.Group();
            pointGroup.position.set(posX, posY, posZ);

            const interactionSphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 8, 8),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            pointGroup.add(interactionSphere);
            projectPoints.add(pointGroup);

            interactionObjects.push(interactionSphere);

            pointGroup.userData = {
                ...project,
                originalPosition: pointGroup.position.clone(),
                instanceIndex: i,
                hoverFactor: 0,
                destructionFactor: 0,
                isHovered: false,
                isClicked: false,
                movementOffset: movementOffsets[i]
            };

            instancedInteractionGroups.push(pointGroup);
        }

        instancedGeometry.attributes.aInstancePosition.needsUpdate = true;
        instancedGeometry.attributes.aColor.needsUpdate = true;
        instancedGeometry.attributes.aSize.needsUpdate = true;
        instancedGeometry.attributes.aMovementOffset.needsUpdate = true;

        currentIndex = endIndex;

        if (currentIndex < allProjects.length) {
            requestAnimationFrame(processBatch);
        }
    };

    function max(a, b) { return a > b ? a : b; }

    processBatch();
};

let currentFocusedId = null;

/**
 * Focuses on a specific project by ID.
 * Rotates the sphere and triggers visual effects.
 */
export const focusProject = (id) => {
    // console.log("focusProject called with:", id);

    // Find the group among children that has the matching ID
    const pointGroup = instancedInteractionGroups.find(p => p.userData && p.userData.id === id);

    if (pointGroup) {
        // Reset hover state for all points
        instancedInteractionGroups.forEach(p => {
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
        }

        // Calculate target rotation to bring point to front
        const p = pointGroup.userData.originalPosition;
        const targetY = -Math.atan2(p.x, p.z);
        const zProjected = Math.sqrt(p.x * p.x + p.z * p.z);
        const targetX = Math.atan2(p.y, zProjected);

        const autoRotationX = now * 0.00019;
        const autoRotationY = now * 0.00019;

        targetRotation.y = targetY - autoRotationY;
        targetRotation.x = targetX - autoRotationX;

        // Smooth transition
        sphereRotation.x += (targetRotation.x - sphereRotation.x) * 0.02;
        sphereRotation.y += (targetRotation.y - sphereRotation.y) * 0.02;
    }
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
let aboutTextTexture = null;
let aboutProjectionTarget = 0;
let aboutProjectionCurrent = 0;
let bioFocusTarget = 0;
let bioFocusCurrent = 0;
let projectedVideoMixTarget = 0;
let projectedVideoMixCurrent = 0;
let projectedVideoEl = null;
let projectedVideoTexture = null;

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
    aboutProjectionCurrent += (aboutProjectionTarget - aboutProjectionCurrent) * 0.06;
    uniforms.aboutTextIntensity.value = aboutProjectionCurrent;
    projectedVideoMixCurrent += (projectedVideoMixTarget - projectedVideoMixCurrent) * 0.06;
    uniforms.videoMix.value = projectedVideoMixCurrent;
    bioFocusCurrent += (bioFocusTarget - bioFocusCurrent) * 0.05;

    const targetCameraZ = 2.2 - bioFocusCurrent * 0.9;
    CAMERA.position.z += (targetCameraZ - CAMERA.position.z) * 0.08;
    const nextFov = baseCameraFov - (baseCameraFov - focusCameraFov) * bioFocusCurrent;
    if (Math.abs(CAMERA.fov - nextFov) > 0.001) {
        CAMERA.fov = nextFov;
        CAMERA.updateProjectionMatrix();
    }

    const sphereScale = baseSphereScale + (focusSphereScale - baseSphereScale) * bioFocusCurrent;
    SPHERE.scale.set(sphereScale, sphereScale, sphereScale);

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

    if (bioSpacePlane) {
        bioSpacePlane.material.opacity = bioFocusCurrent * 0.9;
        bioSpacePlane.rotation.z += 0.0004 + bioFocusCurrent * 0.0008;
        bioSpacePlane.material.map.offset.x += 0.0001 + bioFocusCurrent * 0.0005;
        bioSpacePlane.material.map.offset.y -= 0.00005 + bioFocusCurrent * 0.0002;
        bioSpacePlane.position.z = -1.8 - bioFocusCurrent * 0.9;
    }

    z = scrollPosition/60+2;
    m = scrollPosition/5929+0.01;
    n = z-2;
     
    const projectPointsVisible = bioFocusCurrent < 0.92;
    projectPoints.visible = projectPointsVisible;
    projectPoints.scale.setScalar(1 - bioFocusCurrent * 0.3);

    // Update particle animations
    if (projectPointsVisible) {
    projectPoints.children.forEach(pointGroup => {
        const userData = pointGroup.userData;
        const material = userData.particleMaterial;
        
        // Slow breathing movement for each point
        const timeFactor = (now * 0.0005) + userData.movementOffset;
        const movementScale = 0.05 * Math.sin(timeFactor);
        const newPosition = userData.originalPosition.clone().multiplyScalar(1 + movementScale);
        pointGroup.position.copy(newPosition);

    // Update instanced particles
    if (instancedParticleSystem) {
        instancedParticleSystem.material.uniforms.time.value = now * 0.00001;

        instancedInteractionGroups.forEach((group, i) => {
            const userData = group.userData;
            const idx = userData.instanceIndex;

            // Slow breathing movement for each point
            const timeFactor = (now * 0.0005) + userData.movementOffset;
            const movementScale = 0.05 * Math.sin(timeFactor);
            group.position.copy(userData.originalPosition).multiplyScalar(1 + movementScale);

            // Update instanced attributes
            if (userData.isHovered && userData.hoverFactor < 1.0) {
                userData.hoverFactor += 0.1;
            } else if (!userData.isHovered && userData.hoverFactor > 0.0) {
                userData.hoverFactor -= 0.1;
            }
            particleHoverFactors[idx] = userData.hoverFactor;

            if (userData.isClicked && userData.destructionFactor < 3.0) {
                userData.destructionFactor += 0.1;
            }
            
            material.uniforms.destructionFactor.value = userData.destructionFactor;
        }
    });
    }

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

        if (projectOpenHandler) {
            const wasHandled = projectOpenHandler(project);
            if (wasHandled) {
                return;
            }
        }
        
        
        
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
    videoTexture.encoding = THREE.sRGBEncoding; // Compatibility for v0.124.0
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
    Renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    Renderer.setClearColor("#000000");
    if ('outputColorSpace' in Renderer && srgbColorSpace) {
        Renderer.outputColorSpace = srgbColorSpace;
    } else if ('outputEncoding' in Renderer && THREE.sRGBEncoding) {
        Renderer.outputEncoding = THREE.sRGBEncoding;
    }

    if (!aboutTextTexture) {
        aboutTextTexture = createAboutTextTexture();
        SPHERE.material.uniforms.tAboutText.value = aboutTextTexture;
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: aboutTextTexture,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        planeMaterial.map.repeat.set(1.5, 1.9);
        bioSpacePlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.5), planeMaterial);
        bioSpacePlane.position.set(0, 0, -1.8);
        SCENE.add(bioSpacePlane);
    }
    SPHERE.material.uniforms.aboutTextIntensity.value = aboutProjectionCurrent;
    
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

    // Async Shader Compilation to avoid freezing the main thread
    if (Renderer.compileAsync) {
        await Renderer.compileAsync(SCENE, CAMERA);
    } else {
        // Fallback for older Three.js versions
        Renderer.compile(SCENE, CAMERA);
    }

    await resize();
    await animate();
};

export const setBioProjectionEnabled = (enabled) => {
    bioFocusTarget = enabled ? 1 : 0;
    aboutProjectionTarget = enabled ? 1 : 0;
    if (!enabled) {
        projectedVideoMixTarget = 0;
    }
};

export const setProjectOpenHandler = (handler) => {
    projectOpenHandler = typeof handler === 'function' ? handler : null;
};

export const setProjectedVideo = async (url) => {
    if (!url) return false;
    try {
        if (!projectedVideoEl) {
            projectedVideoEl = document.createElement('video');
            projectedVideoEl.crossOrigin = 'anonymous';
            projectedVideoEl.muted = true;
            projectedVideoEl.loop = true;
            projectedVideoEl.playsInline = true;
        }
        if (projectedVideoEl.src !== url) {
            projectedVideoEl.src = url;
            projectedVideoEl.load();
        }
        await projectedVideoEl.play();
        if (!projectedVideoTexture) {
            projectedVideoTexture = new THREE.VideoTexture(projectedVideoEl);
            projectedVideoTexture.minFilter = THREE.LinearFilter;
            projectedVideoTexture.magFilter = THREE.LinearFilter;
            projectedVideoTexture.format = THREE.RGBFormat;
            if ('colorSpace' in projectedVideoTexture && srgbColorSpace) {
                projectedVideoTexture.colorSpace = srgbColorSpace;
            } else if ('encoding' in projectedVideoTexture && THREE.sRGBEncoding) {
                projectedVideoTexture.encoding = THREE.sRGBEncoding;
            }
        }
        SPHERE.material.uniforms.tVideo.value = projectedVideoTexture;
        projectedVideoMixTarget = 1;
        return true;
    } catch (error) {
        console.warn('Projected video start failed:', error);
        return false;
    }
};

export const clearProjectedVideo = () => {
    projectedVideoMixTarget = 0;
    SPHERE.material.uniforms.tVideo.value = fallbackVideoTexture;
    if (projectedVideoEl) {
        projectedVideoEl.pause();
        projectedVideoEl.removeAttribute('src');
        projectedVideoEl.load();
    }
};
