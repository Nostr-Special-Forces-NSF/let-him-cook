import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			workbox: {
				maximumFileSizeToCacheInBytes: 5 * 1024 ** 2
			},
			manifest: {
				name: process.env.VITE_APP_NAME,
				short_name: process.env.VITE_APP_NAME,
				description: process.env.VITE_APP_DESCRIPTION,
				protocol_handlers: [{ protocol: 'web+nostr', url: '/%s' }],
				permissions: ['clipboardRead', 'clipboardWrite', 'unlimitedStorage'],
				icons: [
					{ src: 'images/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
					{ src: 'images/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'images/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
					{
						src: 'images/maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		}),
		sveltekit()
	]
});
