#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(cmd, silent = false) {
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return output;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${cmd}`);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Trackly Release Script\n');

  // Verifica mudanças não commitadas
  const status = exec('git status -s', true).trim();
  if (status) {
    console.error('❌ Há mudanças não commitadas. Commit ou stash antes de publicar.');
    process.exit(1);
  }

  // Pega versão atual
  const sdkPkg = JSON.parse(fs.readFileSync('./packages/sdk/package.json', 'utf8'));
  const currentVersion = sdkPkg.version;
  console.log(`📦 Versão atual: ${currentVersion}\n`);

  // Pergunta tipo de bump
  console.log('Qual tipo de versão?');
  console.log('  1) patch (0.2.6 → 0.2.7)');
  console.log('  2) minor (0.2.6 → 0.3.0)');
  console.log('  3) major (0.2.6 → 1.0.0)');
  console.log('  4) custom');
  
  const bumpType = await question('Escolha [1-4]: ');
  
  let newVersion;
  const parts = currentVersion.split('.').map(Number);

  switch (bumpType.trim()) {
    case '1':
      parts[2]++;
      newVersion = parts.join('.');
      break;
    case '2':
      parts[1]++;
      parts[2] = 0;
      newVersion = parts.join('.');
      break;
    case '3':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      newVersion = parts.join('.');
      break;
    case '4':
      newVersion = await question('Digite a nova versão: ');
      newVersion = newVersion.trim();
      break;
    default:
      console.error('❌ Opção inválida');
      process.exit(1);
  }

  console.log(`\n📝 Nova versão: ${newVersion}`);
  const confirm = await question('Confirma? [y/N]: ');

  if (confirm.trim().toLowerCase() !== 'y') {
    console.log('Cancelado.');
    rl.close();
    process.exit(0);
  }

  // Atualiza package.json files
  console.log('\n📝 Atualizando package.json...');
  
  const reactPkg = JSON.parse(fs.readFileSync('./packages/react/package.json', 'utf8'));
  sdkPkg.version = newVersion;
  reactPkg.version = newVersion;
  
  fs.writeFileSync('./packages/sdk/package.json', JSON.stringify(sdkPkg, null, 2) + '\n');
  fs.writeFileSync('./packages/react/package.json', JSON.stringify(reactPkg, null, 2) + '\n');
  console.log('✅ Versões atualizadas');

  // Build
  console.log('\n🔨 Building packages...');
  exec('pnpm build');

  // Git commit e tag
  console.log('\n📦 Commitando e criando tag...');
  exec('git add packages/*/package.json');
  exec(`git commit -m "chore: bump version to ${newVersion}"`);
  exec(`git tag v${newVersion}`);

  // Push
  console.log('\n🚢 Pushing para GitHub...');
  exec('git push');
  exec(`git push origin v${newVersion}`);

  console.log(`\n✅ Versão ${newVersion} publicada!`);
  console.log('🔗 Acompanhe em: https://github.com/Kaycfarias/trackly/actions');

  rl.close();
}

main().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
