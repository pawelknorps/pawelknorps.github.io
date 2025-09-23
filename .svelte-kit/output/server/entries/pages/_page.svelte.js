import { c as create_ssr_component, e as escape, d as each, f as add_attribute, v as validate_component } from "../../chunks/index.js";
import * as THREE from "three";
import { TextureLoader } from "three";
import { b as base } from "../../chunks/paths.js";
const loader = new TextureLoader();
const texture = [
  loader.load(`${base}/my-photo.webp`),
  loader.load(`${base}/my-photo2.webp`),
  loader.load(`${base}/photo3.webp`),
  loader.load(`${base}/photo4.webp`),
  loader.load(`${base}/photo5.webp`),
  loader.load(`${base}/photo6.webp`),
  loader.load(`${base}/photo8.webp`)
];
const SCENE = new THREE.Scene();
let n = 0.2;
const morphShader = {
  uniforms: {
    tDiffuse1: { value: texture[0] },
    tDiffuse2: { value: texture[1] },
    morphFactor: { value: n },
    time: { value: 0 }
  },
  vertexShader: `
        // Classic Perlin 3D Noise by Stefan Gustavson
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

        float cnoise(vec3 P) {
            vec3 Pi0 = floor(P);
            vec3 Pi1 = Pi0 + vec3(1.0);
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P);
            vec3 Pf1 = Pf0 - vec3(1.0);
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
            vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
            vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
            vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
            vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
            vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
            vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
            vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
            return 2.2 * n_xyz;
        }

        uniform float time;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec3 pos = position;
            float noiseValue = cnoise(vec3(pos.x + time, pos.y, pos.z));
            pos = pos * (1.0 + noiseValue);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
  fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform float morphFactor;
        varying vec2 vUv;

        void main() {
            vec2 offset = vec2(0.3, 0.2);
            vec2 shiftedUv = fract(vUv + offset); 
            vec4 color1 = texture2D(tDiffuse1, shiftedUv);
            vec4 color2 = texture2D(tDiffuse2, shiftedUv);
            gl_FragColor = mix(color1, color2, morphFactor);
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
const light = new THREE.AmbientLight(4210752);
SCENE.add(light);
const directionalLight = new THREE.DirectionalLight(16777215, 0.8);
directionalLight.position.set(1, 1, 1);
const directionalLight2 = new THREE.DirectionalLight(16777215, 0.2);
directionalLight2.position.set(-1, 0, 1);
SCENE.add(directionalLight2);
SCENE.add(directionalLight);
let z = 5;
let m = 0.2;
let CAMERA = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, m, z);
CAMERA.position.z = 2.2;
const projectPoints = new THREE.Group();
SCENE.add(projectPoints);
new THREE.Raycaster();
new THREE.Vector2();
const updateScrollPosition = () => {
  window.pageYOffset || document.documentElement.scrollTop;
};
window.addEventListener("scroll", updateScrollPosition);
const HeroSection_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: "#revelation.svelte-e1v3kp{animation:svelte-e1v3kp-rainbow 6s infinite}@keyframes svelte-e1v3kp-rainbow{0%{color:#FF0080}15%{color:#FF00AA}30%{color:#FF00EA}45%{color:#EA00FF}60%{color:#FF00C8}75%{color:#FF009D}100%{color:#FF008C}}.hero-section.svelte-e1v3kp{background:transparent}.adaptive-text.svelte-e1v3kp{transition:color 0.4s cubic-bezier(0.4, 0, 0.2, 1);text-shadow:0 0 10px rgba(0, 0, 0, 0.8),\n			0 2px 4px rgba(0, 0, 0, 0.6),\n			0 1px 2px rgba(0, 0, 0, 0.9)}",
  map: null
};
const HeroSection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { personalData } = $$props;
  let { adaptiveTextClass } = $$props;
  let { adaptiveSubTextClass } = $$props;
  if ($$props.personalData === void 0 && $$bindings.personalData && personalData !== void 0)
    $$bindings.personalData(personalData);
  if ($$props.adaptiveTextClass === void 0 && $$bindings.adaptiveTextClass && adaptiveTextClass !== void 0)
    $$bindings.adaptiveTextClass(adaptiveTextClass);
  if ($$props.adaptiveSubTextClass === void 0 && $$bindings.adaptiveSubTextClass && adaptiveSubTextClass !== void 0)
    $$bindings.adaptiveSubTextClass(adaptiveSubTextClass);
  $$result.css.add(css$4);
  return `
<div class="${"hero-section h-[75vh] flex flex-col justify-center relative svelte-e1v3kp"}"><div class="${"group z-10"}"><h2 class="${[
    "text-6xl font-black tracking-widest ml-20 adaptive-text svelte-e1v3kp",
    (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
  ].join(" ").trim()}">${escape(personalData.name)}</h2>
		<h2 class="${[
    "text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text svelte-e1v3kp",
    (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
  ].join(" ").trim()}">\xA0${escape(personalData.title)} and <mark id="${"revelation"}" style="${"background: none; color: #FF0080;"}" class="${"font-black svelte-e1v3kp"}">guitarist.</mark></h2>
		<h2 class="${[
    "text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text svelte-e1v3kp",
    (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
  ].join(" ").trim()}">\xA0${escape(personalData.bio)}</h2></div>
