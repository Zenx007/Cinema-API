import { Injectable, Logger } from "@nestjs/common"; 
import { SeatVO } from "../../Communication/ViewObjects/Seat/SeatVO";
import { Seat, SeatStatus } from "../../Core/Entities/Seat/Seat.entity";
import { ISeatRepository } from "../../Core/RepositoriesInterface/ISeatRepository.interface";
import { ISeatService } from "../../Core/ServicesInterface/ISeatService.interface";
import { ConstantsMessagesSeat, ConstantsMessagesSession } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { ISessionRepository } from "../../Core/RepositoriesInterface/ISessionRepository.interface";

@Injectable()
export class SeatService extends ISeatService {
    private readonly _seatRepo: ISeatRepository;
    private readonly _sessionRepo: ISessionRepository;

    private readonly logger = new Logger(SeatService.name);

    constructor(
        private readonly seatRepo: ISeatRepository,
        private readonly sessionRepo: ISessionRepository
    ) {
        super();
        this._seatRepo = this.seatRepo;
        this._sessionRepo = this.sessionRepo;
    }

    async GetAvailableBySession(sessionId: string): Task<Result<List<SeatVO>>> {
        try {
            if (!sessionId)
                 return Result.Fail(ConstantsMessagesSeat.ErrorNotFound);

            const session = await this._sessionRepo.FindByIdAsync(sessionId);
            if (session == null ) {
                this.logger.warn(`Tentativa de buscar assentos disponiveis em sessão inexistente: ${sessionId}`);
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);
            }
            
            this.logger.debug(`Buscando assentos disponíveis para sessão ${sessionId}`);

            const list = await this._seatRepo.FindAvailableBySessionIdAsync(sessionId);
            if (list == null || list.length === 0) {
                this.logger.log(`Assentos disponíveis para sessão ${sessionId} buscados com sucesso, mas sem assentos disponiveis.`);
                return Result.Ok([] as SeatVO[]);
            }

            const response = list.map(s => this.mapToVO(s));
            this.logger.log(`Assentos disponíveis para sessão ${sessionId} buscados com sucesso.`);
            return Result.Ok(response);
        } catch (error) {
            this.logger.error(`Erro ao buscar assentos: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSeat.ErrorFindAll);
        }
    }

    private mapToVO(seat: Seat): SeatVO {
        const vo = new SeatVO();
        vo.id = seat.id;
        vo.row = seat.row;
        vo.number = seat.number;
        vo.status = seat.status;
        vo.sessionId = seat.sessionId;
        return vo;
    }
}