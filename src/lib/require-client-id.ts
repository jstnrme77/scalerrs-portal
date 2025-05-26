// Gives TS/ESM code an easy import path
// (../../../ →  up to repo root, then into netlify/functions)
const requireClientId = require('../../../netlify/functions/utils/require-client-id');
export default requireClientId as (c: any, s?: 'query' | 'search') => string; 