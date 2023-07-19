import { brotliCompress } from 'zlib';
import { promisify } from 'util';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rbnlffl/rollup-plugin-eslint';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import gzipPlugin from 'rollup-plugin-gzip';
import dts from 'rollup-plugin-dts';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const brotliPromise = promisify(brotliCompress);

const nodeEnv = process.env.NODE_ENV;
const isProd = nodeEnv === 'production';

const commonOutput = {
  compact: true,
  sourcemap: !isProd
};

/**
 * @type {import('rollup').RollupOptions}
 */
export default [{
  input: `${pkg.paths.src}/index.ts`,
  cache: !isProd,
  external: ['react'],
  strictDeprecations: true,
  watch: {
    clearScreen: false,
    exclude: 'node_modules/**'
  },
  output: [{
    ...commonOutput,
    file: pkg.main,
    format: 'cjs'
  }, {
    ...commonOutput,
    file: pkg.module,
    format: 'esm'
  }],
  plugins: [
    eslint({
      filterInclude: `./${pkg.paths.src}/**/*.+(ts|tsx)`
    }),
    nodeResolve({
      extensions: ['.js', '.ts']
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    }),
    typescript({
      compilerOptions: {
        declaration: false,
        noEmit: true,
        sourceMap: !isProd
      }
    }),
    commonjs(),
    isProd && terser({
      mangle: { toplevel: true },
      compress: {
        toplevel: true,
        drop_console: isProd,
        drop_debugger: isProd
      },
      format: {
        comments: /^\*\s@/,
        quote_style: 1
      }
    }),
    isProd && gzipPlugin({
      customCompression: (content) => brotliPromise(Buffer.from(content)),
      fileName: '.br'
    })
  ]
}, {
  input: `${pkg.paths.bin}/index.d.ts`,
  output: {
    file: pkg.types,
    format: 'es'
  },
  plugins: [dts()]
}];
