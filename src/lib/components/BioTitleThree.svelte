<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let canvas;
	let renderer;
	let scene;
	let camera;
	let textMesh;
	let glowMesh;
	let stars;
	let animationFrame;
	let resizeObserver;

	const uniforms = {
		uTime: { value: 0 },
		uTexture: { value: null }
	};

	const createTextTexture = () => {
		const c = document.createElement('canvas');
		c.width = 2048;
		c.height = 768;
		const ctx = c.getContext('2d');

		ctx.clearRect(0, 0, c.width, c.height);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		const gradient = ctx.createLinearGradient(260, 200, 1700, 560);
		gradient.addColorStop(0, '#98d4ff');
		gradient.addColorStop(0.48, '#ffffff');
		gradient.addColorStop(1, '#ff4ca6');

		ctx.shadowColor = 'rgba(255, 54, 156, 0.52)';
		ctx.shadowBlur = 56;
		ctx.font = '700 320px "Knorps Display", "Iowan Old Style", serif';
		ctx.fillStyle = gradient;
		ctx.fillText('O MNIE', c.width / 2, c.height / 2 + 8);

		ctx.shadowBlur = 0;
		ctx.strokeStyle = 'rgba(169, 224, 255, 0.95)';
		ctx.lineWidth = 4;
		ctx.strokeText('O MNIE', c.width / 2, c.height / 2 + 8);

		const texture = new THREE.CanvasTexture(c);
		texture.anisotropy = 8;
		texture.needsUpdate = true;
		return texture;
	};

	const resize = () => {
		if (!canvas || !renderer || !camera) return;
		const { width, height } = canvas.getBoundingClientRect();
		if (!width || !height) return;
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};

	const animate = () => {
		uniforms.uTime.value += 0.013;
		const t = uniforms.uTime.value;

		if (textMesh) {
			textMesh.rotation.y = Math.sin(t * 0.6) * 0.12;
			textMesh.rotation.x = Math.cos(t * 0.5) * 0.05;
		}

		if (glowMesh) {
			glowMesh.scale.setScalar(1.02 + Math.sin(t * 1.9) * 0.02);
			glowMesh.material.opacity = 0.34 + Math.sin(t * 1.7) * 0.08;
		}

		if (stars) {
			stars.rotation.z += 0.0008;
			stars.rotation.y = Math.sin(t * 0.2) * 0.15;
		}

		renderer.render(scene, camera);
		animationFrame = requestAnimationFrame(animate);
	};

	onMount(() => {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
		camera.position.set(0, 0, 7.2);

		renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true,
			powerPreference: 'high-performance'
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setClearColor(0x000000, 0);

		const textTexture = createTextTexture();
		uniforms.uTexture.value = textTexture;

		const geometry = new THREE.PlaneGeometry(7.8, 2.9, 120, 48);
		const material = new THREE.ShaderMaterial({
			uniforms,
			transparent: true,
			vertexShader: `
				uniform float uTime;
				varying vec2 vUv;
				void main() {
					vUv = uv;
					vec3 p = position;
					float waveX = sin((p.x * 2.1) + (uTime * 1.65)) * 0.1;
					float waveY = cos((p.y * 3.2) + (uTime * 1.3)) * 0.05;
					p.z += waveX + waveY;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
				}
			`,
			fragmentShader: `
				uniform sampler2D uTexture;
				uniform float uTime;
				varying vec2 vUv;
				void main() {
					vec2 uv = vUv;
					float drift = sin((uv.y * 16.0) + (uTime * 2.8)) * 0.004;
					vec4 r = texture2D(uTexture, uv + vec2(drift * 1.2, 0.0));
					vec4 g = texture2D(uTexture, uv + vec2(0.0, drift * 0.6));
					vec4 b = texture2D(uTexture, uv - vec2(drift * 1.0, 0.0));
					vec4 color = vec4(r.r, g.g, b.b, max(max(r.a, g.a), b.a));
					float glow = smoothstep(0.12, 1.0, color.a) * (0.22 + 0.18 * sin(uTime * 2.1));
					color.rgb += vec3(0.24, 0.12, 0.3) * glow;
					gl_FragColor = color;
				}
			`
		});

		textMesh = new THREE.Mesh(geometry, material);
		scene.add(textMesh);

		glowMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(8.3, 3.2),
			new THREE.MeshBasicMaterial({
				map: textTexture,
				transparent: true,
				opacity: 0.35,
				color: 0x7fd6ff,
				blending: THREE.AdditiveBlending,
				depthWrite: false
			})
		);
		glowMesh.position.z = -0.12;
		scene.add(glowMesh);

		const starGeo = new THREE.BufferGeometry();
		const starCount = 280;
		const starPositions = new Float32Array(starCount * 3);
		for (let i = 0; i < starCount; i++) {
			starPositions[i * 3] = (Math.random() - 0.5) * 11.5;
			starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
			starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
		}
		starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
		stars = new THREE.Points(
			starGeo,
			new THREE.PointsMaterial({
				color: 0x9fd4ff,
				size: 0.03,
				transparent: true,
				opacity: 0.42,
				sizeAttenuation: true,
				blending: THREE.AdditiveBlending,
				depthWrite: false
			})
		);
		scene.add(stars);

		scene.add(new THREE.AmbientLight(0xffffff, 0.4));
		const key = new THREE.PointLight(0x78abff, 1.8, 20);
		key.position.set(1.6, 1.4, 4.6);
		scene.add(key);
		const fill = new THREE.PointLight(0xff3d93, 1.35, 18);
		fill.position.set(-2.4, -1.2, 4.2);
		scene.add(fill);

		resize();
		resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas);
		animate();

		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
			if (resizeObserver) resizeObserver.disconnect();
			if (textMesh?.geometry) textMesh.geometry.dispose();
			if (textMesh?.material) textMesh.material.dispose();
			if (glowMesh?.geometry) glowMesh.geometry.dispose();
			if (glowMesh?.material) glowMesh.material.dispose();
			if (stars?.geometry) stars.geometry.dispose();
			if (stars?.material) stars.material.dispose();
			if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();
			renderer?.dispose();
		};
	});
</script>

<div class="bio-title-canvas-wrap" aria-hidden="true">
	<canvas bind:this={canvas} class="bio-title-canvas"></canvas>
</div>

<style>
	.bio-title-canvas-wrap {
		width: 100%;
		height: clamp(160px, 20vw, 240px);
		position: relative;
		pointer-events: none;
	}

	.bio-title-canvas {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
