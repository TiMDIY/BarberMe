import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';
import { clockEngine } from '../../src/engine/clock-engine.ts';
import { CustomerStatus } from '../../src/db/index.ts';

let intervalDays = 20;
let daysElapsed = 0;
let calculatedStatus: CustomerStatus;

Given('que o cliente {string} possui um intervalo médio de {int} dias', function (_clientName: string, interval: number) {
  intervalDays = interval;
});

Given('o tempo decorrido desde o último corte é de {int} dias', function (days: number) {
  daysElapsed = days;
});

When('o relógio de frequência calcula o status do cliente', function () {
  calculatedStatus = clockEngine.calculateStatus(daysElapsed, intervalDays);
});

Then('o status retornado deve ser {string}', function (expectedStatus: string) {
  assert.strictEqual(calculatedStatus, expectedStatus as CustomerStatus);
});
