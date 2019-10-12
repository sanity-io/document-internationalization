const pkg = require('./package.json');
const path = require('path');
const babel = require('rollup-plugin-babel');
const cleaner = require('rollup-plugin-cleaner');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const external = require('rollup-plugin-peer-deps-external');
const { ifProd } = require('./utils/env');

module.exports = {
  input: './src/index.ts',
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourceMap: true
    },
    {
      file: pkg.module,
      format: "es",
      sourceMap: true
    }
  ],
  plugins: [
    external(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    babel({
      exclude: '**/node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      runtimeHelpers: true,
    }),
    commonjs(),
    ifProd(cleaner({
      targets: [
        path.join(process.cwd(), 'lib')
      ],
    }))
  ].filter(Boolean)
};
