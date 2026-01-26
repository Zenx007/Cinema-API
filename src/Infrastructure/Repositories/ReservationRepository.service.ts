import { Injectable, Inject, Logger } from "@nestjs/common";
import { LessThan, MoreThan, Repository } from "typeorm";
import { IReservationRepository } from "../../Core/RepositoriesInterface/IReservationRepository.interface";
import { ConstantsMessagesReservation } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Reservation, ReservationStatus } from "../../Core/Entities/Reservation/Reservation.entity";

@Injectable()
export class ReservationRepository extends IReservationRepository {
    private readonly _reservationDbContext: Repository<Reservation>;
    private readonly logger = new Logger(ReservationRepository.name);

    constructor(
        @Inject('RESERVATION_REPOSITORY')
        private readonly reservationDbContext: Repository<Reservation>,
    ) {
        super();
        this._reservationDbContext = this.reservationDbContext;
    }

    async InsertAsync(model: Reservation): Task<Result<Reservation>> {
        try {
            this.logger.debug(`Inserindo nova reserva no banco. SeatId: ${model.seatId}, UserId: ${model.userId}`);

            const result = await this._reservationDbContext.save(model);

            return Result.Ok(result);
        }
        catch (error) {
            this.logger.error(`Erro ao persistir reserva no banco: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorInsert);
        }
    }

    async UpdateAsync(model: Reservation): Task<Result<Reservation>> {
        try {
            const reservation: Reservation | null = await this.FindByIdAsync(model.id);
            if (reservation == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorFindById);

            reservation.status = model.status;

            this.logger.debug(`Atualizando reserva ${model.id} para status: ${model.status}`);

            const saved = await this._reservationDbContext.save(reservation);

            return Result.Ok(saved);
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar reserva ${model.id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorUpdate);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const reservation: Reservation | null = await this.FindByIdAsync(id);
            if (!reservation)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            await this._reservationDbContext.delete(id);

            this.logger.log(`Reserva ${id} foi deletada do banco.`);

            return Result.Ok();
        }
        catch (error) {
            this.logger.error(`Erro ao deletar reserva ${id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorDelete);
        }
    }

    async FindByIdAsync(id: string): Task<Reservation | null> {
        try {
            const reservation: Reservation | null = await this._reservationDbContext.findOne({
                where: { id: id },
                relations: ['seat', 'seat.session']
            });
            return reservation ?? null;
        }
        catch (error) {
            this.logger.error(`Erro na query FindByIdAsync (${id}): ${error.message}`, error.stack);
            return null;
        }
    }

    async FindAllAsync(): Task<List<Reservation> | null> {
        try {
            const list: List<Reservation> = await this._reservationDbContext.find({
                relations: ['seat', 'seat.session']
            });
            return list;
        }
        catch (error) {
            this.logger.error(`Erro na query FindAllAsync: ${error.message}`, error.stack);
            return null;
        }
    }

    async FindBySeatAsync(id: string): Task<Reservation | null> {
        try {
            const reservation: Reservation | null = await this._reservationDbContext.findOne({
                where: {
                    seatId: id,
                    expiresAt: MoreThan(new Date())
                },
                relations: ['seat']
            });
            return reservation ?? null;
        }
        catch (error) {
            this.logger.error(`Erro na query FindBySeatAsync (${id}): ${error.message}`, error.stack);
            return null;
        }
    }

    async FindExpiredAsync(date: Date): Task<List<Reservation> | null> {
        try {
            const list = await this._reservationDbContext.find({
                where: {
                    status: ReservationStatus.PENDING,
                    expiresAt: LessThan(date)
                },
                relations: ['seat']
            });
            return list;
        } catch (error) {
            this.logger.error(`Erro ao buscar reservas expiradas: ${error.message}`, error.stack);
            return null;
        }
    }

    async FindByUserIdAsync(userId: string): Task<List<Reservation> | null> {
        try {
            return await this._reservationDbContext.find({
                where: { userId: userId },
                relations: ['seat', 'seat.session']
            });
        } catch { return null; }
    }
}