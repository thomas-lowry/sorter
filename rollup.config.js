import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import svg from 'rollup-plugin-svg';
import typescript from 'rollup-plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';
import htmlBundle from 'rollup-plugin-html-bundle';

const production = !process.env.ROLLUP_WATCH;

export default [{
	input: 'src/ui/ui.js',
	output: {
		format: 'iife',
		name: 'ui',
		file: 'src/ui/build/bundle.js'
	},
	plugins: [
		resolve({
			browser: true,
		}),
		commonjs(),
		svg(),
		postcss({
			plugins: [ cssnano() ]
		}),
		htmlBundle({
            template: 'src/ui/ui.html',
            target: 'public/index.html',
			inline: true
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `dist` d``irectory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
},
{ 
	input: 'src/main/code.ts',
	output: {
		file: 'public/code.js',
		format: 'cjs',
		name: 'code'
	},
	plugins: [
		typescript(),
		commonjs(),
		production && terser()
	]
}];

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}