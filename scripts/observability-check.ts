// BarberMe - Observability Verification & Contract Check Script
import { Server } from 'http';

process.env.NO_AUTO_SERVER = 'true';

async function runObservabilityCheck() {
  console.log('📡 Iniciando Validação de Observabilidade Enterprise (/api/health & /api/metrics)...');

  const { server } = await import('../src/server.js');

  let testServer: Server | undefined;
  let baseUrl = '';

  await new Promise<void>((resolve) => {
    testServer = server.listen(0, () => {
      const addr = testServer?.address();
      if (addr && typeof addr !== 'string') {
        baseUrl = `http://localhost:${addr.port}`;
      }
      resolve();
    });
  });

  try {
    // 1. Testar /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json() as any;

    if (healthRes.status !== 200 || healthJson.status !== 'UP') {
      throw new Error(`Falha no Health Check: status HTTP ${healthRes.status}`);
    }
    console.log(`  ✓ GET /api/health respondeu HTTP 200 (Status: ${healthJson.status}, Uptime: ${healthJson.uptimeSeconds}s)`);

    // 2. Testar /api/metrics (Prometheus Format)
    const metricsRes = await fetch(`${baseUrl}/api/metrics`);
    const metricsText = await metricsRes.text();

    if (metricsRes.status !== 200 || !metricsText.includes('barberme_http_requests_total') || !metricsText.includes('barberme_mrr_total_brl')) {
      throw new Error(`Falha no Formato de Métricas Prometheus: status HTTP ${metricsRes.status}`);
    }
    console.log('  ✓ GET /api/metrics respondeu HTTP 200 em formato Prometheus válido:');
    console.log(metricsText.split('\n').filter(line => !line.startsWith('#') && line.trim()).slice(0, 5).join('\n'));

    console.log('✅ Validação de Observabilidade Enterprise APROVADA!');
  } finally {
    if (testServer) {
      testServer.close();
    }
  }
}

runObservabilityCheck().catch((err) => {
  console.error('❌ Erro na validação de observabilidade:', err);
  process.exit(1);
});
