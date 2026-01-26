import { Inject, Injectable, Logger } from "@nestjs/common";
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
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class ReservationService extends IReservationService {
    private readonly _reservationRepo: IReservationRepository;
    private readonly _seatRepo: ISeatRepository;

    private readonly logger = new Logger(ReservationService.name);

    constructor(
        private readonly reservationRepo: IReservationRepository,
        private readonly seatRepo: ISeatRepository,

        @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,

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

            const normalizedUserId = model.userId.trim().toLowerCase();

            const reservation = new Reservation();
            reservation.userId = normalizedUserId;
            reservation.seatId = model.seatId;
            reservation.paidPrice = seat.session.price;
            reservation.status = ReservationStatus.PENDING;
            reservation.expiresAt = new Date(Date.now() + 30 * 1000);

            const savedResult = await this._reservationRepo.InsertAsync(reservation);

            if (savedResult.isFailed || savedResult.value == null) {
                this.logger.error(`Falha ao persistir reserva para o assento ${model.seatId}`);

                seat.status = SeatStatus.AVAILABLE;
                await this._seatRepo.UpdateAsync(seat);
                return Result.Fail(ConstantsMessagesReservation.ErrorCreate);
            }

            const createdReservation = savedResult.value;

            try {
                this.rabbitClient.emit('reservation_created', {
                    id: createdReservation.id,
                    userId: createdReservation.userId,
                    seatId: createdReservation.seatId,
                    timestamp: new Date(),
                });
                this.logger.log(`Evento 'reservation_created' enviado para fila.`);
            } catch (e) {
                this.logger.error(`Erro ao publicar mensagem: ${e.message}`);
            }


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
            if (!model.id)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

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
            response.movie = existingReservation.seat.session.movie;
            if (updatedReservation.status === ReservationStatus.PENDING) {
                response.expiresAt = updatedReservation.expiresAt;
            } else {
                response.expiresAt = null;
            }

            return Result.Ok(response);
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar reserva ${model.id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorPut);
        }
    }

    async GetById(id: string): Task<Result<ReservationVO>> {
        try {
            if (!id)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const reservation = await this._reservationRepo.FindByIdAsync(id);
            if (reservation == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            const response = new ReservationVO();
            response.id = reservation.id;
            response.userId = reservation.userId;
            response.seatId = reservation.seatId;
            response.status = reservation.status;
            response.movie = reservation.seat.session.movie;
            if (reservation.status === ReservationStatus.PENDING) {
                response.expiresAt = reservation.expiresAt;
            } else {
                response.expiresAt = null;
            }

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
            if (list == null || list.length === 0) {
                this.logger.log(`Lista de  reservas retornando vazia`);
                return Result.Ok([] as ReservationVO[]);
            }

            const responseList: ReservationVO[] = list.map(res => {
                const vo = new ReservationVO();
                vo.id = res.id;
                vo.userId = res.userId;
                vo.seatId = res.seatId;
                vo.status = res.status;
                vo.movie = res.seat.session.movie;
                if (res.status === ReservationStatus.PENDING) {
                    vo.expiresAt = res.expiresAt;
                } else {
                    vo.expiresAt = null;
                }

                return vo;
            });

            this.logger.log(`Lista de  reservas retornando com sucesso`);

            return Result.Ok(responseList);
        }
        catch (error) {
            this.logger.error(`Erro ao listar reservas: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);
        }
    }

    async GetHistoryAsync(userId: string): Task<Result<List<ReservationVO>>> {
        try {
            if (!userId)
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            this.logger.debug(`Buscando histórico de reservas para o usuário: ${userId}`);

            const normalizedUserId = userId.trim().toLowerCase();

            const list = await this._reservationRepo.FindByUserIdAsync(normalizedUserId);

            if (list == null || list.length === 0) {
                this.logger.log(`Historico de compras vazio retornando para o usuário: ${userId}`);
                return Result.Ok([] as ReservationVO[]);
            }

            const responseList: ReservationVO[] = list.map(res => {
                const vo = new ReservationVO();
                vo.id = res.id;
                vo.userId = res.userId;
                vo.seatId = res.seatId;
                vo.status = res.status;
                vo.movie = res.seat.session.movie;
                if (res.status === ReservationStatus.PENDING) {
                    vo.expiresAt = res.expiresAt;
                } else {
                    vo.expiresAt = null;
                }
                this.logger.log(`Historico de compras retornando para o usuário: ${userId}`);
                return vo;
            });

            return Result.Ok(responseList);
        } catch (error) {
            this.logger.error(`Erro ao buscar histórico: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorGetAll);
        }
    }

    async ConfirmPaymentAsync(reservationId: string): Task<Result<ReservationVO>> {
        try {
            if (!reservationId) return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);

            this.logger.debug(`Iniciando confirmação de pagamento para reserva: ${reservationId}`);

            const reservation = await this._reservationRepo.FindByIdAsync(reservationId);

            if (!reservation) {
                this.logger.warn(`Reserva ${reservationId} não encontrada.`);
                return Result.Fail(ConstantsMessagesReservation.ErrorNotFound);
            }

            if (reservation.status !== ReservationStatus.PENDING) {
                this.logger.warn(`Tentativa de pagar reserva ${reservationId} com status ${reservation.status}.`);
                return Result.Fail("A reserva não está pendente ou já expirou.");
            }

            reservation.status = ReservationStatus.CONFIRMED;

            if (reservation.seat) {
                reservation.seat.status = SeatStatus.SOLD;
                await this._seatRepo.UpdateAsync(reservation.seat);
            }

            const updatedReservation = await this._reservationRepo.UpdateAsync(reservation);

            if (updatedReservation.isFailed || updatedReservation.value == null)
                return Result.Fail(ConstantsMessagesReservation.ErrorUpdate);

            try {
                this.rabbitClient.emit('payment_confirmed', {
                    reservationId: reservationId,
                    status: 'CONFIRMED',
                    timestamp: new Date(),
                });
                this.logger.log(`Evento 'payment_confirmed' enviado para fila.`);
            } catch (e) {
                this.logger.error(`Erro ao publicar mensagem: ${e.message}`);
            }


            this.logger.log(`Pagamento confirmado. Reserva ${reservationId} efetivada.`);


            const resValue = updatedReservation.value;
            const response = new ReservationVO();
            response.id = resValue.id;
            response.userId = resValue.userId;
            response.seatId = resValue.seatId;
            response.status = resValue.status;
            response.expiresAt = null;
            response.movie = resValue.seat.session.movie;

            return Result.Ok(response);

        } catch (error) {
            this.logger.error(`Erro fatal ao confirmar pagamento: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesReservation.ErrorUpdate);
        }
    }
}