const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['app/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  outdir: 'dist',
  minify: true,
  sourcemap: true,
  format: 'cjs',
  external: ['*.test.ts', '*.spec.ts', '*.test.js', '*.spec.js']
})
.then(() => console.log('Aplicação construída com sucesso!'))
.catch((error) => {
  console.error(error);
  process.exit(1);
});