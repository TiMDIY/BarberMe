import { describe, it, expect, beforeEach } from 'vitest';
import { seedTestData } from '../src/db/index.js';
import { WhatsAppAutomationService } from '../src/services/whatsapp-automation.js';

describe('Ticket 04: Motor de Automações & Disparos no WhatsApp (WhatsApp-First)', () => {
  let automationService: WhatsAppAutomationService;

  beforeEach(() => {
    seedTestData();
    automationService = new WhatsAppAutomationService();
  });

  it('deve varrer o banco de dados e gerar disparos para clientes NA_JANELA e EM_RISCO', () => {
    const dispatches = automationService.scanAndDispatch();
    
    // Pedro Henrique (NA_JANELA) e Lucas Mendes (EM_RISCO) devem ser capturados
    expect(dispatches.length).toBeGreaterThanOrEqual(2);

    const pedroMsg = dispatches.find(d => d.customerName === 'Pedro Henrique');
    expect(pedroMsg).toBeDefined();
    expect(pedroMsg?.status).toBe('NA_JANELA');
    expect(pedroMsg?.messageText).toContain('Notamos que faz 21 dias');
    expect(pedroMsg?.oneTapBookingUrl).toContain('https://barberme.app/confirm');

    const lucasMsg = dispatches.find(d => d.customerName === 'Lucas Mendes');
    expect(lucasMsg).toBeDefined();
    expect(lucasMsg?.status).toBe('EM_RISCO');
    expect(lucasMsg?.messageText).toContain('Já faz 31 dias');
  });

  it('deve respeitar a trava anti-spam (não enviar mensagem duplicada dentro da janela mínima)', () => {
    // 1º disparo
    const firstRun = automationService.scanAndDispatch(3);
    expect(firstRun.length).toBeGreaterThanOrEqual(2);

    // 2º disparo imediato -> Deve ser ignorado pela trava de deduplicação
    const secondRun = automationService.scanAndDispatch(3);
    expect(secondRun.length).toBe(0);
  });
});
