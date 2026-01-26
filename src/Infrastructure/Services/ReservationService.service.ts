import { Injectable, Logger } from "@nestjs/common";
import { ReservationSaveVO, ReservationVO } from "../../Communication/ViewObjects/Reservation/ReservationVO";
import { Reservation, ReservationStatus } from "../../Core/Entities/Reservation/Reservation.entity";
import { IReservationRepository } from "../../Core/RepositoriesInterface/IReservationRepository.interface";
import { IReservationService } from "../../Core/ServicesInterface/IReservationService.interface";
import { ConstantsMessagesReservation, ConstantsMessagesSeat } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { ISeatRepository } from "../../Core/RepositoriesInterface/ISeatRepository.interface";
import { SeatStatus } from "../../Core/Entities/Seat/Seat.entity";

@Injectable()
export class ReservationService extends IReservationService {
    private readonly _reservationRepo: IReservationRepository;
    private readonly _seatRepo: ISeatRepository;

    private readonly logger = new Logger(ReservationService.name);

    constructor(
        private readonly reservationRepo: IReservationRepository,
        private readonly seatRepo: ISeatRepository,
    ) {
        super();
        this._reservationRepo = this.reservationRepo;
        this._seatRepo = this.seatRepo;
    }

    async CreateAsync(model: ReservationSaveVO): Task<Result<ReservationVO>> {
        this.logger.debug(`Iniciando reserva. User: ${model.userId}, Seat: ${model.seatId}`);
        try {
            const seat = await this._seatRepo.FindByIdAsync(model.seatId);
            if (seat == null) {
                this.logger.warn(`Tentativa de reserva em assento inexistente: ${model.seatId}`);
                return Result.Fail(ConstantsMessagesSeat.ErrorNotFound);
            }

            if (seat.status !== 'AVAILABLE') {
                this.logger.warn(`Assento ${model.seatId} indisponível. Status atual: ${seat.status}`);
                return Result.Fail(ConstantsMessagesReservation.ErrorSeatNotAvailable);
            }

            seat.status = SeatStatus.RESERVED;

            const seatUpdateResult = await this._seatRepo.UpdateAsync(seat);

            if (seatUpdateResult.isFailed) {
                this.logger.warn(`Concorrência detectada ao tentar travar o assento ${model.seatId}`);
                return Result.Fail(ConstantsMessagesReservation.ErrorSeatNotAvailable);
            }

            const reservation = new Reservation();
            reservation.userId = model.userId;
            reservation.seatId = model.seatId;
            reservation.paidPrice = seat.session.price;
            reservation.status = ReservationStatus.PENDING;
            reservation.expiresAt = new Date(Date.now() + 30 * 1000);

            const savedResult = await this._reservationRepo.InsertAsync(reservation);

            if (savedResult.isFailed || savedResult.value == null) {
                this.logger.error(`Falha ao persistir reserva para o assento ${model.seatId}`);
                return Result.Fail(ConstantsMessagesReservation.ErrorCreate);
            }

            const createdReservation = savedResult.value;

            this.logger.log(`Reserva ${createdReservation.id} criada com sucesso.`);

            const response = new ReservationVO();
            response.id = createdReservation.id;
            response.userId = createdReservation.userId;
            response.seatId = createdReservation.seatId;
            response.status = createdReservation.status;
            response.expiresAt = createdReservation.expiresAt;
            response.movie = seat.session.movie;

            return Result.Ok(response);
        }
        catch (error) {
            this.logger.error(`Erro fatal ao criar reserva: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorCreate);
        }
    }

    async UpdateAsync(model: ReservationVO): Task<Result<ReservationVO>> {
        try {
            if (!model.id) return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            this.logger.debug(`Atualizando reserva ${model.id} para status ${model.status}`);

            const existingReservation = await this._reservationRepo.FindByIdAsync(model.id);
            if (existingReservation == null) {
                this.logger.warn(`Reserva ${model.id} não encontrada para atualização.`);
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);
            }

            const reservationToUpdate = new Reservation();
            reservationToUpdate.id = model.id;
            reservationToUpdate.status = model.status as ReservationStatus;

            const updateResult = await this._reservationRepo.UpdateAsync(reservationToUpdate);

            if (updateResult.isFailed || updateResult.value == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorPut);

            const updatedReservation = updateResult.value;

            this.logger.log(`Status da reserva ${model.id} alterado para ${updatedReservation.status}`);

            const response = new ReservationVO();
            response.id = updatedReservation.id;
            response.userId = updatedReservation.userId;
            response.seatId = updatedReservation.seatId;
            response.status = updatedReservation.status;
            response.expiresAt = updatedReservation.expiresAt;

            return Result.Ok(response);
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar reserva ${model.id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorPut);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const reservationDelete = await this._reservationRepo.FindByIdAsync(id);
            if (reservationDelete == null) {
                this.logger.warn(`Tentativa de deletar reserva inexistente: ${id}`);
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);
            }

            const response = await this._reservationRepo.DeleteAsync(id);

            if (response.isFailed)
                return Result.Fail(ConstantsMessagesReservation.ErrorDelete);

            this.logger.log(`Reserva ${id} removida com sucesso.`);

            return Result.Ok();
        }
        catch (error) {
            this.logger.error(`Erro ao deletar reserva ${id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorDelete);
        }
    }

    async GetById(id: string): Task<Result<ReservationVO>> {
        try {
            if (!id) return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const reservation = await this._reservationRepo.FindByIdAsync(id);
            if (reservation == null) return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const response = new ReservationVO();
            response.id = reservation.id;
            response.userId = reservation.userId;
            response.seatId = reservation.seatId;
            response.status = reservation.status;
            response.expiresAt = reservation.expiresAt;
            response.movie = reservation.seat.session.movie;

            return Result.Ok(response);
        }
        catch (error) {
            this.logger.error(`Erro ao buscar reserva ${id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorPrepare);
        }
    }

    async GetAll(): Task<Result<List<ReservationVO>>> {
        try {
            const list = await this._reservationRepo.FindAllAsync();
            if (list == null) return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);

            const responseList: ReservationVO[] = list.map(res => {
                const vo = new ReservationVO();
                vo.id = res.id;
                vo.userId = res.userId;
                vo.seatId = res.seatId;
                vo.status = res.status;
                vo.expiresAt = res.expiresAt;
                vo.movie = res.seat.session.movie;
                return vo;
            });

            return Result.Ok(responseList);
        }
        catch (error) {
            this.logger.error(`Erro ao listar reservas: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);
        }
    }

    async GetHistoryAsync(userId: string): Task<Result<List<ReservationVO>>> {
        try {
            if (!userId) return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            this.logger.debug(`Buscando histórico de reservas para o usuário: ${userId}`);

            const list = await this._reservationRepo.FindByUserIdAsync(userId);

            if (list == null) 
                return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);

            const responseList: ReservationVO[] = list.map(res => {
                const vo = new ReservationVO();
                vo.id = res.id;
                vo.userId = res.userId;
                vo.seatId = res.seatId;
                vo.status = res.status;
                vo.expiresAt = res.expiresAt;
                vo.movie = res.seat.session.movie;
                return vo;
            });

            return Result.Ok(responseList);
        } catch (error) {
            this.logger.error(`Erro ao buscar histórico: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);
        }
    }
}