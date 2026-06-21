const { readFileSync } = require('fs');
const esbuild = require('rollup-plugin-esbuild').default;
const typescript = require('@rollup/plugin-typescript');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// Single public entry point. Each gets a CJS (.js) and ESM (.mjs) bundle plus a
// matching `.d.ts`, mirroring the `exports` map in package.json.
const entries = ['index'];

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];

const codePlugins = () => [
  json({ compact: true, preferConst: true }),
  resolve({ preferBuiltins: true, extensions: ['.ts', '.js'] }),
  commonjs(),
  esbuild({
    target: 'es2022',
    tsconfig: './tsconfig.json',
    sourceMap: true,
  }),
];

// Single declaration pass for the whole src tree.
const declarationConfig = {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
  external,
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      emitDeclarationOnly: true,
      rootDir: './src',
      exclude: ['**/*.test.ts', '**/*.spec.ts', '__tests__/**/*'],
      compilerOptions: {
        module: 'esnext',
      },
    }),
  ],
};

const bundles = entries.flatMap((name) => [
  {
    input: `src/${name}.ts`,
    output: {
      file: `dist/${name}.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: codePlugins(),
  },
  {
    input: `src/${name}.ts`,
    output: {
      file: `dist/${name}.mjs`,
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: codePlugins(),
  },
]);

module.exports = [...bundles, declarationConfig];
