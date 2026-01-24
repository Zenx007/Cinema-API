import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Seat } from "../../Core/Entities/Seat/Seat.entity"; // Ajuste o caminho
import { Result } from "../../Helpers/CustomObjects/Result";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Module } from "@nestjs/common";
import { SeatVO } from "../../Communication/ViewObjects/Seat/SeatVO";

@Module({})
export abstract class ISeatService {
    abstract GetAvailableBySession(sessionId: string): Task<Result<List<SeatVO>>>;
}