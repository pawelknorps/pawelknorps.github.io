<script>
    import { audioSystem } from "$lib/AudioSystem.js";
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    
    export let webcamEnabled = false;
    export let webcamLoading = false;
    export let webcamError = "";

    const dispatch = createEventDispatcher();

    const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    let visible = false;
    let isExpanded = false;

    // Existing RNBO params
    let windowMs = 100;
    let chorus = 20;
    let delayMs = 200;
    let feedback = 30;
    let mix = 50;
    let pitchvol = 70;
    let revvol = 50;
    let octdamp = 20;
    let octvol = 60;

    // Generative controls
    let generativeEnabled = true;
    let keyLocked = false;
    let autonomy = 56;
    let density = 34;
    let response = 62;
    let mood = 58;
    let tempoBias = 50;
    let detectedLabel = "C dorian";
    let bpmLabel = 86;
    let modeState = "idle";

    let stateInterval;

    const rnboSliders = [
        { id: "window", label: "Window", value: () => windowMs, min: 25, max: 250 },
        { id: "chorus", label: "Chorus", value: () => chorus, min: 0, max: 100 },
        { id: "delay", label: "Delay", value: () => delayMs, min: 0, max: 1000 },
        { id: "feedback", label: "Feedback", value: () => feedback, min: 0, max: 100 },
        { id: "mix", label: "Mix", value: () => mix, min: 0, max: 100 },
        { id: "pitchvol", label: "Pitch Vol", value: () => pitchvol, min: 0, max: 100 },
        { id: "revvol", label: "Reverb Vol", value: () => revvol, min: 0, max: 100 },
        { id: "octdamp", label: "Oct Damp", value: () => octdamp, min: 0, max: 100 },
        { id: "octvol", label: "Oct Vol", value: () => octvol, min: 0, max: 100 }
    ];

    onMount(() => {
        const profile = audioSystem.getUserSoundProfile?.() || {};
        windowMs = Number(profile.window ?? windowMs);
        chorus = Number(profile.chorus ?? chorus);
        delayMs = Number(profile.delay ?? delayMs);
        feedback = Number(profile.feedback ?? feedback);
        mix = Number(profile.mix ?? mix);
        pitchvol = Number(profile.pitchvol ?? pitchvol);
        revvol = Number(profile.revvol ?? revvol);
        octdamp = Number(profile.octdamp ?? octdamp);
        octvol = Number(profile.octvol ?? octvol);

        refreshGenerativeState();
        setTimeout(() => (visible = true), 1000);

        stateInterval = setInterval(refreshGenerativeState, 220);

        return () => {
            if (stateInterval) {
                clearInterval(stateInterval);
                stateInterval = null;
            }
        };
    });

    function refreshGenerativeState() {
        const state = audioSystem.getGenerativeState?.();
        if (!state) return;

        generativeEnabled = !!state.enabled;
        keyLocked = !!state.keyLocked;
        autonomy = Math.round((state.autonomy ?? 0.56) * 100);
        density = Math.round((state.density ?? 0.34) * 100);
        response = Math.round((state.response ?? 0.62) * 100);
        mood = Math.round((state.mood ?? 0.58) * 100);
        tempoBias = Math.round((state.tempoBias ?? 0.5) * 100);

        const root = Number.isFinite(state.keyRoot) ? ((state.keyRoot % 12) + 12) % 12 : 0;
        const mode = state.mode || "dorian";
        detectedLabel = `${NOTE_NAMES[root]} ${mode}`;
        bpmLabel = state.bpm || 86;
        modeState = state.modeState || "idle";
    }

    function updateParam(name, value) {
        audioSystem.setParameter(name, value);
    }

    function updateMacro(name, uiValue) {
        const normalized = Math.max(0, Math.min(1, Number(uiValue) / 100));
        audioSystem.setGenerativeMacro?.(name, normalized);
    }

    async function handlePlayClick() {
        if (!audioSystem.isInitialized) {
            await audioSystem.init();
        }
        audioSystem.triggerTestNote();
    }

    async function toggleGenerative() {
        if (!audioSystem.isInitialized) {
            await audioSystem.init();
        }
        audioSystem.setGenerativeEnabled?.(!generativeEnabled);
        refreshGenerativeState();
    }

    function toggleKeyLock() {
        audioSystem.lockDetectedKey?.(!keyLocked);
        refreshGenerativeState();
    }

    function updateRnboSlider(param, value) {
        const numeric = Number(value);
        if (param === "window") windowMs = numeric;
        if (param === "chorus") chorus = numeric;
        if (param === "delay") delayMs = numeric;
        if (param === "feedback") feedback = numeric;
        if (param === "mix") mix = numeric;
        if (param === "pitchvol") pitchvol = numeric;
        if (param === "revvol") revvol = numeric;
        if (param === "octdamp") octdamp = numeric;
        if (param === "octvol") octvol = numeric;
        updateParam(param, numeric);
    }

    function sliderValue(id) {
        if (id === "window") return windowMs;
        if (id === "chorus") return chorus;
        if (id === "delay") return delayMs;
        if (id === "feedback") return feedback;
        if (id === "mix") return mix;
        if (id === "pitchvol") return pitchvol;
        if (id === "revvol") return revvol;
        if (id === "octdamp") return octdamp;
        if (id === "octvol") return octvol;
        return 0;
    }
</script>

