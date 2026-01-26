import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Reservation } from "../../Core/Entities/Reservation/Reservation.entity";
import { Result } from "../../Helpers/CustomObjects/Result";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Module } from "@nestjs/common";
@Module({})
export abstract class IReservationRepository {
    abstract InsertAsync(model: Reservation): Task<Result<Reservation>>;
    abstract UpdateAsync(model: Reservation): Task<Result<Reservation>>;
    abstract FindByIdAsync(id: string): Task<Reservation | null>;
    abstract FindAllAsync(): Task<List<Reservation> | null>;
    abstract FindBySeatAsync(id: string): Task<Reservation | null>;
    abstract FindExpiredAsync(date: Date): Task<List<Reservation> | null>;
    abstract FindByUserIdAsync(userId: string): Task<List<Reservation> | null>;
    abstract FindBySessionIdAsync(sessionId: string): Task<List<Reservation> | null>;
}