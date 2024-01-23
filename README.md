# tmt-format

[![License](https://img.shields.io/badge/license-BSD3-green)](https://github.com/scalenc/tmt-format)
[![NPM version](https://img.shields.io/npm/v/@scalenc/tmt-format)](https://www.npmjs.com/package/@scalenc/tmt-format)

This is a typescript library to read the TRUMPF TMT file format.

It comes with a plain class model of the TMT file and a persistency layer to read and write this model from a string.

## Installation

```sh
npm install @scalenc/tmt-format
yarn add @scalenc/tmt-format
pnpm add @scalenc/tmt-format
```

## Examples

Sample usage to read TRUMPF TMT file

```typescript
import fs from 'fs';
import { Reader, Writer } from '@scalenc/tmt-format';

// Read TMT example
const tmt = fs.readFileSync('input.tmt', 'latin1');
const reader = new Reader(tmt, []).read();

const { header, domains } = reader;
if (!header || !domains) throw new Error('Expected header and domains');

// Write TMT example
const written = Writer.write(header, domains);
fs.writeFileSync('output.tmt', written, { encoding: 'latin1' });
```

## Development

Run `yarn` to setup project and install all dependencies.

Run `yarn test` to run all tests.

Run `yarn lint` to check for linting issues.

Run `yarn build` to build.

## License

All rights reserved to ScaleNC GmbH.

Source Code and Binaries licensed under BSD-3-Clause.
