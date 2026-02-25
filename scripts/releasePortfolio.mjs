import { execSync } from 'node:child_process';

function run(command) {
  console.log(`\n▶ ${command}`);
  execSync(command, { stdio: 'inherit' });
}

function shouldSync() {
  return process.argv.includes('--sync') || process.env.PIPELINE_SYNC === '1';
}

function main() {
  run('npm run pipeline:validate');

  if (shouldSync()) {
    run('npm run pipeline:export');
    run('npm run pipeline:validate');
  } else {
    console.log('ℹ️ Skipping export (pass --sync or set PIPELINE_SYNC=1 to sync from Sanity)');
  }

  run('npm run build');
  console.log('\n✅ Portfolio release pipeline complete');
}

main();