{#if visible}
    <div
        class="audio-controls fixed bottom-3 left-1/2 transform -translate-x-1/2 md:right-8 md:top-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:-translate-y-1/2 z-[9999] flex flex-col items-end gap-2 pointer-events-auto select-none w-[min(92vw,380px)]"
        in:fly={{ x: 50, duration: 1000 }}
    >
        <button
            class="control-pill"
            on:click={() => (isExpanded = !isExpanded)}
        >
            {isExpanded ? "Hide Audio" : "Audio Params"}
        </button>

        <button
            type="button"
            class="control-pill"
            disabled={webcamLoading}
            on:click|stopPropagation={() => dispatch("toggleWebcamProjection")}
        >
            {#if webcamEnabled}
                Disable webcam projection
            {:else if webcamLoading}
                Starting camera...
            {:else}
                Enable webcam projection
            {/if}
        </button>
        {#if webcamError}
            <p class="webcam-error">{webcamError}</p>
        {/if}

        {#if isExpanded}
            <button
                class="control-pill control-pill-accent"
                on:click|stopPropagation={handlePlayClick}
            >
                Play
            </button>

            <div
                class="w-full p-3 backdrop-blur-md bg-black/25 rounded-xl border border-white/10 max-h-[78vh] overflow-y-auto"
                transition:fade={{ duration: 200 }}
            >
                <div class="flex items-center justify-between text-[10px] tracking-wider text-white/70 uppercase mb-2">
                    <span>Generative Partner</span>
                    <span>{modeState}</span>
                </div>

                <div class="flex gap-2 mb-2">
                    <button
                        type="button"
                        class="control-mini flex-1"
                        on:click|stopPropagation={toggleGenerative}
                    >
                        {generativeEnabled ? "Generative: On" : "Generative: Off"}
                    </button>
                    <button
                        type="button"
                        class="control-mini flex-1"
                        on:click|stopPropagation={toggleKeyLock}
                    >
                        {keyLocked ? "Key Lock: On" : "Key Lock: Off"}
                    </button>
                </div>

                <div class="text-[10px] text-white/70 mb-2 leading-tight">
                    <div>Detected: {detectedLabel}</div>
                    <div>BPM: {bpmLabel}</div>
                </div>

                <div class="grid grid-cols-1 gap-2 mb-3">
                    {#each [
                        { id: "autonomy", label: "Autonomy", val: autonomy },
                        { id: "density", label: "Density", val: density },
                        { id: "response", label: "Response", val: response },
                        { id: "mood", label: "Mood", val: mood },
                        { id: "tempoBias", label: "Tempo Bias", val: tempoBias }
                    ] as macro}
                        <label class="block">
                            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/60 mb-1">
                                <span>{macro.label}</span>
                                <span>{macro.val}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={macro.val}
                                class="w-full accent-[#FF0080]"
                                on:input={(e) => {
                                    const val = Number(e.currentTarget.value);
                                    if (macro.id === "autonomy") autonomy = val;
                                    if (macro.id === "density") density = val;
                                    if (macro.id === "response") response = val;
                                    if (macro.id === "mood") mood = val;
                                    if (macro.id === "tempoBias") tempoBias = val;
                                    updateMacro(macro.id, val);
                                }}
                            />
                        </label>
                    {/each}
                </div>

                <div class="grid grid-cols-1 gap-2">
                    <div class="text-[10px] tracking-wider text-cyan-300/80 uppercase">RNBO FX</div>
                    {#each rnboSliders as slider}
                        <label class="block">
                            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider text-cyan-100/70 mb-1">
                                {slider.label}
                            </div>
                            <input
                                type="range"
                                min={slider.min}
                                max={slider.max}
                                value={sliderValue(slider.id)}
                                class="w-full accent-cyan-400"
                                on:input={(e) => updateRnboSlider(slider.id, e.currentTarget.value)}
                            />
                        </label>
                    {/each}
                </div>

            </div>
        {/if}
    </div>
{/if}

<style>
    .audio-controls {
        font-family: var(--font-body);
    }

    .control-pill {
        font-family: var(--font-label);
        font-size: var(--step--1);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        border: 1px solid var(--stroke-soft);
        color: var(--text-2);
        background: linear-gradient(140deg, rgba(10, 17, 33, 0.78), rgba(5, 9, 20, 0.66));
        border-radius: 999px;
        padding: 0.56rem 1rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 24px rgba(2, 5, 14, 0.3);
        transition:
            background var(--dur-fast) var(--ease-std),
            color var(--dur-fast) var(--ease-std),
            border-color var(--dur-fast) var(--ease-std),
            transform var(--dur-fast) var(--ease-emph);
    }

    .control-pill:hover:not(:disabled) {
        transform: translateY(-1px);
        background: linear-gradient(140deg, rgba(16, 24, 46, 0.88), rgba(9, 15, 29, 0.74));
        border-color: var(--stroke-strong);
        color: var(--text-1);
    }

    .control-pill-accent:hover:not(:disabled) {
        color: #ffd8ea;
        border-color: rgba(255, 78, 163, 0.62);
        box-shadow: 0 12px 28px rgba(255, 78, 163, 0.24);
    }

    .control-mini {
        font-family: var(--font-label);
        font-size: 0.62rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        border: 1px solid var(--stroke-soft);
        border-radius: 0.55rem;
        padding: 0.3rem 0.45rem;
        color: var(--text-2);
        background: rgba(10, 17, 33, 0.52);
    }

    .control-mini:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--stroke-strong);
    }

    input[type="range"] {
        height: 14px;
    }

    .webcam-error {
        color: #ffd4e8;
        font-size: var(--step-0);
        letter-spacing: 0.01em;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.42);
        text-align: right;
        width: 100%;
    }
</style>
