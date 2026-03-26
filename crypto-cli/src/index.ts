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
  .option('-t, --time <time>', 'Time for comparison (e.g. 20:00+02:00, 18:00Z, 14:30)')
  .option('--currency <code>', 'Fiat currency code (default: usd)', 'usd')
  .action(async (symbol: string | undefined, options: { compare?: string; time?: string; currency: string }) => {
    if (!symbol) {
      await interactiveMode();
    } else {
      options.currency = options.currency.toLowerCase();
      await priceCommand(symbol, options);
    }
  });

async function main() {
  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
