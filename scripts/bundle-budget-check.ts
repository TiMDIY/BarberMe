// BarberMe - Performance & Bundle Size Budget Gate (Addy Osmani)
import fs from 'fs';
import path from 'path';

const MAX_TOTAL_SIZE_KB = 250; // Orçamento máximo: 250 KB total para carregamento instantâneo PWA

const targetFiles = [
  'index.html',
  'styles.css',
  'app.js'
];

function checkBundleBudget() {
  console.log(`⚡ Iniciando Verificação de Orçamento de Performance Web (Limite: ${MAX_TOTAL_SIZE_KB} KB)...`);
  
  let totalBytes = 0;

  for (const file of targetFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo ${file} não encontrado.`);
      process.exit(1);
    }

    const stats = fs.statSync(filePath);
    const sizeKb = Number((stats.size / 1024).toFixed(2));
    totalBytes += stats.size;
    console.log(`  📄 ${file}: ${sizeKb} KB`);
  }

  const totalKb = Number((totalBytes / 1024).toFixed(2));
  console.log(`📊 Tamanho Total do Bundle Frontend PWA: ${totalKb} KB / ${MAX_TOTAL_SIZE_KB} KB`);

  if (totalKb > MAX_TOTAL_SIZE_KB) {
    console.error(`❌ ERRO: Tamanho total do frontend (${totalKb} KB) excedeu o limite máximo (${MAX_TOTAL_SIZE_KB} KB)!`);
    process.exit(1);
  }

  console.log('✅ Orçamento de Performance APROVADO! App ultra-leve para conexões móveis.');
}

checkBundleBudget();
