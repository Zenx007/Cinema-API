import { Injectable } from "@nestjs/common";
import { ReservationSaveVO, ReservationVO } from "../../Communication/ViewObjects/Reservation/ReservationVO";
import { Reservation, ReservationStatus } from "../../Core/Entities/Reservation/Reservation.entity";
import { IReservationRepository } from "../../Core/RepositoriesInterface/IReservationRepository.interface";
import { IReservationService } from "../../Core/ServicesInterface/IReservationService.interface";
import { ConstantsMessagesReservation } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";

@Injectable()
export class ReservationService extends IReservationService {
    private readonly _reservationRepo: IReservationRepository;

    constructor(
        private readonly reservationRepo: IReservationRepository,
    ) {
        super();
        this._reservationRepo = this.reservationRepo;
    }

    async CreateAsync(model: ReservationSaveVO): Task<Result<ReservationVO>> {
        try {
            const reservation = new Reservation();
            reservation.userId = model.userId;
            reservation.seatId = model.seatId;
            reservation.status = ReservationStatus.PENDING;
            reservation.expiresAt = new Date(Date.now() + 30 * 1000); 

            const savedResult = await this._reservationRepo.InsertAsync(reservation);

            if (savedResult.isFailed || savedResult.value == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorCreate);

            const createdReservation = savedResult.value;
            
            const response = new ReservationVO();
            response.id = createdReservation.id;
            response.userId = createdReservation.userId;
            response.seatId = createdReservation.seatId;
            response.status = createdReservation.status;
            response.expiresAt = createdReservation.expiresAt;

            return Result.Ok(response);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorCreate);
        }
    }

    async UpdateAsync(model: ReservationVO): Task<Result<ReservationVO>> {
        try {
            if (!model.id)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const existingReservation = await this._reservationRepo.FindByIdAsync(model.id);
            if (existingReservation == null) {
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);
            }

            const reservationToUpdate = new Reservation();
            reservationToUpdate.id = model.id;
            reservationToUpdate.status = model.status as ReservationStatus; 
            
            const updateResult = await this._reservationRepo.UpdateAsync(reservationToUpdate);

            if (updateResult.isFailed || updateResult.value == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorPut);

            const updatedReservation = updateResult.value;
            
            const response = new ReservationVO();
            response.id = updatedReservation.id;
            response.userId = updatedReservation.userId;
            response.seatId = updatedReservation.seatId;
            response.status = updatedReservation.status;
            response.expiresAt = updatedReservation.expiresAt;

            return Result.Ok(response);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorPut);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const reservationDelete = await this._reservationRepo.FindByIdAsync(id);
            if (reservationDelete == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const response = await this._reservationRepo.DeleteAsync(id);

            if (response.isFailed)
                return Result.Fail(ConstantsMessagesReservation.ErrorDelete);

            return Result.Ok();
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorDelete);
        }
    }

    async GetById(id: string): Task<Result<ReservationVO>> {
        try {
            if (!id) return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const reservation = await this._reservationRepo.FindByIdAsync(id);
            if (reservation == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const response = new ReservationVO();
            response.id = reservation.id;
            response.userId = reservation.userId;
            response.seatId = reservation.seatId;
            response.status = reservation.status;
            response.expiresAt = reservation.expiresAt;

            return Result.Ok(response);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorPrepare);
        }
    }

    async GetAll(): Task<Result<List<ReservationVO>>> {
        try {
            const list = await this._reservationRepo.FindAllAsync();
            if (list == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);

            const responseList: ReservationVO[] = list.map(res => {
                const vo = new ReservationVO();
                vo.id = res.id;
                vo.userId = res.userId;
                vo.seatId = res.seatId;
                vo.status = res.status;
                vo.expiresAt = res.expiresAt;
                return vo;
            });

            return Result.Ok(responseList);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);
        }
    }
}