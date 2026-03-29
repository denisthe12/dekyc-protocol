import { SolanaService } from './solana.service';
import { Token2022Service } from './token-2022.service';
import { SolanaStatusResponseDto } from './dto/solana-status.response.dto';
import { CreateKzteMintResponseDto } from './dto/create-kzte-mint.response.dto';
export declare class SolanaController {
    private readonly solanaService;
    private readonly token2022Service;
    constructor(solanaService: SolanaService, token2022Service: Token2022Service);
    getStatus(): Promise<SolanaStatusResponseDto>;
    createKzteMint(): Promise<CreateKzteMintResponseDto>;
}
