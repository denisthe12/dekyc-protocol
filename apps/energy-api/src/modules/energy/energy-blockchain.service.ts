import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { AnchorService } from '@/modules/solana/anchor.service';
import { SolanaService } from '@/modules/solana/solana.service';
import { sha256FromObject } from './utils/hash.util';
import { buildEnergyMetadata, type EnergyMetadata } from './utils/metadata.util';

export type CreatedEnergyAssetResult = {
  registryPda: string;
  registryTx: string | null;
  assetId: string;
  assetPda: string;
  shareMint: string;
  treasuryShareAccount: string;
  createAssetTx: string;
  issueSharesTx: string;
  metadata: EnergyMetadata;
  metadataHash: string;

};

@Injectable()
export class EnergyBlockchainService {
  public constructor(
    private readonly anchorService: AnchorService,
    private readonly solanaService: SolanaService,
  ) {}

  public async getRegistryPda(): Promise<PublicKey> {
    const program = this.anchorService.program;

    const [registryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      program.programId,
    );

    return registryPda;
  }

  public async createRegistryIfNeeded(): Promise<{
    registryPda: string;
    tx: string | null;
  }> {
    const program = this.anchorService.program;
    const provider = this.anchorService.provider;
    const registryPda = await this.getRegistryPda();

    const existing = await provider.connection.getAccountInfo(registryPda, 'confirmed');
    if (existing) {
      return {
        registryPda: registryPda.toBase58(),
        tx: null,
      };
    }

    const tx = await program.methods
      .createRegistry()
      .accounts({
        admin: provider.wallet.publicKey,
        kzteMint: this.solanaService.getKzteMint(),
        registry: registryPda,
      })
      .rpc();

    return {
      registryPda: registryPda.toBase58(),
      tx,
    };
  }

  public async createEnergyAsset(): Promise<CreatedEnergyAssetResult> {
    const provider = this.anchorService.provider;
    const program = this.anchorService.program;
    const signer = await this.solanaService.getSigner();

    const registry = await this.createRegistryIfNeeded();

    const assetIdBn = new anchor.BN(Date.now());
    const assetIdLe = assetIdBn.toArrayLike(Buffer, 'le', 8);

    const metadata = buildEnergyMetadata({
      assetId: assetIdBn.toString(),
    });

    const metadataHashBuffer = sha256FromObject(metadata);

    const metadataUriHash = Array.from(metadataHashBuffer);

    const proofRootHash = new Array(32).fill(0); // пока оставим

    const [assetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('energy_asset'), assetIdLe],
      program.programId,
    );

    const shareMint = await createMint(
      provider.connection,
      signer,
      assetPda,
      null,
      0,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const treasuryShareAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      signer,
      shareMint,
      assetPda,
      true,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    const createAssetTx = await program.methods
      .createEnergyAsset(
        assetIdBn,
        new anchor.BN(1000),
        new anchor.BN(10000),
        8000,
        2000,
        { kzte: {} },
        proofRootHash,
        metadataUriHash,
      )
      .accounts({
        issuer: provider.wallet.publicKey,
        registry: new PublicKey(registry.registryPda),
        shareMint,
        treasuryShareAccount: treasuryShareAccount.address,
        energyAsset: assetPda,
      })
      .rpc();

    const issueSharesTx = await program.methods
      .issueShares()
      .accounts({
        issuer: provider.wallet.publicKey,
        energyAsset: assetPda,
        shareMint,
        treasuryShareAccount: treasuryShareAccount.address,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    return {
      registryPda: registry.registryPda,
      registryTx: registry.tx,
      assetId: assetIdBn.toString(),
      assetPda: assetPda.toBase58(),
      shareMint: shareMint.toBase58(),
      treasuryShareAccount: treasuryShareAccount.address.toBase58(),
      createAssetTx,
      issueSharesTx,
      metadata,
      metadataHash: metadataHashBuffer.toString('hex'),
    };
  }
}