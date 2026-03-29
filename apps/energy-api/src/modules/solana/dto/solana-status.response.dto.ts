export class SolanaStatusResponseDto {
  rpcUrl!: string;
  signerAddress!: string;
  signerBalanceSol!: number;
  kzte!: {
    exists: boolean;
    mintAddress: string | null;
    decimals: number | null;
    supply: string | null;
    tokenProgram: string;
  };
}