</div>`;
});
const SocialBubbles_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: ".social-bubbles.svelte-1qoq37v.svelte-1qoq37v{animation:svelte-1qoq37v-float 3s ease-in-out infinite}.social-bubble.svelte-1qoq37v.svelte-1qoq37v{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);background:rgba(255, 255, 255, 0.1);border:1px solid rgba(255, 255, 255, 0.2);color:rgba(255, 255, 255, 0.8);transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);position:relative;overflow:hidden}.social-bubble.svelte-1qoq37v.svelte-1qoq37v::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);transition:left 0.5s}.social-bubble.svelte-1qoq37v.svelte-1qoq37v:hover::before{left:100%}.social-bubble.svelte-1qoq37v.svelte-1qoq37v:hover{transform:translateY(-4px) scale(1.1);box-shadow:0 20px 40px rgba(0, 0, 0, 0.3);color:white}.social-bubble.youtube.svelte-1qoq37v.svelte-1qoq37v:hover{background:rgba(255, 0, 0, 0.2);border-color:rgba(255, 0, 0, 0.5);box-shadow:0 20px 40px rgba(255, 0, 0, 0.2)}.social-bubble.instagram.svelte-1qoq37v.svelte-1qoq37v:hover{background:linear-gradient(45deg, rgba(225, 48, 108, 0.2), rgba(255, 214, 0, 0.2));border-color:rgba(225, 48, 108, 0.5);box-shadow:0 20px 40px rgba(225, 48, 108, 0.2)}.social-bubble.facebook.svelte-1qoq37v.svelte-1qoq37v:hover{background:rgba(24, 119, 242, 0.2);border-color:rgba(24, 119, 242, 0.5);box-shadow:0 20px 40px rgba(24, 119, 242, 0.2)}.social-bubble.svelte-1qoq37v.svelte-1qoq37v:nth-child(1){animation-delay:0s}.social-bubble.svelte-1qoq37v.svelte-1qoq37v:nth-child(2){animation-delay:0.2s}.social-bubble.svelte-1qoq37v.svelte-1qoq37v:nth-child(3){animation-delay:0.4s}@keyframes svelte-1qoq37v-float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}@media(max-width: 768px){.social-bubbles.svelte-1qoq37v.svelte-1qoq37v{top:1rem;right:1rem;gap:0.75rem}.social-bubble.svelte-1qoq37v.svelte-1qoq37v{width:48px;height:48px}.social-bubble.svelte-1qoq37v svg.svelte-1qoq37v{width:20px;height:20px}}",
  map: null
};
const SocialBubbles = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$3);
  return `
