import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import { UserConfig, defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	let res: UserConfig = {
		plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
		build: {
			outDir: 'build',
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						if (id.includes('node_modules')) {
							if (id.includes('i18n')) {
								return 'vendor_i18n';
							} else if (id.includes('maplibre')) {
								return 'vendor_maplibre';
							} else if (id.includes('mdi-material-ui')) {
								return 'vendor_mdi-material-ui';
							} else if (id.includes('dayjs')) {
								return 'vendor_dayjs';
							}

							return 'vendor'; // all other package goes here
						}
					},
				},
			},
		},
	};
	if (command === 'serve') {
		res.server = {
			https: {
				key: fs.readFileSync('/home/nathanael/carbonBee/ssl/nathanael.local.key'),
				cert: fs.readFileSync('/home/nathanael/carbonBee/ssl/nathanael.local.crt'),
			},
		};
	}
	return res;
});
