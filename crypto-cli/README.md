# crypto-price-cli

A terminal tool to check cryptocurrency prices and compare them with historical prices on any past date.

## Installation

### From npm (after publishing)

```bash
npm install -g crypto-price-cli
```

### From source

```bash
git clone https://github.com/denysfedorov/denysfedorov.git
cd denysfedorov/crypto-cli
npm install
npm run build
npm link
```

After either method, `crypto-price` is available globally in your terminal.

## Quick Start

```bash
# Interactive mode — just launch and follow the prompts
crypto-price

# Check current BTC price
crypto-price btc

# Compare ETH price with a past date (uses current time of day)
crypto-price eth --compare 2026-03-25

# Compare with a specific time and timezone
crypto-price eth --compare 2026-03-25 --time 20:00+02:00

# Use a different fiat currency
crypto-price sol --compare 2025-01-15 --currency eur
```

## Usage

```
Usage: crypto-price [options] [symbol]

Check crypto prices and compare with historical data

Arguments:
  symbol                     Coin symbol (e.g. btc, eth, sol)

Options:
  -V, --version              output the version number
  -c, --compare <date>       Compare with price on YYYY-MM-DD
  -t, --time <time>          Time for comparison (e.g. 20:00+02:00, 18:00Z, 14:30)
  --currency <code>          Fiat currency code (default: usd)
  -h, --help                 display help for command
```

### Running without arguments — Interactive Mode

When you run `crypto-price` with no arguments, you enter an interactive session:

```
$ crypto-price

  Crypto Price Checker

? Select a cryptocurrency: (Use arrow keys)
❯ BTC (Bitcoin)
  ETH (Ethereum)
  SOL (Solana)
  BNB (BNB)
  XRP (XRP)
  ADA (Cardano)
  DOGE (Dogecoin)
  DOT (Polkadot)
  AVAX (Avalanche)
  LINK (Chainlink)
  Other (type manually)

? Select currency:
❯ USD ($)
  EUR (€)
  GBP (£)
  JPY (¥)
  CAD (C$)
  AUD (A$)

? Compare with a historical date? Yes
? Enter date (YYYY-MM-DD): 2026-03-20

┌───────────────────────────────────────────────┐
│  ETH (Ethereum)                               │
├───────────────────────────────────────────────┤
│  Current price:    $2,045.32                  │
│  Price on 2026-03-20:  $1,987.65              │
│  Difference:       +$57.67 (+2.90%) ▲         │
│  Compare time:     Mar 20, 2026 at 14:32 UTC  │
└───────────────────────────────────────────────┘

? Check another coin? (Y/n)
```

### Current price only

```
$ crypto-price btc

BTC (Bitcoin): $67,432.18
```

### Price comparison

```
$ crypto-price eth --compare 2026-03-25

┌───────────────────────────────────────────────┐
│  ETH (Ethereum)                               │
├───────────────────────────────────────────────┤
│  Current price:    $2,085.50                  │
│  Price on 2026-03-25:  $2,012.30              │
│  Difference:       +$73.20 (+3.64%) ▲         │
│  Compare time:     Mar 25, 2026 at 21:40 UTC  │
└───────────────────────────────────────────────┘
```

### Price comparison with specific time and timezone

```
$ crypto-price eth --compare 2026-03-25 --time 20:00+02:00

┌───────────────────────────────────────────────┐
│  ETH (Ethereum)                               │
├───────────────────────────────────────────────┤
│  Current price:    $2,085.50                  │
│  Price on 2026-03-25:  $2,008.75              │
│  Difference:       +$76.75 (+3.82%) ▲         │
│  Compare time:     Mar 25, 2026 at 18:00 UTC  │
└───────────────────────────────────────────────┘
```

The `--time` option accepts these formats:

| Format           | Meaning                        | Example           |
|------------------|--------------------------------|-------------------|
| `HH:MM`          | Time in UTC                    | `14:30`           |
| `HH:MMZ`         | Explicit UTC                   | `14:30Z`          |
| `HH:MM+OO:OO`   | Time with positive UTC offset  | `20:00+02:00`     |
| `HH:MM-OO:OO`   | Time with negative UTC offset  | `10:00-05:00`     |

### Different currency

```
$ crypto-price sol --compare 2025-01-15 --currency eur

┌──────────────────────────────────────────────┐
│  SOL (Solana)                                │
├──────────────────────────────────────────────┤
│  Current price:    €142.50                   │
│  Price on 2025-01-15:  €98.30                │
│  Difference:       +€44.20 (+44.96%) ▲       │
│  Compare time:     Jan 15, 2025 at 18:00 UTC │
└──────────────────────────────────────────────┘
```

## Supported Cryptocurrencies

The tool supports 38 popular coins out of the box:

| Symbol | Name              | Symbol | Name              |
|--------|-------------------|--------|-------------------|
| btc    | Bitcoin           | ltc    | Litecoin          |
| eth    | Ethereum          | etc    | Ethereum Classic  |
| sol    | Solana            | xlm    | Stellar           |
| bnb    | BNB               | algo   | Algorand          |
| xrp    | XRP               | near   | NEAR Protocol     |
| ada    | Cardano           | ftm    | Fantom            |
| doge   | Dogecoin          | icp    | Internet Computer |
| dot    | Polkadot          | fil    | Filecoin          |
| avax   | Avalanche         | hbar   | Hedera            |
| matic  | Polygon           | vet    | VeChain           |
| link   | Chainlink         | sand   | The Sandbox       |
| uni    | Uniswap           | mana   | Decentraland      |
| atom   | Cosmos            | axs    | Axie Infinity     |
| aave   | Aave              | arb    | Arbitrum          |
| mkr    | Maker             | op     | Optimism          |
| crv    | Curve DAO         | apt    | Aptos             |
| ldo    | Lido DAO          | sui    | Sui               |
| ton    | Toncoin           | sei    | Sei               |
| trx    | TRON              | shib   | Shiba Inu         |
| pepe   | Pepe              |        |                   |

Mistyped a symbol? The tool will suggest the closest match:

```
$ crypto-price btcc
✖ Unknown coin "btcc". Did you mean "btc"?
```

## Supported Currencies

USD, EUR, GBP, JPY, CAD, AUD — and any fiat currency code supported by CoinGecko (pass via `--currency`).

## Error Messages

The tool provides clear, human-friendly errors:

| Scenario                      | Output                                                           |
|-------------------------------|------------------------------------------------------------------|
| Unknown coin symbol           | `✖ Unknown coin "xyz". Did you mean "xrp"?`                     |
| Invalid date format           | `✖ Invalid date format. Use YYYY-MM-DD.`                        |
| Future date                   | `✖ Date cannot be in the future.`                                |
| Today's date                  | `✖ That's today — nothing to compare. Pick a past date.`        |
| No internet                   | `✖ Can't reach CoinGecko. Check your internet connection.`      |
| API rate limited              | `✖ Rate limited by CoinGecko. Wait 60 seconds and try again.`   |
| Coin didn't exist on that date| `✖ No price data for PEPE. The coin may not have existed yet.`   |

## Development

```bash
# Run in dev mode (no build needed)
npm run dev -- btc

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## Data Source

All price data comes from the [CoinGecko API](https://www.coingecko.com/en/api) (free tier, no API key required). Rate limits apply (~10-30 calls/minute).

## License

ISC
