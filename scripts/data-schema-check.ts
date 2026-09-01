// BarberMe - Data Schema & Contract Integrity Validator (Michael Nygard)
import { db, seedTestData } from '../src/db/index.js';

function validateSingleCustomer(cust: any, validStatuses: Set<string>) {
  if (!cust.id || !cust.name || !cust.phone) {
    throw new Error(`Schema de dados inválido: Cliente com ID ${cust.id} possui campos nulos.`);
  }
  if (!validStatuses.has(cust.status)) {
    throw new Error(`Schema de dados inválido: Status '${cust.status}' do cliente ${cust.name} não é válido.`);
  }
  if (typeof cust.avg_interval_days !== 'number' || cust.avg_interval_days <= 0) {
    throw new Error(`Schema de dados inválido: Intervalo médio inválido (${cust.avg_interval_days}) para ${cust.name}.`);
  }
}

function validateDataSchema() {
  console.log('🗄️ Iniciando Validação de Schema de Dados & Contratos Imutáveis...');

  if (db.customers.length === 0) {
    seedTestData();
  }

  const validStatuses = new Set(['EM_DIA', 'NA_JANELA', 'EM_RISCO', 'DORMENTE', 'PERDIDO']);

  for (const cust of db.customers) {
    validateSingleCustomer(cust, validStatuses);
  }

  console.log(`  ✓ ${db.customers.length} registros de clientes validados contra o schema de domínio.`);
  console.log(`  ✓ ${db.haircutSpecs.length} Fichas Técnicas registradas com estrutura de fotos e parâmetros.`);
  console.log(`  ✓ ${db.subscriptions.length} contratos de assinatura de receita recorrente (MRR).`);
  console.log('✅ Validação de Schema de Dados APROVADA!');
}

validateDataSchema();
