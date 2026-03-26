import { Command } from 'commander';
import { priceCommand } from './commands/price.js';
import { interactiveMode } from './commands/interactive.js';

const program = new Command();

program
  .name('crypto-price')
  .description('Check crypto prices and compare with historical data')
  .version('1.0.0');

program
  .argument('[symbol]', 'Coin symbol (e.g. btc, eth, sol)')
  .option(
    '-c, --compare <date>',
    'Compare with price on YYYY-MM-DD at current time',
  )
  .option('--currency <code>', 'Fiat currency code (default: usd)', 'usd')
  .action(async (symbol: string | undefined, options: { compare?: string; currency: string }) => {
    if (!symbol) {
      await interactiveMode();
    } else {
      await priceCommand(symbol, options);
    }
  });

program.parse();
