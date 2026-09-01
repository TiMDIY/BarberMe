import { describe, it, expect, beforeEach } from 'vitest';
import { seedTestData } from '../src/db/index.js';
import { BarberCheckoutService } from '../src/services/barber-checkout.js';

describe('Ticket 03: Ficha Técnica do Corte & Fluxo de Balcão do Barbeiro', () => {
  let checkoutService: BarberCheckoutService;

  beforeEach(() => {
    seedTestData();
    checkoutService = new BarberCheckoutService();
  });

  it('deve processar o checkout em 20s, salvar a Ficha Técnica e creditar a comissão do barbeiro', () => {
    // Pedro Henrique (cust-1) estava com 21 dias (NA_JANELA)
    const result = checkoutService.processCheckout({
      customerId: 'cust-1',
      barberId: 'barber-rafael',
      price: 70.0,
      serviceCategory: 'corte',
      observedIntervalDays: 21,
      topGuard: 'Tesoura (3cm - Pompadour)',
      sidesGuard: 'Pente 1.5 (Mid Fade)',
      finishGuard: 'Navalha com gel',
      productsUsed: ['Pomada Matte BarberMe', 'Balm Alinhador'],
      notes: 'Redemoinho acentuado na coroa.'
    });

    // 1. Comissão do barbeiro (50% de R$ 70 = R$ 35)
    expect(result.barberEarned).toBe(35.0);
    expect(result.appointment.price).toBe(70.0);
    expect(result.appointment.status).toBe('COMPLETED');

    // 2. Ficha Técnica salva
    expect(result.haircutSpec.top_guard).toBe('Tesoura (3cm - Pompadour)');
    expect(result.haircutSpec.sides_guard).toBe('Pente 1.5 (Mid Fade)');
    expect(JSON.parse(result.haircutSpec.products_used)).toContain('Pomada Matte BarberMe');

    // 3. Relógio do Cliente zerado e estado atualizado para EM_DIA
    expect(result.customer.days_passed).toBe(0);
    expect(result.customer.status).toBe('EM_DIA');
  });

  it('deve permitir recuperar todas as Fichas Técnicas anteriores do cliente', () => {
    const specsBefore = checkoutService.getCustomerSpecs('cust-1');
    const initialCount = specsBefore.length;

    checkoutService.processCheckout({
      customerId: 'cust-1',
      barberId: 'barber-rafael',
      price: 70.0,
      topGuard: 'Pente 4',
      sidesGuard: 'Pente 2 Fade',
      finishGuard: 'Máquina',
      productsUsed: ['Óleo de Barba']
    });

    const specsAfter = checkoutService.getCustomerSpecs('cust-1');
    expect(specsAfter.length).toBe(initialCount + 1);
  });
});
