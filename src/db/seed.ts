import { seedTestData } from './index.js';

export async function main() {
  seedTestData();
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
