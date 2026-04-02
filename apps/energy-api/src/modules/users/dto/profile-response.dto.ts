export type ProfileResponseDto = {
  user: {
    id: string;
    dekycUserId: string;
    fullName: string | null;
    email: string | null;
    iin: string | null;
    createdAt: string;
  };
  wallet: {
    custodialWalletAddress: string | null;
    kzteTokenAccountAddress: string | null;
    energyPointsTokenAccountAddress: string | null;
  } | null;
  balances: {
    kzte: {
      amountBaseUnits: string;
      decimals: number;
    };
    energyPoints: {
      amountBaseUnits: string;
      decimals: number;
    };
  };
  security: {
    actionPasswordIsSet: boolean;
  };
};