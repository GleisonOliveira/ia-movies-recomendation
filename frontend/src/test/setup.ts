import '@testing-library/jest-dom';

// Alguns bundles de dependências (ex: tanstack router) assumem existência de TextEncoder/TextDecoder.
// JSDOM + Node em certos cenários não expõem isso globalmente.
declare const require: (moduleName: 'util') => {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
};

if (!globalThis.TextEncoder || !globalThis.TextDecoder) {
  const util = require('util') as unknown as {
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
  };
  if (!globalThis.TextEncoder) globalThis.TextEncoder = util.TextEncoder;
  if (!globalThis.TextDecoder) globalThis.TextDecoder = util.TextDecoder;
}
