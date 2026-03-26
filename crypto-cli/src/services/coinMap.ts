const COIN_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  bnb: 'binancecoin',
  xrp: 'ripple',
  ada: 'cardano',
  doge: 'dogecoin',
  dot: 'polkadot',
  avax: 'avalanche-2',
  matic: 'matic-network',
  link: 'chainlink',
  uni: 'uniswap',
  atom: 'cosmos',
  ltc: 'litecoin',
  etc: 'ethereum-classic',
  xlm: 'stellar',
  algo: 'algorand',
  near: 'near',
  ftm: 'fantom',
  icp: 'internet-computer',
  fil: 'filecoin',
  hbar: 'hedera-hashgraph',
  vet: 'vechain',
  sand: 'the-sandbox',
  mana: 'decentraland',
  axs: 'axie-infinity',
  aave: 'aave',
  mkr: 'maker',
  crv: 'curve-dao-token',
  ldo: 'lido-dao',
  arb: 'arbitrum',
  op: 'optimism',
  apt: 'aptos',
  sui: 'sui',
  sei: 'sei-network',
  ton: 'the-open-network',
  trx: 'tron',
  shib: 'shiba-inu',
  pepe: 'pepe',
};

const COIN_NAMES: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  solana: 'Solana',
  binancecoin: 'BNB',
  ripple: 'XRP',
  cardano: 'Cardano',
  dogecoin: 'Dogecoin',
  polkadot: 'Polkadot',
  'avalanche-2': 'Avalanche',
  'matic-network': 'Polygon',
  chainlink: 'Chainlink',
  uniswap: 'Uniswap',
  cosmos: 'Cosmos',
  litecoin: 'Litecoin',
  'ethereum-classic': 'Ethereum Classic',
  stellar: 'Stellar',
  algorand: 'Algorand',
  near: 'NEAR Protocol',
  fantom: 'Fantom',
  'internet-computer': 'Internet Computer',
  filecoin: 'Filecoin',
  'hedera-hashgraph': 'Hedera',
  vechain: 'VeChain',
  'the-sandbox': 'The Sandbox',
  decentraland: 'Decentraland',
  'axie-infinity': 'Axie Infinity',
  aave: 'Aave',
  maker: 'Maker',
  'curve-dao-token': 'Curve DAO',
  'lido-dao': 'Lido DAO',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  aptos: 'Aptos',
  sui: 'Sui',
  'sei-network': 'Sei',
  'the-open-network': 'Toncoin',
  tron: 'TRON',
  'shiba-inu': 'Shiba Inu',
  pepe: 'Pepe',
};

export function resolveCoinId(symbol: string): string | null {
  return COIN_MAP[symbol.toLowerCase()] ?? null;
}

export function getCoinName(coinId: string): string {
  return COIN_NAMES[coinId] ?? coinId;
}

export function getSupportedSymbols(): string[] {
  return Object.keys(COIN_MAP).sort();
}

export function findClosestSymbol(input: string): string | null {
  const lower = input.trim().toLowerCase();
  if (!lower) return null;

  const symbols = Object.keys(COIN_MAP);

  // Exact prefix match
  const prefixMatch = symbols.find((s) => s.startsWith(lower));
  if (prefixMatch) return prefixMatch;

  // Simple Levenshtein distance
  let bestSymbol: string | null = null;
  let bestDistance = Infinity;

  for (const symbol of symbols) {
    const dist = levenshtein(lower, symbol);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestSymbol = symbol;
    }
  }

  // Only suggest if distance is small enough
  return bestDistance <= 2 ? bestSymbol : null;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}
