<script>
    import { onMount, createEventDispatcher } from "svelte";
    import { base } from "$app/paths";

    export let musicProjects = [];
    export let programmingProjects = [];
    export let sceneReady = false;

    const dispatch = createEventDispatcher();

    let ThreeObject;
    let ThreeModule;
    let sceneInitialized = false;
    let preloadedImage;

    // Preload main image
    if (typeof window !== "undefined") {
        preloadedImage = new Image();
        preloadedImage.crossOrigin = "anonymous";
        preloadedImage.onload = () =>
            console.log("Main image preloaded successfully");
        preloadedImage.onerror = (e) =>
            console.warn("Main image preload failed:", e);
        preloadedImage.src = `${base}/my-photo.webp`;
    }

    // Brightness sampling logic
    let backgroundBrightness = 0.5;

    function sampleCanvasBrightness() {
        if (!ThreeObject || !sceneInitialized) return;

        try {
            const canvas = ThreeObject;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            // Sample multiple points across the canvas
            const samplePoints = [
                { x: canvas.width * 0.2, y: canvas.height * 0.3 },
                { x: canvas.width * 0.5, y: canvas.height * 0.5 },
                { x: canvas.width * 0.8, y: canvas.height * 0.7 },
                { x: canvas.width * 0.3, y: canvas.height * 0.8 },
                { x: canvas.width * 0.7, y: canvas.height * 0.2 },
            ];

            let totalBrightness = 0;
            let validSamples = 0;

            samplePoints.forEach((point) => {
                try {
                    const imageData = ctx.getImageData(point.x, point.y, 1, 1);
                    const [r, g, b] = imageData.data;
                    const brightness =
                        (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    totalBrightness += brightness;
                    validSamples++;
                } catch (e) {
                    // Skip invalid samples
                }
            });

            if (validSamples > 0) {
                backgroundBrightness = totalBrightness / validSamples;
                dispatch("brightnessChange", backgroundBrightness);
            }
        } catch (error) {
            // Ignore
        }
    }

    const initializeScene = async () => {
        if (!ThreeObject || sceneInitialized) return;

        try {
            console.log("Initializing 3D scene...");

            ThreeModule = await import("$lib/ThreeObject.js");

            if (
                preloadedImage &&
                preloadedImage.complete &&
                preloadedImage.naturalWidth > 0
            ) {
                console.log("Using preloaded image");
                ThreeModule.setInitialTexture(preloadedImage);
            } else {
                console.warn(
                    "Preloaded image not ready or failed, falling back to standard loader",
                );
                ThreeModule.loadTextureAtIndex(0);
            }

            ThreeObject.width = window.innerWidth;
            ThreeObject.height = window.innerHeight;

            await ThreeModule.setScene(ThreeObject);
            sceneInitialized = true;
            sceneReady = true;

            ThreeModule.loadTextures();

            console.log("Scene initialized successfully");

            if (musicProjects.length > 0 || programmingProjects.length > 0) {
                ThreeModule.updateProjects(musicProjects, programmingProjects);
                console.log("Projects updated");
            }

            // Start brightness sampling
            let frameCount = 0;
            let brightnessInterval;

            function startBrightnessSampling() {
                function sampleLoop() {
                    if (frameCount % 10 === 0) {
                        sampleCanvasBrightness();
                    }
                    frameCount++;
                    brightnessInterval = requestAnimationFrame(sampleLoop);
                }
                sampleLoop();
            }

            function stopBrightnessSampling() {
                cancelAnimationFrame(brightnessInterval);
            }

            startBrightnessSampling();

            return () => {
                stopBrightnessSampling();
            };
        } catch (error) {
            console.error("Failed to initialize scene:", error);
        }
    };

    onMount(async () => {
        if (ThreeObject) {
            await initializeScene();
        }
    });

    const handleCanvasClick = () => {
        if (!sceneInitialized) {
            console.log("Manual scene initialization triggered");
            initializeScene();
        }
        dispatch("audioReq");
    };

    // Expose focusProject method
    export const focusProject = (id) => {
        if (ThreeModule) ThreeModule.focusProject(id);
    };
</script>

<canvas
    bind:this={ThreeObject}
    on:click={handleCanvasClick}
    class="canvas-layer absolute inset-0 w-full h-full cursor-grab"
    style:pointer-events={sceneReady ? "auto" : "none"}
    style:opacity={sceneReady ? 1 : 0}
    style:z-index={1}
></canvas>

<style>
    /* By default, let Three.js control all gestures */
    canvas {
        touch-action: none;
    }

    /* Responsive adjustments for mobile */
    @media (max-width: 800px) {
        canvas {
            touch-action: pan-y;
        }
    }
</style>
