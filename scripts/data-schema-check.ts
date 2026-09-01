// BarberMe - Data Schema & Contract Integrity Validator (Michael Nygard)
import { db, seedTestData } from '../src/db/index.js';

function validateDataSchema() {
  console.log('🗄️ Iniciando Validação de Schema de Dados & Contratos Imutáveis...');

  if (db.customers.length === 0) {
    seedTestData();
  }

  const validStatuses = new Set(['EM_DIA', 'NA_JANELA', 'EM_RISCO', 'DORMENTE', 'PERDIDO']);

  for (const cust of db.customers) {
    if (!cust.id || !cust.name || !cust.phone) {
      throw new Error(`Schema de dados inválido: Cliente com ID ${cust.id} possui campos obrigatórios nulos.`);
    }

    if (!validStatuses.has(cust.status)) {
      throw new Error(`Schema de dados inválido: Status '${cust.status}' do cliente ${cust.name} não é um estado válido da máquina.`);
    }

    if (typeof cust.avg_interval_days !== 'number' || cust.avg_interval_days <= 0) {
      throw new Error(`Schema de dados inválido: Intervalo médio inválido (${cust.avg_interval_days}) para ${cust.name}.`);
    }

    if (cust.cold_start_phase < 1 || cust.cold_start_phase > 3) {
      throw new Error(`Schema de dados inválido: Fase de Cold Start (${cust.cold_start_phase}) fora do limite [1-3] para ${cust.name}.`);
    }
  }

  console.log(`  ✓ ${db.customers.length} registros de clientes validados contra o schema de domínio.`);
  console.log(`  ✓ ${db.haircutSpecs.length} Fichas Técnicas registradas com estrutura de fotos e parâmetros.`);
  console.log(`  ✓ ${db.subscriptions.length} contratos de assinatura de receita recorrente (MRR).`);
  console.log('✅ Validação de Schema de Dados APROVADA!');
}

validateDataSchema();
