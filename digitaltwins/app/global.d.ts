interface Ethereum {
    request: (args: any) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
}

interface solana {
    connect: () => Promise<any>;
}
  
interface Window {
  ethereum?: Ethereum;
  solana?: solana;
  playerWinCount?: number;
}

