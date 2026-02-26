const MODE_INTERVALS = {
    dorian: [0, 2, 3, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    ionian: [0, 2, 4, 5, 7, 9, 11]
};

const MODE_NAMES = Object.keys(MODE_INTERVALS);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, alpha) => start + (end - start) * alpha;

const defaultNoop = () => {};

export const quantizeUp = (valueMs, gridMs) => {
    if (!Number.isFinite(valueMs) || !Number.isFinite(gridMs) || gridMs <= 0) return valueMs;
    return Math.ceil(valueMs / gridMs) * gridMs;
};

export const detectKeyAndMode = (noteEvents, fallback = { root: 0, mode: 'dorian', confidence: 0 }) => {
    if (!Array.isArray(noteEvents) || noteEvents.length === 0) return fallback;

    let best = { ...fallback };
    for (let root = 0; root < 12; root += 1) {
        for (const mode of MODE_NAMES) {
            const scale = MODE_INTERVALS[mode];
            let score = 0;
            let tonicHits = 0;
            for (const evt of noteEvents) {
                const pitchClass = ((evt.note % 12) + 12) % 12;
                const rel = (pitchClass - root + 12) % 12;
                const inScale = scale.includes(rel);
                const weight = clamp((evt.velocity || 64) / 127, 0.2, 1);
                score += inScale ? 1.2 * weight : -0.9 * weight;
                if (pitchClass === root) tonicHits += weight;
            }
            // Encourage candidates where the tonic appears in the played material.
            score += tonicHits * 0.65;
            const confidence = clamp((score / (noteEvents.length * 1.2) + 1) * 0.5, 0, 1);
            if (!best || confidence > best.confidence) {
                best = { root, mode, confidence };
            }
        }
    }

    return best;
};

