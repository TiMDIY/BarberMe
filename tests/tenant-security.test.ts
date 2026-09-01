import { describe, it, expect } from 'vitest';
import { tenantSecurityGuard } from '../src/services/tenant-guard.js';

describe('Estágio 5: Security & Multi-Tenant Data Isolation Guard', () => {
  it('deve permitir acesso para requisições no mesmo Tenant', () => {
    const context = { tenantId: 'barbearia-alpha', role: 'OWNER' as const };
    const isAllowed = tenantSecurityGuard.assertTenantAccess(context, 'barbearia-alpha');
    expect(isAllowed).toBe(true);
  });

  it('deve BLOQUEAR com HTTP 403 requisições cruzadas entre Tenants diferentes', () => {
    const context = { tenantId: 'barbearia-alpha', role: 'OWNER' as const };
    
    expect(() => {
      tenantSecurityGuard.assertTenantAccess(context, 'barbearia-beta');
    }).toThrow('403 Forbidden: Acesso cruzado bloqueado');
  });

  it('deve rejeitar contexto ausente com HTTP 401 Unauthorized', () => {
    expect(() => {
      tenantSecurityGuard.assertTenantAccess({ tenantId: '', role: 'CLIENT' as const }, 'barbearia-alpha');
    }).toThrow('401 Unauthorized');
  });
});
