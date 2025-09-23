export const manifest = {
	appDir: "_app",
	assets: new Set(["52ad366d-45d5-4274-8288-3b9e0c8ccb46.webp","Photo May 14.webp","my-photo.webp","my-photo2.webp","pawel knorps group.webp","photo10.webp","photo11.webp","photo12.webp","photo3.webp","photo4.webp","photo5.webp","photo6.webp","photo7.webp","photo8.webp","photo9.webp","portfolio.json","portfolio.json.zip"]),
	mimeTypes: {".webp":"image/webp",".json":"application/json",".zip":"application/zip"},
	_: {
		entry: {"file":"_app/immutable/start-60fe39ac.js","imports":["_app/immutable/start-60fe39ac.js","_app/immutable/chunks/index-323c7c6c.js","_app/immutable/chunks/singletons-7f9d8d67.js","_app/immutable/chunks/paths-6cd3a76e.js"],"stylesheets":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js')
		],
		routes: [
			{
				id: "",
				pattern: /^\/$/,
				names: [],
				types: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
