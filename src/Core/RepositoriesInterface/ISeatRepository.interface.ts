import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Seat } from "../../Core/Entities/Seat/Seat.entity"; // Ajuste o caminho
import { Result } from "../../Helpers/CustomObjects/Result";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Module } from "@nestjs/common";

@Module({})
export abstract class ISeatRepository {
    abstract UpdateAsync (model: Seat): Task<Result<Seat>>;
    abstract FindByIdAsync (id: string): Task<Seat | null>;
    abstract FindAvailableBySessionIdAsync(sessionId: string): Task<List<Seat> | null>;
}