import { Injectable, Logger } from "@nestjs/common"; 
import { SeatVO } from "../../Communication/ViewObjects/Seat/SeatVO";
import { Seat, SeatStatus } from "../../Core/Entities/Seat/Seat.entity";
import { ISeatRepository } from "../../Core/RepositoriesInterface/ISeatRepository.interface";
import { ISeatService } from "../../Core/ServicesInterface/ISeatService.interface";
import { ConstantsMessagesSeat } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";

@Injectable()
export class SeatService extends ISeatService {
    private readonly _seatRepo: ISeatRepository;
    private readonly logger = new Logger(SeatService.name);

    constructor(
        private readonly seatRepo: ISeatRepository,
    ) {
        super();
        this._seatRepo = this.seatRepo;
    }

    async GetAvailableBySession(sessionId: string): Task<Result<List<SeatVO>>> {
        try {
            if (!sessionId) return Result.Fail(ConstantsMessagesSeat.ErrorNotFound);
            
            this.logger.debug(`Buscando assentos disponíveis para sessão ${sessionId}`);

            const list = await this._seatRepo.FindAvailableBySessionIdAsync(sessionId);
            if (list == null) return Result.Fail(ConstantsMessagesSeat.ErrorFindAll);

            const response = list.map(s => this.mapToVO(s));
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