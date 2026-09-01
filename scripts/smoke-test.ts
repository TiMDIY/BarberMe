// BarberMe - Production Smoke Test Script (Gene Kim & Jez Humble)
process.env.NO_AUTO_SERVER = 'true';

import type { Server } from 'http';

async function runSmokeTest() {
  console.log('🔥 Iniciando Teste de Fumaça de Produção (Smoke Test)...');

  // Importar dinamicamente para garantir que NO_AUTO_SERVER esteja definido antes da avaliação do módulo
  const { server } = await import('../src/server.js');

  let testServer: Server;
  let baseUrl: string;

  await new Promise<void>((resolve) => {
    testServer = server.listen(0, () => {
      const addr = testServer.address() as { port: number };
      baseUrl = `http://localhost:${addr.port}`;
      console.log(`🌐 Servidor de Smoke Test rodando temporariamente em ${baseUrl}`);
      resolve();
    });
  });

  try {
    // 1. Validar endpoint de Clientes & Relógios
    const custRes = await fetch(`${baseUrl}/api/engine/customers`);
    if (custRes.status !== 200) throw new Error(`Smoke Test falhou no endpoint /api/engine/customers: HTTP ${custRes.status}`);
    const custData = await custRes.json();
    if (!Array.isArray(custData.customers) || custData.customers.length === 0) {
      throw new Error('Smoke Test falhou: Nenhum cliente retornado no banco de dados.');
    }
    console.log(`  ✓ GET /api/engine/customers -> HTTP 200 (${custData.customers.length} clientes)`);

    // 2. Validar Dashboard de Analytics Executivo
    const adminRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    if (adminRes.status !== 200) throw new Error(`Smoke Test falhou no endpoint /api/admin/dashboard: HTTP ${adminRes.status}`);
    const adminData = await adminRes.json();
    if (adminData.metrics.mrrTotal === undefined) {
      throw new Error('Smoke Test falhou: Métricas de MRR inválidas no dashboard.');
    }
    console.log(`  ✓ GET /api/admin/dashboard -> HTTP 200 (MRR R$ ${adminData.metrics.mrrTotal})`);

    // 3. Validar arquivos estáticos do PWA Frontend
    const htmlRes = await fetch(`${baseUrl}/index.html`);
    if (htmlRes.status !== 200) throw new Error(`Smoke Test falhou ao carregar index.html: HTTP ${htmlRes.status}`);
    console.log('  ✓ GET /index.html -> HTTP 200');

    console.log('✅ Smoke Test de Produção CONCLUÍDO COM SUCESSO!');
  } catch (err: any) {
    console.error(`❌ ERRO NO SMOKE TEST: ${err.message}`);
    process.exit(1);
  } finally {
    testServer!.close();
  }
}

runSmokeTest();
