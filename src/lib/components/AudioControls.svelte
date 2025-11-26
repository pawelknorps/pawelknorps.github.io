<script>
    import { audioSystem } from "$lib/AudioSystem.js";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    let visible = false;

    // Parameter values (defaults)
    let windowMs = 100;
    let chorus = 20;
    let delayMs = 200;
    let feedback = 30;
    let mix = 50;
    let pitchvol = 70;
    let revvol = 50;
    let octdamp = 20;
    let octvol = 60;

    // Drag state
    let draggingParam = null;

    onMount(() => {
        // Randomize defaults slightly (+/- 20% or within reasonable bounds)
        const randomize = (val, min, max, variation = 0.2) => {
            const range = max - min;
            const delta = range * variation * (Math.random() * 2 - 1);
            return Math.max(min, Math.min(max, val + delta));
        };

        windowMs = randomize(100, 1, 1000);
        chorus = randomize(20, 0, 100);
        delayMs = randomize(200, 0, 2000);
        feedback = randomize(30, 0, 95);
        mix = randomize(50, 0, 100);
        pitchvol = randomize(70, 0, 100);
        revvol = randomize(50, 0, 100);
        octdamp = randomize(20, 0, 100);
        octvol = randomize(60, 0, 100);

        // Apply initial randomized values
        updateParam("window", windowMs);
        updateParam("chorus", chorus);
        updateParam("delay", delayMs);
        updateParam("feedback", feedback);
        updateParam("mix", mix);
        updateParam("pitchvol", pitchvol);
        updateParam("revvol", revvol);
        updateParam("octdamp", octdamp);
        updateParam("octvol", octvol);

        // Hidden parameters (randomized only)
        updateParam("decay", randomize(50, 0, 100));
        updateParam("size", randomize(50, 0, 100));
        updateParam("damp", randomize(50, 0, 100));
        updateParam("jitter", randomize(20, 0, 50)); // Lower range for jitter to avoid glitchiness
        updateParam("diff", randomize(50, 0, 100));

        // Fade in controls after a delay
        setTimeout(() => (visible = true), 1000);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onMouseUp);
        };
    });

    function updateParam(name, value) {
        audioSystem.setParameter(name, value);
    }

    function startDrag(e, param, min, max) {
        e.preventDefault();
        e.stopPropagation();

        const node = e.currentTarget;
        const rect = node.getBoundingClientRect();
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        draggingParam = { param, min, max, node, rect };

        // Update immediately on click
        updateValue(clientY);
    }

    function onMouseMove(e) {
        if (!draggingParam) return;
        e.preventDefault();
        e.stopPropagation();
        updateValue(e.clientY);
    }

    function onTouchMove(e) {
        if (!draggingParam) return;
        e.preventDefault(); // Prevent scrolling
        e.stopPropagation();
        updateValue(e.touches[0].clientY);
    }

    function onMouseUp(e) {
        if (draggingParam) {
            draggingParam = null;
        }
    }

    function updateValue(clientY) {
        if (!draggingParam) return;

        const { param, min, max, rect } = draggingParam;

        const height = rect.height;
        const relativeY = rect.bottom - clientY;

        let percentage = relativeY / height;
        percentage = Math.max(0, Math.min(1, percentage));

        const newValue = min + percentage * (max - min);

        if (param === "window") windowMs = newValue;
        if (param === "chorus") chorus = newValue;
        if (param === "delay") delayMs = newValue;
        if (param === "feedback") feedback = newValue;
        if (param === "mix") mix = newValue;
        if (param === "pitchvol") pitchvol = newValue;
        if (param === "revvol") revvol = newValue;
        if (param === "octdamp") octdamp = newValue;
        if (param === "octvol") octvol = newValue;

        updateParam(param, newValue);
    }
</script>

{#if visible}
    <div
        class="audio-controls fixed bottom-4 left-1/2 transform -translate-x-1/2 md:right-8 md:top-1/2 md:bottom-auto md:left-auto md:translate-x-0 md:-translate-y-1/2 z-[9999] flex flex-row gap-1 pointer-events-auto select-none p-3 backdrop-blur-md bg-black/20 rounded-xl border border-white/10"
        in:fly={{ x: 50, duration: 1000 }}
        on:mousedown|stopPropagation
        on:mouseup|stopPropagation={onMouseUp}
        on:touchstart|stopPropagation
        on:touchend|stopPropagation={onMouseUp}
        on:click|stopPropagation
        on:mousemove|stopPropagation
    >
        <!-- Compact Slider Component -->
        {#each [{ id: "window", label: "WIN", val: windowMs, min: 1, max: 1000 }, { id: "chorus", label: "CHO", val: chorus, min: 0, max: 100 }, { id: "delay", label: "DEL", val: delayMs, min: 0, max: 2000 }, { id: "feedback", label: "FDB", val: feedback, min: 0, max: 95 }, { id: "mix", label: "MIX", val: mix, min: 0, max: 100 }, { id: "pitchvol", label: "PVOL", val: pitchvol, min: 0, max: 100 }, { id: "revvol", label: "RVOL", val: revvol, min: 0, max: 100 }, { id: "octdamp", label: "ODMP", val: octdamp, min: 0, max: 100 }, { id: "octvol", label: "OVOL", val: octvol, min: 0, max: 100 }] as slider}
            <div class="control-group group flex flex-col items-center w-5">
                <div
                    class="slider-container h-24 w-full bg-white/5 rounded-full relative cursor-pointer touch-none overflow-hidden group-hover:bg-white/10 transition-colors"
                    on:mousedown={(e) =>
                        startDrag(e, slider.id, slider.min, slider.max)}
                    on:touchstart={(e) =>
                        startDrag(e, slider.id, slider.min, slider.max)}
                >
                    <div
                        class="absolute bottom-0 left-0 w-full bg-white/80 group-hover:bg-[#FF0080] transition-colors"
                        style="height: {((slider.val - slider.min) /
                            (slider.max - slider.min)) *
                            100}%"
                    ></div>
                </div>
                <div
                    class="label text-[7px] font-bold tracking-wider text-white/40 mt-2 text-center group-hover:text-white transition-colors"
                >
                    {slider.label}
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    /* No extra styles needed, using Tailwind */
</style>
