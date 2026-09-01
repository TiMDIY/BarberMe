import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { barberCheckoutService, CheckoutResult } from '../../src/services/barber-checkout.ts';
import { seedTestData, db } from '../../src/db/index.ts';

let customerId = 'cust-1';
let barberId = 'barber-rafael';
let price = 70;
let sideLength = '2 nas laterais';
let topStyle = 'no topo';
let checkoutResult: CheckoutResult;

Given('que o cliente {string} realizou um corte de R$ {float} com o barbeiro {string}', function (cId: string, cost: number, bId: string) {
  seedTestData();
  customerId = cId;
  barberId = bId;
  price = cost;
});

Given('a Ficha Técnica especifica altura de pente {string} e tesoura {string}', function (sides: string, top: string) {
  sideLength = sides;
  topStyle = top;
});

When('o barbeiro finaliza o checkout de balcão', function () {
  checkoutResult = barberCheckoutService.processCheckout({
    customerId,
    barberId,
    price,
    sidesGuard: sideLength,
    topGuard: topStyle,
    finishGuard: 'Navalha',
    productsUsed: ['Pomada Matte'],
    photoBeforeUrl: 'assets/img/corte_1.jpg',
    photoAfterUrl: 'assets/img/corte_2.jpg'
  });
});

Then('o valor total cobrado deve ser R$ {float}', function (expectedPrice: number) {
  assert.strictEqual(checkoutResult.appointment.price, expectedPrice);
});

Then('a comissão do barbeiro calculada deve ser R$ {float}', function (expectedCommission: number) {
  assert.strictEqual(checkoutResult.barberEarned, expectedCommission);
});

Then('o relógio do cliente deve ser zerado para {int} dias', function (expectedDays: number) {
  const customer = db.customers.find(c => c.id === customerId);
  assert.strictEqual(customer?.days_passed, expectedDays);
});