class GenerativeConductor {
    constructor(options = {}) {
        this.scheduleNoteAt = options.scheduleNoteAt || defaultNoop;
        this.setParameter = options.setParameter || defaultNoop;
        this.getParameterValue = options.getParameterValue || (() => 0);
        this.nowMs = options.nowMs || (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
        this.triggerLowTexture = options.triggerLowTexture || defaultNoop;

        this.enabled = true;
        this.baseBpm = 86;
        this.macros = {
            autonomy: 0.56,
            density: 0.34,
            response: 0.62,
            mood: 0.58,
            tempoBias: 0.5
        };

        this.state = {
            keyRoot: 0,
            mode: 'dorian',
            confidence: 0,
            keyLocked: false,
            idleLevel: 0,
            modeState: 'idle'
        };

        this.externalNotes = [];
        this.detectWindowMs = 8000;
        this.detectMaxNotes = 20;
        this.detectThreshold = 0.58;

        this.recentNotes = [];
        this.activeExternalNotes = new Set();
        this.lastExternalInputMs = this.nowMs();

        this.phrase = null;
        this.pendingResponse = null;
        this.responseCooldownUntilMs = 0;
        this.velocitySmoothed = 0.6;
        this.lastExternalNoteOnMs = null;
        this.tempoEstimateBpm = null;

        this.nextAmbientAtMs = this.nowMs() + 700;
        this.lastParamUpdateMs = 0;
        this.paramUpdateIntervalMs = 84;
        this.lastTickMs = 0;

        this.paramTargets = {
            window: this.getParameterValue('window') || 100,
            chorus: this.getParameterValue('chorus') || 20,
            delay: this.getParameterValue('delay') || 200,
            feedback: this.getParameterValue('feedback') || 30,
            mix: this.getParameterValue('mix') || 50,
            revvol: this.getParameterValue('revvol') || 40,
            octdamp: this.getParameterValue('octdamp') || 20,
            octvol: this.getParameterValue('octvol') || 60
        };
    }

    start() {
        this.lastTickMs = this.nowMs();
    }

    stop() {
        this.pendingResponse = null;
        this.phrase = null;
    }

    rebaseClock() {
        const now = this.nowMs();
        this.lastTickMs = now;
        this.nextAmbientAtMs = Math.max(this.nextAmbientAtMs, now + 120);
    }

    setEnabled(enabled) {
        this.enabled = !!enabled;
    }

    setMacro(name, value) {
        if (!(name in this.macros)) return;
        this.macros[name] = clamp(Number(value) || 0, 0, 1);
    }

    setKeyLock(locked) {
        this.state.keyLocked = !!locked;
    }

    getBpm() {
        const bias = (this.macros.tempoBias - 0.5) * 36;
        const baseWithBias = clamp(this.baseBpm + bias, 50, 170);
        if (!Number.isFinite(this.tempoEstimateBpm)) return baseWithBias;

        const now = this.nowMs();
        const idleMs = Math.max(0, now - this.lastExternalInputMs);
        const followAmount = clamp(1 - idleMs / 6000, 0, 1) * 0.68;
        return clamp(lerp(baseWithBias, this.tempoEstimateBpm, followAmount), 50, 170);
    }

    getState() {
        return {
            enabled: this.enabled,
            bpm: Math.round(this.getBpm()),
            keyRoot: this.state.keyRoot,
            mode: this.state.mode,
            density: this.macros.density,
            autonomy: this.macros.autonomy,
            response: this.macros.response,
            mood: this.macros.mood,
            tempoBias: this.macros.tempoBias,
            keyLocked: this.state.keyLocked,
            idleLevel: this.state.idleLevel,
            modeState: this.state.modeState
        };
    }

    onExternalNoteOn(note, velocity = 100, timestampMs = this.nowMs()) {
        if (!Number.isFinite(note)) return;

        const clampedNote = clamp(Math.round(note), 0, 127);
        const clampedVelocity = clamp(Math.round(velocity), 1, 127);

        this.lastExternalInputMs = timestampMs;
        this.state.modeState = 'listening';
        this.velocitySmoothed = lerp(this.velocitySmoothed, clampedVelocity / 127, 0.25);
        this.activeExternalNotes.add(clampedNote);
        this.updateTempoEstimate(timestampMs);

        this.externalNotes.push({ note: clampedNote, velocity: clampedVelocity, time: timestampMs });
        while (this.externalNotes.length > this.detectMaxNotes) {
            this.externalNotes.shift();
        }
        this.externalNotes = this.externalNotes.filter((evt) => timestampMs - evt.time <= this.detectWindowMs);

        this.recentNotes.push({ note: clampedNote, velocity: clampedVelocity, time: timestampMs });
        this.recentNotes = this.recentNotes.filter((evt) => timestampMs - evt.time <= 3000);

        if (!this.phrase) {
            this.phrase = {
                startMs: timestampMs,
                lastMs: timestampMs,
                notes: [{ note: clampedNote, velocity: clampedVelocity, time: timestampMs }]
            };
        } else {
            this.phrase.lastMs = timestampMs;
            this.phrase.notes.push({ note: clampedNote, velocity: clampedVelocity, time: timestampMs });
        }

        this.maybeUpdateDetectedKey();
    }

    onExternalNoteOff(note) {
        if (!Number.isFinite(note)) return;
        this.activeExternalNotes.delete(clamp(Math.round(note), 0, 127));
    }

    maybeUpdateDetectedKey() {
        if (this.state.keyLocked || this.externalNotes.length === 0) return;

        const detected = detectKeyAndMode(this.externalNotes, {
            root: this.state.keyRoot,
            mode: this.state.mode,
            confidence: this.state.confidence
        });

        const noteCount = this.externalNotes.length;
        if (noteCount < 2) return;

        const minConfidence = noteCount < 5 ? 0.18 : 0.32;
        const confidenceDelta = detected.confidence - this.state.confidence;
        const shouldAdopt = detected.confidence >= minConfidence && confidenceDelta >= -0.08;

        if (shouldAdopt) {
            this.state.keyRoot = detected.root;
            this.state.mode = detected.mode;
            this.state.confidence = detected.confidence;
        }
    }

    updateTempoEstimate(timestampMs) {
        const prev = this.lastExternalNoteOnMs;
        this.lastExternalNoteOnMs = timestampMs;
        if (!Number.isFinite(prev)) return;

        const deltaMs = timestampMs - prev;
        if (!Number.isFinite(deltaMs) || deltaMs < 90 || deltaMs > 1400) return;

        let bpm = 60000 / deltaMs;
        while (bpm < 50) bpm *= 2;
        while (bpm > 170) bpm /= 2;
        bpm = clamp(bpm, 50, 170);

        if (!Number.isFinite(this.tempoEstimateBpm)) {
            this.tempoEstimateBpm = bpm;
        } else {
            this.tempoEstimateBpm = lerp(this.tempoEstimateBpm, bpm, 0.24);
        }
    }

    tick(timestampMs = this.nowMs()) {
        if (!this.enabled) {
            this.state.modeState = 'idle';
            return;
        }

        const now = Number(timestampMs) || this.nowMs();
        this.processPhrase(now);
        this.emitPendingResponse(now);
        this.emitAmbient(now);

        if (now - this.lastParamUpdateMs >= this.paramUpdateIntervalMs) {
            this.updateParameterMotion(now);
            this.lastParamUpdateMs = now;
        }

        const idleGapMs = now - this.lastExternalInputMs;
        const decay = clamp((idleGapMs - 7000) / 12000, 0, 1);
        this.state.idleLevel = decay;
        if (decay > 0.8 && !this.pendingResponse) {
            this.state.modeState = 'idle';
        }

        this.lastTickMs = now;
    }

    processPhrase(now) {
        if (!this.phrase) return;

        const gapMs = now - this.phrase.lastMs;
        const phraseDurationMs = this.phrase.lastMs - this.phrase.startMs;

        const phraseEnded = gapMs >= 360;
        if (!phraseEnded) return;

        if (phraseDurationMs < 400 || phraseDurationMs > 2400 || this.phrase.notes.length < 2) {
            this.phrase = null;
            return;
        }

        if (now < this.responseCooldownUntilMs || this.pendingResponse) {
            this.phrase = null;
            return;
        }

        this.pendingResponse = this.buildResponseFromPhrase(this.phrase, now);
        this.responseCooldownUntilMs = now + 640;
        this.phrase = null;
    }

    buildResponseFromPhrase(phrase, now) {
        const bpm = this.getBpm();
        const beatMs = 60000 / bpm;
        const eighthMs = beatMs / 2;
        const quarterMs = beatMs;
        const phraseDurationMs = phrase.lastMs - phrase.startMs;
        const quantGridMs = phraseDurationMs > 1200 ? quarterMs : eighthMs;

        const preRollMs = 120 + Math.random() * 300;
        let startMs = quantizeUp(now + preRollMs, quantGridMs);

        const noteCount = clamp(Math.round(phrase.notes.length * (0.5 + this.macros.response * 0.9)), 3, 8);
        const source = phrase.notes.slice(-noteCount);

        const srcCenter = source.reduce((sum, evt) => sum + evt.note, 0) / source.length;
        const targetCenter = clamp(srcCenter + (Math.random() * 10 - 5), 42, 84);
        const transpose = Math.round(targetCenter - srcCenter);
        const invert = Math.random() < 0.33;

        const firstNote = source[0].note;
        const candidates = [];
        for (let i = 0; i < source.length; i += 1) {
            const evt = source[i];
            const rel = evt.note - firstNote;
            const interval = invert ? -rel : rel;
            let generated = firstNote + transpose + interval;
            generated = this.snapToMode(generated);
            generated = clamp(generated, 42, 84);
            candidates.push({
                note: generated,
                velocity: this.generateVelocity(i, source.length),
                index: i
            });
        }

        const thinningChance = clamp(0.48 - this.macros.response * 0.24, 0.12, 0.54);
        const kept = candidates.filter((evt, idx) => idx === 0 || Math.random() > thinningChance);
        if (kept.length < 2) kept.push(candidates[candidates.length - 1]);

        const sixteenthMs = beatMs / 4;
        const maxLengthMs = beatMs * 4;
        const events = [];

        for (let i = 0; i < kept.length; i += 1) {
            const step = i * 2;
            const eventStart = startMs + step * sixteenthMs + this.getSwingOffset(step);
            if (eventStart - startMs > maxLengthMs) break;
            const durationMs = clamp((0.35 + Math.random() * 0.45) * beatMs, 120, 560);
            events.push({
                note: kept[i].note,
                velocity: kept[i].velocity,
                startMs: eventStart,
                durationMs
            });
        }

        return {
            startMs,
            events
        };
    }

    emitPendingResponse(now) {
        if (!this.pendingResponse) return;
        if (now < this.pendingResponse.startMs - 10) return;

        for (const evt of this.pendingResponse.events) {
            this.scheduleNoteAt(evt.note, evt.velocity, evt.startMs, evt.durationMs, 0);
        }

        this.state.modeState = 'answering';
        this.pendingResponse = null;
    }

    emitAmbient(now) {
        if (now < this.nextAmbientAtMs) return;

        const idleGapMs = now - this.lastExternalInputMs;
        const decay = clamp((idleGapMs - 7000) / 12000, 0, 1);
        const effectiveDensity = clamp(lerp(this.macros.density, 0.18, decay), 0.12, 1);
        const autonomy = this.macros.autonomy;
        const bpm = this.getBpm();
        const beatMs = 60000 / bpm;

        const eventChance = clamp(0.22 + effectiveDensity * 0.32 + autonomy * 0.16, 0.18, 0.72);
        if (Math.random() < eventChance) {
            // Autonomous layer: exact drag timbre only (no autonomous synth-note ambient).
            this.triggerLowTexture(clamp(0.35 + effectiveDensity * 0.5 + this.macros.mood * 0.25, 0.3, 1));
        }

        const minIntervalMs = 1300;
        const maxIntervalMs = 4200;
        const densityPull = lerp(maxIntervalMs, minIntervalMs, effectiveDensity * 0.74 + autonomy * 0.26);
        const jitter = (Math.random() - 0.5) * 360;
        this.nextAmbientAtMs = now + clamp(densityPull + jitter, minIntervalMs, maxIntervalMs);
    }

    updateParameterMotion(now) {
        const movement = 0.015 + this.macros.autonomy * 0.02;
        const mood = this.macros.mood;

        const ranges = {
            window: { min: 1, max: 1000, depth: 70 },
            chorus: { min: 0, max: 100, depth: 14 },
            delay: { min: 0, max: 2000, depth: 180 },
            feedback: { min: 0, max: 95, depth: 12 },
            mix: { min: 0, max: 100, depth: 10 },
            revvol: { min: 0, max: 100, depth: 12 },
            octdamp: { min: 0, max: 100, depth: 10 },
            octvol: { min: 0, max: 100, depth: 12 }
        };

        for (const [name, cfg] of Object.entries(ranges)) {
            const base = Number(this.getParameterValue(name));
            const baseSafe = Number.isFinite(base) ? base : this.paramTargets[name] || 0;

            const drift = (Math.random() * 2 - 1) * cfg.depth * (0.35 + mood * 0.65);
            const target = clamp(baseSafe + drift, cfg.min, cfg.max);
            const current = this.paramTargets[name] ?? baseSafe;
            const next = clamp(lerp(current, target, movement), cfg.min, cfg.max);

            this.paramTargets[name] = next;
            this.setParameter(name, next);
        }
    }

    snapToMode(note) {
        const root = this.state.keyRoot;
        const modeIntervals = MODE_INTERVALS[this.state.mode] || MODE_INTERVALS.dorian;
        const octave = Math.floor(note / 12);
        const pitchClass = ((note % 12) + 12) % 12;

        let bestPc = modeIntervals[0] + root;
        let bestDistance = Number.POSITIVE_INFINITY;

        for (const interval of modeIntervals) {
            const candidatePc = (root + interval) % 12;
            let distance = Math.abs(candidatePc - pitchClass);
            distance = Math.min(distance, 12 - distance);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestPc = candidatePc;
            }
        }

        let candidate = octave * 12 + bestPc;
        if (candidate - note > 6) candidate -= 12;
        if (note - candidate > 6) candidate += 12;
        return candidate;
    }

    generateVelocity(index, total) {
        const phrasePos = total <= 1 ? 1 : index / (total - 1);
        const accent = index === 0 || index === total - 1 ? 10 : 0;
        const base = 42 + this.velocitySmoothed * 46 + this.macros.response * 14;
        const shape = Math.sin(phrasePos * Math.PI) * 8;
        return clamp(Math.round(base + shape + accent + (Math.random() - 0.5) * 10), 42, 108);
    }

    getSwingOffset(step16th) {
        if (step16th % 2 === 0) return 0;
        const base = 18;
        const scaled = base * (0.6 + this.macros.density * 0.25 + this.macros.mood * 0.15);
        return scaled;
    }
}

export { GenerativeConductor, MODE_INTERVALS };
