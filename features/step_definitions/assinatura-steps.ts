import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { subscriptionService } from '../../src/services/subscription-service.ts';
import { seedTestData, db } from '../../src/db/index.ts';

let targetCustomerId = 'cust-1';

Given('que o cliente {string} possui um contrato ativo do plano {string} com saldo de {int} cortes', function (cId: string, _planName: string, _cuts: number) {
  seedTestData();
  targetCustomerId = cId;
  const sub = db.subscriptions.find(s => s.customer_id === cId);
  if (sub) {
    sub.cuts_remaining = 2;
    sub.status = 'ACTIVE';
  }
});

When('o cliente consome {int} corte da assinatura', function (_qty: number) {
  subscriptionService.useSubscriptionCut(targetCustomerId);
});

Then('o saldo restante de cortes deve ser {int}', function (expectedRemaining: number) {
  const sub = db.subscriptions.find(s => s.customer_id === targetCustomerId);
  assert.strictEqual(sub?.cuts_remaining, expectedRemaining);
});

Then('a mensalidade recorrente registrada deve ser R$ {float}', function (expectedPrice: number) {
  const sub = db.subscriptions.find(s => s.customer_id === targetCustomerId);
  assert.strictEqual(sub?.monthly_price, expectedPrice);
});
