import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedTestData } from '../src/db/index.js';
import { PWAClientService } from '../src/services/pwa-client.js';
import { whatsAppAutomation } from '../src/services/whatsapp-automation.js';

describe('Ticket 05: Experiência PWA do Cliente & Confirmação em 1-Toque', () => {
  let pwaService: PWAClientService;

  beforeEach(() => {
    seedTestData();
    pwaService = new PWAClientService();
  });

  it('deve validar o token do WhatsApp e confirmar o agendamento em 1 toque', () => {
    const cust = db.customers.find(c => c.id === 'cust-1')!;
    const dispatchPayload = whatsAppAutomation.createDispatchPayload(cust);

    // Extrair token do URL gerado
    const urlObj = new URL(dispatchPayload.oneTapBookingUrl);
    const token = urlObj.searchParams.get('token')!;
    expect(token).toBeDefined();

    // Confirmar agendamento em 1 toque
    const result = pwaService.confirmOneTapBooking(token, 'Quinta-feira às 17:00');
    expect(result.success).toBe(true);
    expect(result.appointment.customer_id).toBe('cust-1');
    expect(result.appointment.status).toBe('SCHEDULED');
    expect(result.message).toContain('Pedro Henrique');
  });

  it('deve retornar a Ficha Técnica e o status da assinatura no PWA do cliente', () => {
    const profile = pwaService.getCustomerPWAProfile('cust-1');

    expect(profile.customer.name).toBe('Pedro Henrique');
    expect(profile.latestSpec).not.toBeNull();
    expect(profile.latestSpec?.top_guard).toContain('Tesoura');
    expect(profile.subscription).not.toBeNull();
    expect(profile.subscription?.plan_name).toContain('Clube da Barba');
  });
});
