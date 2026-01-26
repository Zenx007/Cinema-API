import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Reservation } from "../../Core/Entities/Reservation/Reservation.entity"; 
import { Result } from "../../Helpers/CustomObjects/Result";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Module } from "@nestjs/common";
import { ReservationSaveVO, ReservationVO } from "../../Communication/ViewObjects/Reservation/ReservationVO";

@Module({})
export abstract class IReservationService {
    abstract CreateAsync (model: ReservationSaveVO): Task<Result<ReservationVO>>;
    abstract UpdateAsync (model: ReservationVO): Task<Result<ReservationVO>>;
    abstract DeleteAsync(id: string): Task<Result>;
    abstract GetById (id: string): Task<Result<ReservationVO>>;
    abstract GetAll (): Task<Result<List<ReservationVO>>>;
    abstract GetHistoryAsync(userId: string): Task<Result<List<ReservationVO>>>;
}