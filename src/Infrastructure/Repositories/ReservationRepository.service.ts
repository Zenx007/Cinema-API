import { Injectable, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { IReservationRepository } from "../../Core/RepositoriesInterface/IReservationRepository.interface";
import { ConstantsMessagesReservation } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Reservation } from "../../Core/Entities/Reservation/Reservation.entity";

@Injectable()
export class ReservationRepository extends IReservationRepository {
    private readonly _reservationDbContext: Repository<Reservation>;

    constructor(
        @Inject('RESERVATION_REPOSITORY')
        private readonly reservationDbContext: Repository<Reservation>,
    ) {
        super();
        this._reservationDbContext = this.reservationDbContext;
    }

    async InsertAsync(model: Reservation): Task<Result<Reservation>> {
        try {
            const result = await this._reservationDbContext.save(model);

            return Result.Ok(result);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorInsert);
        }
    }

    async UpdateAsync(model: Reservation): Task<Result<Reservation>> {
        try {
            const reservation: Reservation | null = await this.FindByIdAsync(model.id);
            if (reservation == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorFindById);

            reservation.status = model.status;

            const saved = await this._reservationDbContext.save(reservation);

            return Result.Ok(saved);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorUpdate);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const reservation: Reservation | null = await this.FindByIdAsync(id);
            if (!reservation)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            await this._reservationDbContext.delete(id);

            return Result.Ok();
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorDelete);
        }
    }

    async FindByIdAsync(id: string): Task<Reservation | null> {
        try {
            const reservation: Reservation | null = await this._reservationDbContext.findOne({
                where: { id: id },
                relations: ['seat'] 
            });

            return reservation ?? null;
        }
        catch (error) {
            return null;
        }
    }

    async FindAllAsync(): Task<List<Reservation> | null> {
        try {
            const list: List<Reservation> = await this._reservationDbContext.find({
                relations: ['seat']
            });

            return list;
        }
        catch {
            return null;
        }
    }
}