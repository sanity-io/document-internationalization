const fs = require('fs');
const path = require('path');
const babel = require('rollup-plugin-babel');
const cleaner = require('rollup-plugin-cleaner');
const external = require('rollup-plugin-peer-deps-external');
const postcss = require('rollup-plugin-postcss');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const { ifProd } = require('./utils/env');

const srcPath = (...p) => path.resolve.apply(undefined, [__dirname, 'src', ...p].filter(Boolean));
const libPath = (...p) => path.resolve.apply(undefined, [__dirname, 'lib', ...p].filter(Boolean));

module.exports = (name) => {
  const indexFile = fs.readdirSync(srcPath(name)).find(f => f.startsWith('index.'));
  return {
    input: srcPath(name, indexFile),
    output: [{
      dir: libPath(name),
      format: 'cjs',
      sourceMap: true
    }],
    plugins: [
      external(),
      postcss({
        modules: {
          camelCase: true,
          generateScopedName: '[hash:base64]',
        },
        minimize: false,
        extensions: ['.css', '.scss']
      }),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      babel({
        exclude: '**/node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        runtimeHelpers: true,
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      ifProd(cleaner({
        targets: [
          libPath(name)
        ],
      }))
    ].filter(Boolean),
    external: [
      'config:sanity',
      'part:@sanity/base/client',
      'part:@sanity/base/document-badges',
      'part:@sanity/base/schema',
      'part:@sanity/base/datastore/document',
      'part:@sanity/base/document-actions',
      '@sanity/desk-tool/lib/pane/PaneItem',
      '@sanity/desk-tool/structure-builder',
      '@sanity/state-router/lib/components/IntentLink',
      '@sanity/desk-tool/lib/components/ConfirmDelete'
    ]
  };
};
