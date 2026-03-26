import { Command } from 'commander';
import { priceCommand } from './commands/price.js';

const program = new Command();

program
  .name('crypto-price')
  .description('Check crypto prices and compare with historical data')
  .version('1.0.0');

program
  .argument('<symbol>', 'Coin symbol (e.g. btc, eth, sol)')
  .option(
    '-c, --compare <date>',
    'Compare with price on YYYY-MM-DD at current time',
  )
  .option('--currency <code>', 'Fiat currency code (default: usd)', 'usd')
  .action(priceCommand);

program.parse();
