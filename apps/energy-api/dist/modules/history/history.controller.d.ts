import { HistoryService } from './history.service';
export declare class HistoryController {
    private readonly historyService;
    constructor(historyService: HistoryService);
    getUserHistory(energyUserId: string): Promise<import("./history.service").HistoryEventItem[]>;
}