<div class="${"social-bubbles fixed top-8 right-8 z-20 flex flex-col gap-4 svelte-1qoq37v"}"><a href="${"https://www.youtube.com/@pawo161"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"social-bubble youtube svelte-1qoq37v"}" title="${"YouTube"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"currentColor"}" class="${"svelte-1qoq37v"}"><path d="${"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"}"></path></svg></a>
	
	<a href="${"https://www.instagram.com/pawel_knorps/"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"social-bubble instagram svelte-1qoq37v"}" title="${"Instagram"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"currentColor"}" class="${"svelte-1qoq37v"}"><path d="${"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"}"></path></svg></a>
	
	<a href="${"https://www.facebook.com/pawo161/"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"social-bubble facebook svelte-1qoq37v"}" title="${"Facebook"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"currentColor"}" class="${"svelte-1qoq37v"}"><path d="${"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"}"></path></svg></a>
</div>`;
});
const ProjectsSection_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ".project-group.svelte-ud7962.svelte-ud7962{background:transparent}.project-group.svelte-ud7962 .group.svelte-ud7962:hover{transform:translateY(-2rem) scale(1.02)}.project-card.svelte-ud7962.svelte-ud7962{transition:all 0.5s cubic-bezier(0.4, 0, 0.2, 1);border-radius:10px;padding:0.8rem;position:relative;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);background:rgba(0, 0, 0, 0.15);border:1px solid rgba(255, 255, 255, 0.1)}.project-card.svelte-ud7962.svelte-ud7962::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(45deg, rgba(255, 0, 128, 0.1), transparent);border-radius:12px;opacity:0;transition:opacity 0.3s ease;z-index:-1}.project-card.svelte-ud7962.svelte-ud7962:hover::before{opacity:1}.project-group.svelte-ud7962 span.svelte-ud7962:hover{background:rgba(255, 0, 128, 0.1);border-color:rgba(255, 0, 128, 0.8);color:white}.adaptive-text.svelte-ud7962.svelte-ud7962,.adaptive-subtext.svelte-ud7962.svelte-ud7962{transition:color 0.4s cubic-bezier(0.4, 0, 0.2, 1)}.adaptive-text.svelte-ud7962.svelte-ud7962{text-shadow:0 0 10px rgba(0, 0, 0, 0.8),\n			0 2px 4px rgba(0, 0, 0, 0.6),\n			0 1px 2px rgba(0, 0, 0, 0.9)}.adaptive-subtext.svelte-ud7962.svelte-ud7962{text-shadow:0 0 8px rgba(0, 0, 0, 0.7),\n			0 1px 3px rgba(0, 0, 0, 0.5)}",
  map: null
};
const ProjectsSection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { musicProjects } = $$props;
  let { programmingProjects } = $$props;
  let { adaptiveTextClass } = $$props;
  let { adaptiveSubTextClass } = $$props;
  if ($$props.musicProjects === void 0 && $$bindings.musicProjects && musicProjects !== void 0)
    $$bindings.musicProjects(musicProjects);
  if ($$props.programmingProjects === void 0 && $$bindings.programmingProjects && programmingProjects !== void 0)
    $$bindings.programmingProjects(programmingProjects);
  if ($$props.adaptiveTextClass === void 0 && $$bindings.adaptiveTextClass && adaptiveTextClass !== void 0)
    $$bindings.adaptiveTextClass(adaptiveTextClass);
  if ($$props.adaptiveSubTextClass === void 0 && $$bindings.adaptiveSubTextClass && adaptiveSubTextClass !== void 0)
    $$bindings.adaptiveSubTextClass(adaptiveSubTextClass);
  $$result.css.add(css$2);
  return `
