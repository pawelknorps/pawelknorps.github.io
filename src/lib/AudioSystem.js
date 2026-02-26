
// AudioSystem.js - Separate audio module for easier debugging

// import pkg from '@rnbo/js';
// const { createDevice } = pkg;
// import patcher from '$lib/rnbo/efxplussynth.json';
import { GenerativeConductor } from '$lib/GenerativeConductor.js';

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.rnboDevice = null;
        this.analyser = null; // Audio analysis
        this.isInitialized = false;
        this.rnboPkg = null;
        this.volume = 0.52;
        this.synthVelocityScale = 0.42;

        // Parameter state
        this.params = {
            window: 100,
            chorus: 20,
            delay: 200,
            feedback: 30
        };

        // Throttling
        this.lastCallTimes = {
            drag: 0,
            generativeLow: 0,
            hover: 0,
            click: 0,
            ambient: 0
        };

        this.keyMap = {
            a: 60, w: 61, s: 62, e: 63, d: 64, f: 65,
            t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72
        };
        this.activeKeyboardNotes = new Set();
        this.keyboardAttached = false;
        this.keyboardHandlers = null;
        this.noteTriggerHandler = null;
        this.userSoundProfile = null;
        this.userSoundProfileVersion = 2;
        this.initPromise = null;
        this.generativeConductor = null;
        this.generativeEnabled = true;
        this.generativeSuppressed = false;
        this.generativeMacros = this.generateGenerativeProfile();
        this.generativeKeyLocked = false;
        this.conductorTickIntervalId = null;
        this.pendingScheduledTimeouts = new Set();
        this.activeGeneratedNotes = new Set();
    }

    async init() {
        if (this.initPromise) {
            await this.initPromise;
            return;
        }

        if (this.isInitialized) {
            if (this.audioContext?.state === 'suspended') {
                await this.audioContext.resume();
            }
            // Scene lifecycles can detach keyboard handlers; ensure they are always reattached.
            this.attachComputerKeyboard();
            return;
        }

        this.initPromise = (async () => {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            console.log('Audio context initialized:', this.audioContext.state);

            // Master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

            // Analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.9; // Smoother response

            // Skip RNBO only for touch-centric narrow mobile environments.
            const hasTouch = typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 0;
            const isMobile = hasTouch && window.innerWidth < 768;

            if (!isMobile) {
                // Setup MIDI immediately (don't wait for RNBO to load)
                this.setupMIDI();

                // Load RNBO Device
                await this.loadRNBOPatch();
            } else {
                console.log('Mobile device detected: Skipping MIDI and RNBO loading for performance');
                // Connect master gain directly to analyser for basic audio routing if needed
                this.masterGain.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }

            this.isInitialized = true;
            console.log('Audio system initialized successfully');

            // Hide audio notice
            const audioNotice = document.querySelector('.audio-notice');
            if (audioNotice) {
                audioNotice.style.opacity = '0';
                audioNotice.style.transform = 'translateY(-20px) translateX(-50%)';
                setTimeout(() => audioNotice?.remove(), 300);
            }

            // Welcome chime
            this.playWelcomeSound();

        })();

        try {
            await this.initPromise;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        } finally {
            this.initPromise = null;
        }
    }

    /**
     * Gets current audio analysis data.
     * @returns {Object} { low, mid, high } normalized 0-1
     */
    getAnalysis() {
        if (!this.analyser) return { low: 0, mid: 0, high: 0 };

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate bands
        let low = 0, mid = 0, high = 0;
        const lowBound = Math.floor(bufferLength * 0.1);
        const midBound = Math.floor(bufferLength * 0.5);

        for (let i = 0; i < bufferLength; i++) {
            let val = dataArray[i] / 255.0;

            // Noise gate
            if (val < 0.1) val = 0;

            if (i < lowBound) low += val;
            else if (i < midBound) mid += val;
            else high += val;
        }

        return {
            low: low / lowBound,
            mid: mid / (midBound - lowBound),
            high: high / (bufferLength - midBound)
        };
    }

    async loadRNBOPatch() {
        try {
            // Dynamically load the patcher
            const patcherModule = await import('$lib/rnbo/efxplussynth.json');
            const patcher = patcherModule.default;

            // Dynamically load RNBO library
            if (!this.rnboPkg) {
                this.rnboPkg = await import('@rnbo/js');
            }
            const { createDevice } = this.rnboPkg;

            // Create RNBO device
            this.rnboDevice = await createDevice({ context: this.audioContext, patcher });

            // Connect: MasterGain -> RNBO -> Analyser -> Destination
            // Note: We route internal sounds to MasterGain, then to RNBO
            this.masterGain.connect(this.rnboDevice.node);
            this.rnboDevice.node.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Apply persistent per-user sound profile (strong randomization)
            this.userSoundProfile = this.getOrCreateUserSoundProfile();
            this.applyParameterMap(this.userSoundProfile);

            this.attachComputerKeyboard();
            this.initGenerativeConductor();
            this.startGenerativeLoop();
            console.log('RNBO Device Loaded', this.rnboDevice.parameters);

        } catch (err) {
            console.error('Failed to load RNBO patch:', err);
            // Fallback connection if RNBO fails
            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            this.stopGenerativeLoop();
            this.generativeConductor = null;
        }
    }

    randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    skewedRandom(min, max, skew = 1) {
        const t = Math.pow(Math.random(), skew);
        return min + t * (max - min);
    }

    generateGenerativeProfile() {
        // Refresh-randomized defaults, intentionally biased above 50%.
        const highBias = () => this.randomInRange(0.52, 0.96);
        return {
            autonomy: highBias(),
            density: highBias(),
            response: highBias(),
            mood: highBias(),
            tempoBias: highBias()
        };
    }

    generateUserSoundProfile() {
        const mode = Math.floor(Math.random() * 4);
        const profile = {
            // Core
            window: Math.round(this.skewedRandom(1, 1000, mode === 0 ? 0.6 : 1.5)),
            chorus: Math.round(this.skewedRandom(0, 100, mode === 1 ? 0.8 : 1.4)),
            delay: Math.round(this.skewedRandom(40, 2000, mode === 2 ? 0.9 : 1.6)),
            feedback: Math.round(this.skewedRandom(8, 95, mode === 3 ? 0.75 : 1.4)),

            // Extra RNBO-facing params
            // Keep mix generally above 50% while still varied.
            mix: Math.round(this.randomInRange(55, 100)),
            pitchvol: Math.round(this.randomInRange(5, 100)),
            revvol: Math.round(this.randomInRange(0, 100)),
            octdamp: Math.round(this.randomInRange(0, 100)),
            octvol: Math.round(this.randomInRange(0, 100)),
            decay: Math.round(this.randomInRange(5, 100)),
            size: Math.round(this.randomInRange(0, 100)),
            damp: Math.round(this.randomInRange(0, 100)),
            jitter: Math.round(this.randomInRange(0, 80)),
            diff: Math.round(this.randomInRange(0, 100))
        };

        return profile;
    }

    getOrCreateUserSoundProfile() {
        if (this.userSoundProfile) return this.userSoundProfile;
        this.userSoundProfile = this.generateUserSoundProfile();
        return this.userSoundProfile;
    }

    getUserSoundProfile() {
        return this.userSoundProfile || this.getOrCreateUserSoundProfile();
    }

    applyParameterMap(paramMap) {
        if (!paramMap || typeof paramMap !== 'object') return;
        Object.entries(paramMap).forEach(([name, value]) => {
            this.setParameter(name, value);
        });
    }

    nowMs() {
        return (typeof performance !== 'undefined' ? performance.now() : Date.now());
    }

    initGenerativeConductor() {
        if (!this.rnboDevice || !this.audioContext) return;
        if (this.generativeConductor) {
            this.generativeConductor.setEnabled(this.getEffectiveGenerativeEnabled());
            this.generativeConductor.setKeyLock(this.generativeKeyLocked);
            Object.entries(this.generativeMacros).forEach(([name, value]) => {
                this.generativeConductor.setMacro(name, value);
            });
            return;
        }

        this.generativeConductor = new GenerativeConductor({
            scheduleNoteAt: (note, velocity, startTimeMs, durationMs, channel = 0) => {
                this.scheduleNoteAt(note, velocity, startTimeMs, durationMs, channel);
            },
            setParameter: (name, value) => {
                this.setParameter(name, value);
            },
            getParameterValue: (name) => this.params[name],
            nowMs: () => this.nowMs(),
            triggerLowTexture: (intensity = 0.6) => {
                this.playGenerativeLowTexture(intensity);
            }
        });

        this.generativeConductor.setEnabled(this.getEffectiveGenerativeEnabled());
        this.generativeConductor.setKeyLock(this.generativeKeyLocked);
        Object.entries(this.generativeMacros).forEach(([name, value]) => {
            this.generativeConductor.setMacro(name, value);
        });
        this.generativeConductor.start();
    }

    startGenerativeLoop() {
        if (!this.generativeConductor || this.conductorTickIntervalId) return;
        this.generativeConductor.rebaseClock();
        this.conductorTickIntervalId = window.setInterval(() => {
            this.generativeConductor?.tick(this.nowMs());
        }, 80);
    }

    stopGenerativeLoop() {
        if (this.conductorTickIntervalId) {
            window.clearInterval(this.conductorTickIntervalId);
            this.conductorTickIntervalId = null;
        }
        this.generativeConductor?.stop();
        for (const timeoutId of this.pendingScheduledTimeouts) {
            window.clearTimeout(timeoutId);
        }
        this.pendingScheduledTimeouts.clear();
        this.panicGeneratedNotes();
    }

    panicGeneratedNotes() {
        for (const note of this.activeGeneratedNotes) {
            this.noteOff(note, 0, { source: 'generated' });
        }
        this.activeGeneratedNotes.clear();
    }

    scheduleNoteAt(note, velocity, startTimeMs, durationMs, channel = 0) {
        if (!this.rnboDevice || !this.audioContext) return;

        const safeNote = Math.max(0, Math.min(127, Math.round(Number(note) || 0)));
        const safeVelocity = Math.max(1, Math.min(127, Math.round(Number(velocity) || 80)));
        const safeDuration = Math.max(60, Math.round(Number(durationMs) || 220));
        const now = this.nowMs();
        const noteOnDelayMs = Math.max(0, Math.round((Number(startTimeMs) || now) - now));

        const noteOnTimeout = window.setTimeout(() => {
            this.pendingScheduledTimeouts.delete(noteOnTimeout);
            this.activeGeneratedNotes.add(safeNote);
            this.noteOn(safeNote, safeVelocity, channel, { source: 'generated' });

            const noteOffTimeout = window.setTimeout(() => {
                this.pendingScheduledTimeouts.delete(noteOffTimeout);
                this.activeGeneratedNotes.delete(safeNote);
                this.noteOff(safeNote, channel, { source: 'generated' });
            }, safeDuration);
            this.pendingScheduledTimeouts.add(noteOffTimeout);
        }, noteOnDelayMs);

        this.pendingScheduledTimeouts.add(noteOnTimeout);
    }

    getEffectiveGenerativeEnabled() {
        return this.generativeEnabled && !this.generativeSuppressed;
    }

    setGenerativeEnabled(enabled) {
        this.generativeEnabled = !!enabled;
        this.generativeConductor?.setEnabled(this.getEffectiveGenerativeEnabled());
        if (!this.getEffectiveGenerativeEnabled()) {
            this.panicGeneratedNotes();
        }
    }

    setGenerativeSuppressed(suppressed) {
        this.generativeSuppressed = !!suppressed;
        this.generativeConductor?.setEnabled(this.getEffectiveGenerativeEnabled());
        if (this.generativeSuppressed) {
            this.panicGeneratedNotes();
        }
    }

    setGenerativeMacro(name, value) {
        if (!(name in this.generativeMacros)) return;
        const clampedValue = Math.max(0, Math.min(1, Number(value) || 0));
        this.generativeMacros[name] = clampedValue;
        this.generativeConductor?.setMacro(name, clampedValue);
    }

    lockDetectedKey(lock) {
        this.generativeKeyLocked = !!lock;
        this.generativeConductor?.setKeyLock(this.generativeKeyLocked);
    }

    getGenerativeState() {
        if (!this.generativeConductor) {
            return {
                enabled: this.generativeEnabled,
                effectiveEnabled: this.getEffectiveGenerativeEnabled(),
                suppressed: this.generativeSuppressed,
                bpm: 86,
                keyRoot: 0,
                mode: 'dorian',
                density: this.generativeMacros.density,
                autonomy: this.generativeMacros.autonomy,
                response: this.generativeMacros.response,
                mood: this.generativeMacros.mood,
                tempoBias: this.generativeMacros.tempoBias,
                keyLocked: this.generativeKeyLocked,
                idleLevel: 0,
                modeState: 'idle'
            };
        }
        const state = this.generativeConductor.getState();
        return {
            ...state,
            enabled: this.generativeEnabled,
            effectiveEnabled: this.getEffectiveGenerativeEnabled(),
            suppressed: this.generativeSuppressed
        };
    }

    setupMIDI() {
        console.log('Setting up MIDI...');
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(midiAccess => {
                console.log('MIDI Access Granted');
                // Log inputs
                const inputs = Array.from(midiAccess.inputs.values());
                console.log(`Found ${inputs.length} MIDI inputs:`, inputs.map(i => i.name));

                for (let input of midiAccess.inputs.values()) {
                    input.onmidimessage = this.handleMIDIMessage.bind(this);
                }
                midiAccess.onstatechange = (e) => {
                    console.log('MIDI State Change:', e.port.name, e.port.state);
                    if (e.port.type === 'input' && e.port.state === 'connected') {
                        e.port.onmidimessage = this.handleMIDIMessage.bind(this);
                    }
                };
            }, (err) => {
                console.warn('Could not access your MIDI devices:', err);
            });
        } else {
            console.warn('Web MIDI API not supported in this browser.');
        }
    }

    handleMIDIMessage(message) {
        if (!this.rnboDevice) return;

        const [status, data1, data2] = message.data;
        const command = status & 0xf0;
        const channel = status & 0x0f;
        if (command === 0x90 && data2 > 0) {
            this.noteOn(data1, data2, channel, { source: 'external' });
            return;
        }
        if (command === 0x80 || (command === 0x90 && data2 === 0)) {
            this.noteOff(data1, channel, { source: 'external' });
            return;
        }
        this.sendMidi(status, data1, data2);
    }

    triggerTestNote() {
        if (!this.rnboDevice) return;
        const duration = 500; // ms
        this.noteOn(60, 100, 0);
        window.setTimeout(() => this.noteOff(60, 0), duration);

        console.log('Test note triggered');
    }

    registerNoteTriggerHandler(handler) {
        this.noteTriggerHandler = typeof handler === 'function' ? handler : null;
    }

    unregisterNoteTriggerHandler() {
        this.noteTriggerHandler = null;
    }

    sendMidi(status, note, velocity) {
        if (!this.rnboDevice || !this.rnboPkg || !this.audioContext) return;

        const midiStatus = Number(status) & 0xff;
        const midiNote = Math.max(0, Math.min(127, Number(note) || 0));
        const command = midiStatus & 0xf0;
        let midiVelocity = Math.max(0, Math.min(127, Number(velocity) || 0));
        if (command === 0x90 && midiVelocity > 0) {
            midiVelocity = Math.max(1, Math.min(127, Math.round(midiVelocity * this.synthVelocityScale)));
        }

        const midiEvent = new this.rnboPkg.MIDIEvent(
            this.audioContext.currentTime * 1000,
            0,
            [midiStatus, midiNote, midiVelocity]
        );
        this.rnboDevice.scheduleEvent(midiEvent);

        if (command === 0x90 && midiVelocity > 0) {
            this.noteTriggerHandler?.(midiNote, midiVelocity);
        }
    }

    noteOn(note, velocity = 100, channel = 0, meta = { source: 'external' }) {
        const status = 0x90 | (channel & 0x0f);
        this.sendMidi(status, note, velocity);
        if (meta?.source === 'external') {
            this.generativeConductor?.onExternalNoteOn(note, velocity, this.nowMs());
        }
    }

    noteOff(note, channel = 0, meta = { source: 'external' }) {
        const status = 0x80 | (channel & 0x0f);
        this.sendMidi(status, note, 0);
        if (meta?.source === 'external') {
            this.generativeConductor?.onExternalNoteOff(note, this.nowMs());
        }
    }

    emitNarrationPulse(charIndex = 0, totalChars = 1, boundaryName = 'word') {
        const progress = Math.max(0, Math.min(1, (Number(charIndex) || 0) / Math.max(1, Number(totalChars) || 1)));
        const scale = [0, 2, 3, 5, 7, 10, 12];
        const step = Math.floor(progress * (scale.length - 1));
        const baseNote = 52;
        const note = baseNote + scale[step];
        const isSentence = boundaryName === 'sentence';
        const phraseShape = Math.sin(progress * Math.PI);
        const velocityBase = 58 + progress * 24 + phraseShape * 18 + (isSentence ? 12 : 0);
        const velocityJitter = (Math.random() - 0.5) * 22;
        const accentChance = isSentence ? 0.34 : 0.16;
        const accentBoost = Math.random() < accentChance ? (8 + Math.random() * 14) : 0;
        const velocity = Math.round(velocityBase + velocityJitter + accentBoost);
        const clampedVelocity = Math.max(40, Math.min(124, velocity));

        // Narration should stay decoupled from RNBO audio and only drive visuals.
        this.noteTriggerHandler?.(note, clampedVelocity);
    }

    clearNarrationPulses() {
        // Narration no longer triggers RNBO notes.
    }

    isEditableTarget(target) {
        if (!target) return false;
        const tagName = target.tagName?.toLowerCase?.();
        if (tagName === 'textarea' || tagName === 'select') return true;
        if (tagName === 'input') {
            const inputType = (target.type || '').toLowerCase();
            // Sliders/buttons/toggles should not block musical keyboard input.
            return inputType !== 'range' && inputType !== 'button' && inputType !== 'checkbox' && inputType !== 'radio';
        }
        return target.isContentEditable === true;
    }

    panicKeyboardNotes() {
        for (const note of this.activeKeyboardNotes) {
            this.noteOff(note, 0, { source: 'external' });
        }
        this.activeKeyboardNotes.clear();
    }

    attachComputerKeyboard() {
        if (this.keyboardAttached || typeof window === 'undefined') return;

        const onKeyDown = async (event) => {
            if (event.repeat) return;
            if (this.isEditableTarget(event.target)) return;

            if (!this.isInitialized) {
                event.preventDefault();
                try {
                    await this.init();
                } catch (error) {
                    console.warn('Keyboard audio bootstrap failed:', error);
                    return;
                }
            }

            const note = this.keyMap[event.key.toLowerCase()];
            if (typeof note !== 'number') return;
            if (this.activeKeyboardNotes.has(note)) return;

            event.preventDefault();
            this.activeKeyboardNotes.add(note);
            this.noteOn(note, 100, 0, { source: 'external' });
        };

        const onKeyUp = (event) => {
            const note = this.keyMap[event.key.toLowerCase()];
            if (typeof note !== 'number') return;
            if (!this.activeKeyboardNotes.has(note)) return;

            event.preventDefault();
            this.activeKeyboardNotes.delete(note);
            this.noteOff(note, 0, { source: 'external' });
        };

        const onWindowBlur = () => {
            this.panicKeyboardNotes();
            this.panicGeneratedNotes();
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                this.panicKeyboardNotes();
                this.panicGeneratedNotes();
            } else {
                this.generativeConductor?.rebaseClock();
            }
        };

        this.keyboardHandlers = {
            onKeyDown,
            onKeyUp,
            onWindowBlur,
            onVisibilityChange
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onWindowBlur);
        document.addEventListener('visibilitychange', onVisibilityChange);
        this.keyboardAttached = true;
        if (this.generativeConductor && this.generativeEnabled) {
            this.startGenerativeLoop();
        }
    }

    detachComputerKeyboard() {
        this.stopGenerativeLoop();
        if (!this.keyboardAttached || !this.keyboardHandlers || typeof window === 'undefined') return;

        const { onKeyDown, onKeyUp, onWindowBlur, onVisibilityChange } = this.keyboardHandlers;
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', onWindowBlur);
        document.removeEventListener('visibilitychange', onVisibilityChange);

        this.panicKeyboardNotes();
        this.keyboardHandlers = null;
        this.keyboardAttached = false;
    }

    /**
     * Updates audio parameters.
     * @param {string} param - Parameter name
     * @param {number} value - Value (mapped from UI)
     */
    setParameter(param, value) {
        this.params[param] = value;
        if (!this.rnboDevice) return;

        // Debug: Log available parameters once
        if (!this._hasLoggedParams) {
            console.log('Available RNBO parameters:', this.rnboDevice.parameters.map(p => ({ name: p.name, id: p.id })));
            this._hasLoggedParams = true;
        }

        // Find parameter by name or id
        const rnboParam = this.rnboDevice.parameters.find(p => p.name === param || p.id === param);

        if (rnboParam) {
            // console.log(`Setting RNBO param ${param} to ${value}`);
            rnboParam.value = value;
        } else {
            console.warn(`RNBO parameter '${param}' not found. Trying partial match...`);
            // Try partial match for things like "feedback" matching "feedback[1]"
            const partialParam = this.rnboDevice.parameters.find(p => p.name.includes(param) || p.id.includes(param));
            if (partialParam) {
                console.log(`Found partial match for '${param}': ${partialParam.name} (${partialParam.id})`);
                partialParam.value = value;
            } else {
                console.warn(`RNBO parameter '${param}' strictly not found`);
            }
        }
    }


    playWelcomeSound() {
        if (!this.isInitialized) return;

        const currentTime = this.audioContext.currentTime;
        const welcome = this.audioContext.createOscillator();
        welcome.type = 'sine';
        welcome.frequency.setValueAtTime(880, currentTime); // A5

        const welcomeGain = this.audioContext.createGain();
        welcomeGain.gain.setValueAtTime(0.3, currentTime);
        welcomeGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.0);

        welcome.connect(welcomeGain);
        welcomeGain.connect(this.masterGain);
        welcome.start();
        welcome.stop(currentTime + 1.0);
    }

    playDragSound(options = {}) {
        if (!this.isInitialized) return;

        const now = performance.now();
        const throttleMs = Math.max(50, Number(options.throttleMs) || 80);
        const throttleKey = options.throttleKey || 'drag';
        const lastCall = this.lastCallTimes[throttleKey] || 0;
        if (now - lastCall < throttleMs) return; // Throttle
        this.lastCallTimes[throttleKey] = now;

        const currentTime = this.audioContext.currentTime;

        // Experimental granular drag sound
        const grain1 = this.audioContext.createOscillator();
        const grain2 = this.audioContext.createOscillator();
        const noise = this.audioContext.createOscillator();

        grain1.type = 'sine';
        grain2.type = 'triangle';
        noise.type = 'sawtooth';

        const baseMin = Number(options.baseMin) || 70;
        const baseMax = Number(options.baseMax) || 100;
        const baseFreq = baseMin + Math.random() * Math.max(1, baseMax - baseMin);
        grain1.frequency.setValueAtTime(baseFreq, currentTime);
        grain2.frequency.setValueAtTime(baseFreq * 1.618, currentTime); // Golden ratio
        noise.frequency.setValueAtTime(baseFreq * 0.5, currentTime);

        // Frequency modulation during drag
        grain1.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, currentTime + 0.4);
        grain2.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, currentTime + 0.4);

        // Experimental filter cascade
        const filter1 = this.audioContext.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.setValueAtTime(180, currentTime);
        filter1.frequency.exponentialRampToValueAtTime(350, currentTime + 0.4);
        filter1.Q.setValueAtTime(6, currentTime);

        const filter2 = this.audioContext.createBiquadFilter();
        filter2.type = 'highpass';
        filter2.frequency.setValueAtTime(100, currentTime);
        filter2.Q.setValueAtTime(1.5, currentTime);

        const dragGain = this.audioContext.createGain();
        const gainStart = Math.max(0.02, Number(options.gainStart) || 0.16);
        const gainEnd = Math.max(0.0005, Number(options.gainEnd) || 0.006);
        const duration = Math.max(0.25, Number(options.duration) || 0.5);
        dragGain.gain.setValueAtTime(gainStart, currentTime);
        dragGain.gain.exponentialRampToValueAtTime(gainEnd, currentTime + duration);

        // Complex signal routing
        grain1.connect(filter1);
        grain2.connect(filter1);
        noise.connect(filter2);
        filter1.connect(filter2);
        filter2.connect(dragGain);
        dragGain.connect(this.masterGain);

        grain1.start();
        grain2.start();
        noise.start();
        grain1.stop(currentTime + duration);
        grain2.stop(currentTime + duration);
        noise.stop(currentTime + duration);
    }

    playGenerativeLowTexture(intensity = 0.6) {
        if (!this.isInitialized) return;
        // Use the exact same drag synthesis path/timbre as manual 3D sphere dragging.
        this.playDragSound({ throttleKey: 'generativeLow' });
    }

    playClickSound() {
        if (!this.isInitialized) return;

        const currentTime = this.audioContext.currentTime;

        // Advanced FM synthesis for bubble clicks
        const carrier = this.audioContext.createOscillator();
        const modulator1 = this.audioContext.createOscillator();
        const modulator2 = this.audioContext.createOscillator();

        carrier.type = 'sine';
        modulator1.type = 'sine';
        modulator2.type = 'triangle';

        const carrierFreq = 400 + Math.random() * 300;
        const modFreq1 = carrierFreq * 2.718; // e ratio
        const modFreq2 = carrierFreq * 0.707; // sqrt(2)/2

        carrier.frequency.setValueAtTime(carrierFreq, currentTime);
        modulator1.frequency.setValueAtTime(modFreq1, currentTime);
        modulator2.frequency.setValueAtTime(modFreq2, currentTime);

        // FM synthesis connections
        const modGain1 = this.audioContext.createGain();
        modGain1.gain.setValueAtTime(80, currentTime);
        modGain1.gain.exponentialRampToValueAtTime(10, currentTime + 0.2);

        const modGain2 = this.audioContext.createGain();
        modGain2.gain.setValueAtTime(30, currentTime);
        modGain2.gain.linearRampToValueAtTime(5, currentTime + 0.4);

        modulator1.connect(modGain1);
        modulator2.connect(modGain2);
        modGain1.connect(carrier.frequency);
        modGain2.connect(carrier.frequency);

        // Multi-stage filtering
        const filter1 = this.audioContext.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.setValueAtTime(carrierFreq, currentTime);
        filter1.Q.setValueAtTime(8, currentTime);

        const filter2 = this.audioContext.createBiquadFilter();
        filter2.type = 'highpass';
        filter2.frequency.setValueAtTime(200, currentTime);
        filter2.Q.setValueAtTime(2, currentTime);

        const clickGain = this.audioContext.createGain();
        clickGain.gain.setValueAtTime(0.09, currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 2.5);

        // Routing through effects
        carrier.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(clickGain);
        clickGain.connect(this.masterGain);

        carrier.start();
        modulator1.start();
        modulator2.start();
        carrier.stop(currentTime + 2.5);
        modulator1.stop(currentTime + 2.5);
        modulator2.stop(currentTime + 2.5);
    }

    playHoverSound() {
        if (!this.isInitialized) return;

        const now = performance.now();
        if (now - this.lastCallTimes.hover < 150) return; // Throttle hover sounds
        this.lastCallTimes.hover = now;

        const currentTime = this.audioContext.currentTime;

        // Ethereal hover sounds with pitch bending
        const hover = this.audioContext.createOscillator();
        hover.type = 'sine';

        const freq = 1000 + Math.random() * 1000;
        hover.frequency.setValueAtTime(freq, currentTime);
        hover.frequency.exponentialRampToValueAtTime(freq * 1.5, currentTime + 0.15);
        hover.frequency.exponentialRampToValueAtTime(freq * 0.8, currentTime + 0.8);

        // Tremolo effect
        const tremolo = this.audioContext.createOscillator();
        tremolo.type = 'sine';
        tremolo.frequency.setValueAtTime(7, currentTime);

        const tremoloGain = this.audioContext.createGain();
        tremoloGain.gain.setValueAtTime(0.4, currentTime);

        const hoverGain = this.audioContext.createGain();
        hoverGain.gain.setValueAtTime(0.012, currentTime);
        hoverGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.8);

        tremolo.connect(tremoloGain);
        tremoloGain.connect(hoverGain.gain);

        hover.connect(hoverGain);
        hoverGain.connect(this.masterGain);

        hover.start();
        tremolo.start();
        hover.stop(currentTime + 1.8);
        tremolo.stop(currentTime + 1.8);
    }

    playAmbientNoise(intensity = 0.35) {
        if (!this.isInitialized) return;

        const now = performance.now();
        if (now - this.lastCallTimes.ambient < 1400) return;
        this.lastCallTimes.ambient = now;

        const currentTime = this.audioContext.currentTime;
        const tonal = this.audioContext.createOscillator();
        const texture = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        const stereo = this.audioContext.createStereoPanner();

        tonal.type = 'triangle';
        texture.type = 'sawtooth';
        tonal.frequency.setValueAtTime(95 + Math.random() * 130, currentTime);
        texture.frequency.setValueAtTime(30 + Math.random() * 42, currentTime);
        tonal.detune.setValueAtTime(-8 + Math.random() * 16, currentTime);
        texture.detune.setValueAtTime(-12 + Math.random() * 24, currentTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(180 + Math.random() * 560, currentTime);
        filter.Q.setValueAtTime(1.8 + Math.random() * 2.4, currentTime);
        stereo.pan.setValueAtTime(-0.35 + Math.random() * 0.7, currentTime);

        const target = Math.max(0.016, Math.min(0.11, 0.024 + intensity * 0.065));
        gain.gain.setValueAtTime(0.0001, currentTime);
        gain.gain.exponentialRampToValueAtTime(target, currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, currentTime + 1.8 + Math.random() * 1.4);

        tonal.connect(filter);
        texture.connect(filter);
        filter.connect(gain);
        gain.connect(stereo);

        // Always route ambient texture through masterGain so RNBO stays in the signal path.
        stereo.connect(this.masterGain);

        tonal.start();
        texture.start();
        tonal.stop(currentTime + 3.4);
        texture.stop(currentTime + 3.4);
    }

    playMorphSound(morphFactor) {
        if (!this.isInitialized) return;

        const currentTime = this.audioContext.currentTime;

        // Spectral morphing sound
        const morph1 = this.audioContext.createOscillator();
        const morph2 = this.audioContext.createOscillator();
        const morph3 = this.audioContext.createOscillator();

        morph1.type = 'sine';
        morph2.type = 'triangle';
        morph3.type = 'sawtooth';

        const baseFreq = 250;
        morph1.frequency.setValueAtTime(baseFreq / morphFactor, currentTime);
        morph2.frequency.setValueAtTime(baseFreq * 1.43 * morphFactor, currentTime); // Minor third
        morph3.frequency.setValueAtTime(baseFreq * 1.52 * morphFactor, currentTime); // Perfect fifth

        // Spectral filter that changes with morph
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200 + morphFactor * 800, currentTime);
        filter.Q.setValueAtTime(4 + morphFactor * 8, currentTime);

        const morphGain = this.audioContext.createGain();
        const envelope = Math.sin(morphFactor * Math.PI) * 0.42;
        morphGain.gain.setValueAtTime(envelope, currentTime);
        morphGain.gain.linearRampToValueAtTime(1.83, currentTime + 1.5);

        morph1.connect(filter);
        morph2.connect(filter);
        morph3.connect(filter);
        filter.connect(morphGain);
        morphGain.connect(this.masterGain);

        morph1.start();
        morph2.start();
        morph3.start();
        morph1.stop(currentTime + 0.5);
        morph2.stop(currentTime + 0.5);
        morph3.stop(currentTime + 0.5);
    }
}


// Export singleton instance
export const audioSystem = new AudioSystem();
