const propIf = (cond, a, b) => (cond ? a : b);

const ifDev = propIf.bind(null, process.env.NODE_ENV === 'development');
const ifProd = propIf.bind(null, process.env.NODE_ENV === 'production');
const ifTest = propIf.bind(null, process.env.NODE_ENV === 'testing');

module.exports = { ifProd, ifDev, ifTest };