${musicProjects.length > 0 ? `<div class="${"project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:w-[40rem] svelte-ud7962"}"><h3 class="${[
    "text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text w-full xl:w-[40rem] svelte-ud7962",
    (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
  ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">//</mark> MUSIC
		</h3>
		${each(musicProjects, (data, i) => {
    return `<div id="${"music-" + escape(i, true)}" class="${"group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out w-[20rem] md:w-[40rem] lg:w-[30rem] xl:w-[40rem] project-card pointer-events-auto svelte-ud7962"}">${data.links ? `<a${add_attribute("href", data.links.youtube || data.links.bandcamp || data.links.soundcloud || data.links.facebook, 0)} rel="${"noopener noreferrer"}" target="${"_blank"}" class="${"block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"}"><h2 class="${[
      "text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 adaptive-text svelte-ud7962",
      (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
    ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">.</mark>\xA0${escape(data.title)}</h2>
						<h2 class="${[
      "text-md font-base mb-6 leading-relaxed adaptive-subtext svelte-ud7962",
      (adaptiveSubTextClass === "text-gray-300" ? "text-gray-300" : "") + " " + (adaptiveSubTextClass === "text-gray-200" ? "text-gray-200" : "") + " " + (adaptiveSubTextClass === "text-gray-700" ? "text-gray-700" : "")
    ].join(" ").trim()}">${escape(data.description)}</h2>
						<div class="${"flex flex-wrap gap-3"}">${data.features ? `${each(data.features, (feature) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200 svelte-ud7962"}">${escape(feature)}</span>`;
    })}` : ``}</div>
					</a>` : `<div class="${"h-auto px-0 py-0 tracking-widest"}"><h2 class="${[
      "text-xl font-black mb-4 adaptive-text svelte-ud7962",
      (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
    ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">.</mark>\xA0${escape(data.title)}</h2>
						<h2 class="${[
      "text-md font-base mb-6 leading-relaxed adaptive-subtext svelte-ud7962",
      (adaptiveSubTextClass === "text-gray-300" ? "text-gray-300" : "") + " " + (adaptiveSubTextClass === "text-gray-200" ? "text-gray-200" : "") + " " + (adaptiveSubTextClass === "text-gray-700" ? "text-gray-700" : "")
    ].join(" ").trim()}">${escape(data.description)}</h2>
						<div class="${"flex flex-wrap gap-3"}">${data.features ? `${each(data.features, (feature) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full svelte-ud7962"}">${escape(feature)}</span>`;
    })}` : ``}</div>
					</div>`}
			</div>`;
  })}</div>` : ``}


