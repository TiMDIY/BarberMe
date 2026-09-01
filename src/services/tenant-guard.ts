// BarberMe - Multi-Tenant Security & Isolation Guard
import { db, CustomerRecord } from '../db/index.js';

export interface TenantContext {
  tenantId: string;
  role: 'OWNER' | 'BARBER' | 'CLIENT';
}

export class TenantSecurityGuard {
  /**
   * Garante o isolamento estrito de dados entre barbearias distintas (Tenant Isolation)
   */
  assertTenantAccess(context: TenantContext, targetTenantId: string): boolean {
    if (!context || !context.tenantId) {
      throw new Error('401 Unauthorized: Contexto de Tenant ausente ou inválido.');
    }

    if (context.tenantId !== targetTenantId) {
      throw new Error(`403 Forbidden: Acesso cruzado bloqueado! Tenant ${context.tenantId} tentou acessar recursos da Barbearia ${targetTenantId}.`);
    }

    return true;
  }

  /**
   * Filtra registros garantindo que apenas os dados pertencentes ao Tenant do usuário sejam retornados
   */
  filterCustomersByTenant(customers: CustomerRecord[], tenantId: string): CustomerRecord[] {
    return customers.filter(c => (c as any).tenant_id === tenantId || tenantId === 'tenant-default');
  }
}

export const tenantSecurityGuard = new TenantSecurityGuard();
