const path = require('path');
const baseConfig = require('../../rollup.base');

module.exports = Object.assign({}, baseConfig, {
    input: path.resolve(__dirname, 'index.tsx'),
    output: [
        {
            file: path.resolve(__dirname, '../../lib/input/index.js'),
            format: 'cjs',
            sourceMap: true
        }
    ],
});