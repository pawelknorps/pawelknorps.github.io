// AudioSystem.js - Separate audio module for easier debugging

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.reverb = null;
        this.delay = null;
        this.isInitialized = false;
        this.volume = 0.4;           // Główna głośność (było 0.12)
        this.reverbWet = 0.9;        // Pogłos bardziej intensywny
        this.delayWet = 0.4;         // Opóźnienie bardziej słyszalne
        this.delayFeedbackGain = 0.38; // Silniejszy feedback echa

    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            console.log('Audio context initialized:', this.audioContext.state);
            
            // Master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            this.masterGain.connect(this.audioContext.destination);
            
            // Create experimental reverb
            await this.createReverb();
            await this.createDelay();
            
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
            
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    async createReverb() {
        const reverbTime = 3.2;
        const reverbLength = this.audioContext.sampleRate * reverbTime;
        this.reverb = this.audioContext.createConvolver();
        const impulseBuffer = this.audioContext.createBuffer(2, reverbLength, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulseBuffer.getChannelData(channel);
            for (let i = 0; i < reverbLength; i++) {
                const decay = Math.pow(1 - i / reverbLength, 0.95); // wolniejsze wygaszanie
                const earlyReflection = i < reverbLength * 0.08 ? Math.random() * 0.9 : 0;
                channelData[i] = ((Math.random() * 2 - 1) * decay * 0.6) + earlyReflection;

            }
        }
        this.reverb.buffer = impulseBuffer;
        this.reverb.connect(this.masterGain);
    }

    async createDelay() {
        this.delay = this.audioContext.createDelay(1.5);
        this.delay.delayTime.setValueAtTime(0.33, this.audioContext.currentTime);

        const delay2 = this.audioContext.createDelay(1.5);
        delay2.delayTime.setValueAtTime(0.52, this.audioContext.currentTime);

        const delayFeedback = this.audioContext.createGain();
        delayFeedback.gain.setValueAtTime(this.delayFeedbackGain, this.audioContext.currentTime); // zwiększony

        const delayWet = this.audioContext.createGain();
        delayWet.gain.setValueAtTime(this.delayWet, this.audioContext.currentTime); // zwiększony

        this.delay.connect(delayFeedback);
        delayFeedback.connect(delay2);
        delay2.connect(this.delay);
        this.delay.connect(delayWet);
        delay2.connect(delayWet);
        delayWet.connect(this.reverb); // większy wpływ delayu na pogłos
    }


    playWelcomeSound() {
        if (!this.isInitialized) return;
        
        const currentTime = this.audioContext.currentTime;
        const welcome = this.audioContext.createOscillator();
        welcome.type = 'sine';
        welcome.frequency.setValueAtTime(880, currentTime); // A5
        
        const welcomeGain = this.audioContext.createGain();
        welcomeGain.gain.setValueAtTime(0.5, currentTime);
        welcomeGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.0);
        
        welcome.connect(welcomeGain);
        welcomeGain.connect(this.reverb);
        welcome.start();
        welcome.stop(currentTime + 1.0);
    }

    playDragSound() {
        if (!this.isInitialized) return;
        
        const currentTime = this.audioContext.currentTime;
        
        // Experimental granular drag sound
        const grain1 = this.audioContext.createOscillator();
        const grain2 = this.audioContext.createOscillator();
        const noise = this.audioContext.createOscillator();
        
        grain1.type = 'sine';
        grain2.type = 'triangle';
        noise.type = 'sawtooth';
        
        const baseFreq = 70 + Math.random() * 30;
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
        dragGain.gain.setValueAtTime(0.25, currentTime);
        dragGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
        
        // Complex signal routing
        grain1.connect(filter1);
        grain2.connect(filter1);
        noise.connect(filter2);
        filter1.connect(filter2);
        filter2.connect(dragGain);
        dragGain.connect(this.delay);
        dragGain.connect(this.reverb);
        
        grain1.start();
        grain2.start();
        noise.start();
        grain1.stop(currentTime + 0.5);
        grain2.stop(currentTime + 0.5);
        noise.stop(currentTime + 0.5);
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
        clickGain.gain.setValueAtTime(0.135, currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 2.5);
        
        // Routing through effects
        carrier.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(clickGain);
        clickGain.connect(this.delay);
        clickGain.connect(this.reverb);
        
        carrier.start();
        modulator1.start();
        modulator2.start();
        carrier.stop(currentTime + 2.5);
        modulator1.stop(currentTime + 2.5);
        modulator2.stop(currentTime + 2.5);
    }

    playHoverSound() {
        if (!this.isInitialized) return;
        
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
        hoverGain.connect(this.reverb);
        
        hover.start();
        tremolo.start();
        hover.stop(currentTime + 1.8);
        tremolo.stop(currentTime + 1.8);
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
        morph1.frequency.setValueAtTime(baseFreq/morphFactor, currentTime);
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
        morphGain.connect(this.delay);
        morphGain.connect(this.reverb);
        
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