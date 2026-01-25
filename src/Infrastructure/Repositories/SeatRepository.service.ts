import { Injectable, Inject, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { ISeatRepository } from "../../Core/RepositoriesInterface/ISeatRepository.interface";
import { ConstantsMessagesSeat } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Seat, SeatStatus } from "../../Core/Entities/Seat/Seat.entity";

@Injectable()
export class SeatRepository extends ISeatRepository {
    private readonly _seatDbContext: Repository<Seat>;
    private readonly logger = new Logger(SeatRepository.name);

    constructor(
        @Inject('SEAT_REPOSITORY')
        private readonly seatDbContext: Repository<Seat>,
        
    ) {
        super();
        this._seatDbContext = this.seatDbContext;
    }

    async UpdateAsync(model: Seat): Task<Result<Seat>> {
        try {
            const seat = await this.FindByIdAsync(model.id);
            if (seat == null) 
                return Result.Fail(ConstantsMessagesSeat.ErrorFindById);

            this.logger.debug(`Alterando status do Assento ${model.id} de '${seat.status}' para '${model.status}'`);

            seat.status = model.status;
            const saved = await this._seatDbContext.save(seat);

            return Result.Ok(saved);
        } catch (error) {
            this.logger.error(`Erro ao atualizar Assento ${model.id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSeat.ErrorUpdate);
        }
    }

    async FindByIdAsync(id: string): Task<Seat | null> {
        try {
            const seat = await this._seatDbContext.findOne({
                where: { id: id },
                relations: ['session']
            });
            return seat ?? null;
        } catch (error) {
            this.logger.error(`Erro na query FindByIdAsync (${id}): ${error.message}`, error.stack);
            return null;
        }
    }

    async FindAvailableBySessionIdAsync(sessionId: string): Task<List<Seat> | null> {
        try {
            const list = await this._seatDbContext.find({
                where: { 
                    sessionId: sessionId,
                    status: SeatStatus.AVAILABLE
                }
            });
            return list;
        } catch (error) {
            this.logger.error(`Erro ao buscar assentos disponíveis (Sessão ${sessionId}): ${error.message}`, error.stack);
            return null;
        }
    }
}