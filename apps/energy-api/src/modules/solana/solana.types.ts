export type SolanaSignerStatus = {
  rpcUrl: string;
  signerAddress: string;
  signerBalanceSol: number;
};

export type KzteMintStatus = {
  exists: boolean;
  mintAddress: string | null;
  decimals: number | null;
  supply: string | null;
  tokenProgram: string;
};