${programmingProjects.length > 0 ? `<div class="${"project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:w-[40rem] svelte-ud7962"}"><h3 class="${[
    "text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text w-full xl:w-[40rem] svelte-ud7962",
    (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
  ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">//</mark> OTHER
		</h3>
		${each(programmingProjects, (data, i) => {
    return `<div id="${"programming-" + escape(i, true)}" class="${"group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out w-[20rem] md:w-[40rem] lg:w-[30rem] xl:w-[40rem] project-card pointer-events-auto svelte-ud7962"}">${data.github || data.demo ? `<a${add_attribute("href", data.github || data.demo, 0)} rel="${"noopener noreferrer"}" target="${"_blank"}" class="${"block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"}"><h2 class="${[
      "text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 adaptive-text svelte-ud7962",
      (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
    ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">.</mark>\xA0${escape(data.title)}</h2>
						<h2 class="${[
      "text-md font-base mb-6 leading-relaxed adaptive-subtext svelte-ud7962",
      (adaptiveSubTextClass === "text-gray-300" ? "text-gray-300" : "") + " " + (adaptiveSubTextClass === "text-gray-200" ? "text-gray-200" : "") + " " + (adaptiveSubTextClass === "text-gray-700" ? "text-gray-700" : "")
    ].join(" ").trim()}">${escape(data.description)}</h2>
						<div class="${"flex flex-wrap gap-3"}">${data.technologies ? `${each(data.technologies, (topic) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200 svelte-ud7962"}">${escape(topic)}</span>`;
    })}` : ``}</div>
					</a>` : `<div class="${"h-auto px-0 py-0 tracking-widest"}"><h2 class="${[
      "text-xl font-black mb-4 adaptive-text svelte-ud7962",
      (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
    ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">.</mark>\xA0${escape(data.title)}</h2>
						<h2 class="${[
      "text-md font-base mb-6 leading-relaxed adaptive-subtext svelte-ud7962",
      (adaptiveSubTextClass === "text-gray-300" ? "text-gray-300" : "") + " " + (adaptiveSubTextClass === "text-gray-200" ? "text-gray-200" : "") + " " + (adaptiveSubTextClass === "text-gray-700" ? "text-gray-700" : "")
    ].join(" ").trim()}">${escape(data.description)}</h2>
						<div class="${"flex flex-wrap gap-3"}">${data.technologies ? `${each(data.technologies, (topic) => {
      return `<span class="${"text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full svelte-ud7962"}">${escape(topic)}</span>`;
    })}` : ``}</div>
					</div>`}
			</div>`;
  })}</div>` : ``}`;
});
const BiographicalSection_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".biographical-text.svelte-18y2vm8.svelte-18y2vm8{position:relative}.bio-flow-container.svelte-18y2vm8.svelte-18y2vm8{position:relative;margin-top:25rem;top:2rem;padding:2rem;transition:opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);background:rgba(0, 0, 0, 0.1);border-left:1px solid rgba(255, 255, 255, 0.1);border-radius:12px;display:flex;flex-direction:column;justify-content:flex-start}.bio-content-flow.svelte-18y2vm8.svelte-18y2vm8{background:transparent;border:none;padding:1rem;flex:1;display:flex;flex-direction:column;justify-content:space-evenly}.bio-text.svelte-18y2vm8 p.svelte-18y2vm8{text-align:justify;font-family:system-ui, -apple-system, sans-serif;font-weight:300;line-height:1.8;margin-bottom:1rem;padding-right:3rem}.bio-text.svelte-18y2vm8 span.svelte-18y2vm8{font-weight:600}.achievements-section.svelte-18y2vm8.svelte-18y2vm8{border-top:1px solid rgba(255, 0, 128, 0.2);padding-top:1rem;margin-top:1rem}.achievements-list.svelte-18y2vm8.svelte-18y2vm8{max-height:none}.achievement-item.svelte-18y2vm8.svelte-18y2vm8{padding:1rem 0;border-left:3px solid rgba(255, 0, 128, 0.3);padding-left:1.5rem;margin-left:0.75rem;transition:all 0.3s ease;line-height:1.6}.achievement-item.svelte-18y2vm8.svelte-18y2vm8:hover{border-left-color:rgba(255, 0, 128, 0.8);padding-left:2rem;background:rgba(255, 0, 128, 0.05);border-radius:0 8px 8px 0}.bio-flow-container.svelte-18y2vm8.svelte-18y2vm8::-webkit-scrollbar{width:6px}.bio-flow-container.svelte-18y2vm8.svelte-18y2vm8::-webkit-scrollbar-track{background:rgba(255, 255, 255, 0.1);border-radius:3px}.bio-flow-container.svelte-18y2vm8.svelte-18y2vm8::-webkit-scrollbar-thumb{background:rgba(255, 0, 128, 0.5);border-radius:3px}.bio-flow-container.svelte-18y2vm8.svelte-18y2vm8::-webkit-scrollbar-thumb:hover{background:rgba(255, 0, 128, 0.8)}.adaptive-text.svelte-18y2vm8.svelte-18y2vm8,.adaptive-subtext.svelte-18y2vm8.svelte-18y2vm8{transition:color 0.4s cubic-bezier(0.4, 0, 0.2, 1)}.adaptive-text.svelte-18y2vm8.svelte-18y2vm8{text-shadow:0 0 10px rgba(0, 0, 0, 0.8),\n			0 2px 4px rgba(0, 0, 0, 0.6),\n			0 1px 2px rgba(0, 0, 0, 0.9)}.adaptive-subtext.svelte-18y2vm8.svelte-18y2vm8{text-shadow:0 0 8px rgba(0, 0, 0, 0.7),\n			0 1px 3px rgba(0, 0, 0, 0.5)}@media(min-width: 1536px){.bio-text.svelte-18y2vm8.svelte-18y2vm8{font-size:1.125rem;line-height:1.9}}",
  map: null
};
const BiographicalSection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let bioOpacity;
  let minBioHeight;
  let { scrollY } = $$props;
  let { innerHeight } = $$props;
  let { projectsHeight } = $$props;
  let { adaptiveTextClass } = $$props;
  let { adaptiveSubTextClass } = $$props;
  if ($$props.scrollY === void 0 && $$bindings.scrollY && scrollY !== void 0)
    $$bindings.scrollY(scrollY);
  if ($$props.innerHeight === void 0 && $$bindings.innerHeight && innerHeight !== void 0)
    $$bindings.innerHeight(innerHeight);
  if ($$props.projectsHeight === void 0 && $$bindings.projectsHeight && projectsHeight !== void 0)
    $$bindings.projectsHeight(projectsHeight);
  if ($$props.adaptiveTextClass === void 0 && $$bindings.adaptiveTextClass && adaptiveTextClass !== void 0)
    $$bindings.adaptiveTextClass(adaptiveTextClass);
  if ($$props.adaptiveSubTextClass === void 0 && $$bindings.adaptiveSubTextClass && adaptiveSubTextClass !== void 0)
    $$bindings.adaptiveSubTextClass(adaptiveSubTextClass);
  $$result.css.add(css$1);
  bioOpacity = Math.max(0, Math.min(1, (scrollY - innerHeight * 0.2) / (innerHeight * 0.2)));
  minBioHeight = Math.max(projectsHeight / 2, innerHeight * 0.8);
  return `
<div class="${"biographical-text svelte-18y2vm8"}"><div class="${"bio-flow-container svelte-18y2vm8"}" style="${"opacity: " + escape(bioOpacity, true) + "; min-height: " + escape(minBioHeight, true) + "px;"}"><div class="${"bio-content-flow svelte-18y2vm8"}"><h3 class="${[
    "text-3xl xl:text-4xl font-black tracking-widest mb-8 opacity-80 adaptive-text svelte-18y2vm8",
    (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
  ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">//</mark> O MNIE
			</h3>
			
			<div class="${[
    "bio-text text-base xl:text-mds leading-relaxed space-y-8 adaptive-subtext svelte-18y2vm8",
    (adaptiveSubTextClass === "text-gray-300" ? "text-gray-300" : "") + " " + (adaptiveSubTextClass === "text-gray-200" ? "text-gray-200" : "") + " " + (adaptiveSubTextClass === "text-gray-700" ? "text-gray-700" : "")
  ].join(" ").trim()}"><p class="${"svelte-18y2vm8"}">Pawe\u0142 Knorps jest aktywnym muzykiem na polskiej i du\u0144skiej scenie. Niedawno obroni\u0142 dyplom magisterski z gitary jazzowej na pozna\u0144skiej Akademii, a nied\u0142ugo p\xF3\u017Aniej r\xF3wnie\u017C dyplom magisterski z kompozycji jazzowej na presti\u017Cowej uczelni Danish National Academy of Music w Odense.</p>
				
				<p class="${"svelte-18y2vm8"}">Jest g\u0142\xF3wnie muzykiem improwizuj\u0105cym \u2013 zawodowo gitarzyst\u0105, ale r\xF3wnie\u017C basist\u0105, producentem muzycznym i kompozytorem. Interesuje go szczeg\xF3lnie tworzenie muzyki, kt\xF3ra przekracza utrwalone granice. Kluczowa jest dla niego swobodna ekspresja i niczym nieskr\u0119powana kreatywno\u015B\u0107.</p>
				
				<p class="${"svelte-18y2vm8"}">Jego nowy projekt to oryginalny jazzowy materia\u0142 grany z pozna\u0144skimi jazzmanami \u2013 Krzysztofem Dysem, Dawidem Tok\u0142owiczem, Piotrem Cienkowskim, Kajetanem Pilarskim. Dzia\u0142aj\u0105 pod nazw\u0105 <span class="${"text-[#FF0080] font-semibold svelte-18y2vm8"}">Pawel Knorps Group</span>, jest to debiutancki projekt Paw\u0142a jako lidera i kompozytora muzyki jazzowej.</p>
				
				<p class="${"svelte-18y2vm8"}">S\u0105 jednym z sze\u015Bciu finalist\xF3w Blue Note Competition 2024, gdzie zostali wybrani spo\u015Br\xF3d prawie 50 zespo\u0142\xF3w jazzowych z Europy.</p>
				
				<p class="${"svelte-18y2vm8"}">Pawe\u0142 jest g\u0142\u0119boko zaanga\u017Cowany w tworzenie miejskiej tkanki kulturalnej Poznania. Od 2019 roku jest jedn\u0105 z os\xF3b zarz\u0105dzaj\u0105cych i tworz\u0105cych <span class="${"text-[#FF0080] font-semibold svelte-18y2vm8"}">Ko\u0142orking Muzyczny</span> na \u015Aw. Marcinie 75.</p>
				
				<p class="${"svelte-18y2vm8"}">Zorganizowa\u0142 tam kilkadziesi\u0105t wydarze\u0144 \u2013 koncert\xF3w, warsztat\xF3w, spotka\u0144, pr\xF3b muzycznych. Jest to oddolna inicjatywa, kt\xF3ra wspiera spo\u0142ecze\u0144stwo w rozwoju muzycznym bez barier \u2013 bez koszt\xF3w finansowych i ze wsparciem mentorskim.</p>
				
				<p class="${"svelte-18y2vm8"}">Jego poboczn\u0105 pasj\u0105 jest produkcja i tworzenie muzyki elektronicznej jako <span class="${"text-[#FF0080] font-semibold svelte-18y2vm8"}">enthymeme</span>. Gra\u0142 improwizowan\u0105, eksperymentaln\u0105 tkank\u0119 d\u017Awi\u0119kow\u0105 w takich klubach jak: Dom Technika, Farby, My, M\xF3zg Bydgoszcz.</p>
				
				<p class="${"svelte-18y2vm8"}">Obecnie po powrocie do Poznania w czerwcu 2024 ze studi\xF3w w Danii do\u0142\u0105czy\u0142 do pozna\u0144skich projekt\xF3w: Milomi, SNY, MUIZK NVA LAB, Domsun.</p></div>

			<div class="${"achievements-section mt-16 svelte-18y2vm8"}"><h3 class="${[
    "text-2xl xl:text-3xl font-black tracking-widest mb-8 opacity-80 adaptive-text svelte-18y2vm8",
    (adaptiveTextClass === "text-white" ? "text-white" : "") + " " + (adaptiveTextClass === "text-gray-900" ? "text-gray-900" : "")
  ].join(" ").trim()}"><mark style="${"background: none;"}" class="${"text-[#FF0080]"}">//</mark> DOKONANIA
				</h3>
				<div class="${[
    "achievements-list text-sm xl:text-base leading-relaxed space-y-6 adaptive-subtext svelte-18y2vm8",
    (adaptiveSubTextClass === "text-gray-300" ? "text-gray-300" : "") + " " + (adaptiveSubTextClass === "text-gray-200" ? "text-gray-200" : "") + " " + (adaptiveSubTextClass === "text-gray-700" ? "text-gray-700" : "")
  ].join(" ").trim()}"><div class="${"achievement-item svelte-18y2vm8"}"><span class="${"text-[#FF0080] font-bold text-lg"}">2021</span> - wygrana O K N O | Mini-konkurs na kreatywne akcje w oknie Ko\u0142orkingu muzycznego
					</div>
					<div class="${"achievement-item svelte-18y2vm8"}"><span class="${"text-[#FF0080] font-bold text-lg"}">2020-2021</span> nagroda od Teatru Muzycznego w Poznaniu w Konkursie \u201ECi\u0105g dalszy nast\u0105pi cz. II&quot; za projekt \u201EPerformance audiowizualny nawi\u0105zuj\u0105cy do sieci neuronowej&quot;
					</div>
					<div class="${"achievement-item svelte-18y2vm8"}"><span class="${"text-[#FF0080] font-bold text-lg"}">2022</span> - stypendium programu Erasmus na studia w Syddansk musikkonservatorium w Odense, gdzie p\xF3\u017Aniej zacz\u0105\u0142 pe\u0142noprawne studia magisterskie
					</div>
					<div class="${"achievement-item svelte-18y2vm8"}"><span class="${"text-[#FF0080] font-bold text-lg"}">2024</span> \u2013 fina\u0142 Blue Note Competition 2024 z autorskim projektem kompozytorskim Pawel Knorps Group
					</div>
					<div class="${"achievement-item svelte-18y2vm8"}"><span class="${"text-[#FF0080] font-bold text-lg"}">2024</span> - otrzyma\u0142 Stypendium Tw\xF3rcze Miasta Poznania za projekt \u201EJazzowa tkanka miasta \u2013 album inspirowany d\u017Awi\u0119kami Poznania&quot;
					</div></div></div></div></div>
</div>`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ".seamless-flow.svelte-trofbb{background:transparent;position:relative;z-index:10;pointer-events:none}.projects-flow.svelte-trofbb{background:transparent;position:relative;z-index:15;pointer-events:none}canvas.svelte-trofbb{touch-action:none}canvas.svelte-trofbb{touch-action:none}.audio-notice.svelte-trofbb{animation:svelte-trofbb-gentlePulse 2s ease-in-out infinite}@keyframes svelte-trofbb-gentlePulse{0%,100%{opacity:0.9}50%{opacity:1}}@media(max-width: 768px){.projects-container.svelte-trofbb{padding:0 1rem}}@media(min-width: 1280px){.projects-container.svelte-trofbb{padding-right:2rem}}.svelte-trofbb::-moz-selection{background-color:#FF0080;color:white}.svelte-trofbb::selection{background-color:#FF0080;color:white}.svelte-trofbb{border:none;outline:none}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let showBio;
  let projectsHeight;
  let { data } = $$props;
  data.portfolioData;
  let ThreeObject;
  let personalData = {};
  let musicProjects = [];
  let programmingProjects = [];
  let scrollY = 0;
  let innerHeight = 0;
  let innerWidth = 0;
  let adaptiveTextClass = "text-white";
  let adaptiveSubTextClass = "text-gray-300";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  showBio = innerWidth >= 1300;
  projectsHeight = 0;
  return `


${``}

<canvas class="${"fixed top-0 left-0 w-full h-full cursor-grab svelte-trofbb"}" style="${"pointer-events: auto; z-index: 0;"}"${add_attribute("this", ThreeObject, 0)}></canvas>

${validate_component(SocialBubbles, "SocialBubbles").$$render($$result, {}, {}, {})}


<div class="${"seamless-flow svelte-trofbb"}">${validate_component(HeroSection, "HeroSection").$$render(
    $$result,
    {
      personalData,
      adaptiveTextClass,
      adaptiveSubTextClass
    },
    {},
    {}
  )}

	<div class="${"projects-flow relative px-4 sm:px-6 md:px-8 xl:px-16 2xl:px-24 svelte-trofbb"}">
	<div class="${"flex flex-col items-center xl:items-start xl:flex-row gap-16 2xl:gap-24 svelte-trofbb"}">
		<div class="${"projects-container w-full max-w-3xl xl:max-w-none xl:w-1/2 svelte-trofbb"}">${validate_component(ProjectsSection, "ProjectsSection").$$render(
    $$result,
    {
      musicProjects,
      programmingProjects,
      adaptiveTextClass,
      adaptiveSubTextClass
    },
    {},
    {}
  )}</div>

		
		${showBio ? `<div class="${"w-full max-w-3xl xl:max-w-none xl:w-1/2 2xl:w-2/3 mt-12 xl:mt-0 svelte-trofbb"}">${validate_component(BiographicalSection, "BiographicalSection").$$render(
    $$result,
    {
      scrollY,
      innerHeight,
      projectsHeight,
      adaptiveTextClass,
      adaptiveSubTextClass
    },
    {},
    {}
  )}</div>` : ``}</div></div></div>



`;
});
export {
  Page as default
};
