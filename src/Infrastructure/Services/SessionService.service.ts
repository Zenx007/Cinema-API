import { Injectable, Logger } from "@nestjs/common"; 
import { SessionSaveVO, SessionVO } from "../../Communication/ViewObjects/Session/SessionVO";
import { Seat, SeatStatus } from "../../Core/Entities/Seat/Seat.entity";
import { ISessionRepository } from "../../Core/RepositoriesInterface/ISessionRepository.interface";
import { ISessionService } from "../../Core/ServicesInterface/ISessionService.interface";
import { ConstantsMessagesSession } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Session } from "../../Core/Entities/Session/Session.entity";

@Injectable()
export class SessionService extends ISessionService {
    private readonly _sessionRepo: ISessionRepository;
    private readonly logger = new Logger(SessionService.name);

    constructor(
        private readonly sessionRepo: ISessionRepository,
    ) {
        super();
        this._sessionRepo = this.sessionRepo;
    }

    async CreateAsync(model: SessionSaveVO): Task<Result<SessionVO>> {
        this.logger.debug(`Criando sessão. Filme: ${model.movie}, Sala: ${model.room}, Seats: ${model.numberOfSeats}`);

        try {

            if (model.numberOfSeats < 16) {
                this.logger.warn(`Tentativa de criar sessão com ${model.numberOfSeats} assentos. Mínimo 16.`);
                return Result.Fail(ConstantsMessagesSession.ErrorMinSeats);
            }

            const session = new Session();
            session.movie = model.movie;
            session.room = model.room;
            session.price = model.price;

            const seats: Seat[] = [];
            const seatsPerRow = 10; 
            
            for (let i = 0; i < model.numberOfSeats; i++) {
                const seat = new Seat();
                const rowIndex = Math.floor(i / seatsPerRow);
                const rowLetter = String.fromCharCode(65 + rowIndex);
                const seatNumber = (i % seatsPerRow) + 1;

                seat.row = rowLetter;
                seat.number = seatNumber;
                seat.status = SeatStatus.AVAILABLE;
                
                seats.push(seat);
            }
            session.seats = seats;

            const savedResult = await this._sessionRepo.InsertAsync(session);

            if (savedResult.isFailed || savedResult.value == null) {
                this.logger.error(`Falha ao persistir sessão.`);
                return Result.Fail(ConstantsMessagesSession.ErrorCreate);
            }

            const createdSession = savedResult.value;
            
            this.logger.log(`Sessão ${createdSession.id} criada com ${model.numberOfSeats} assentos gerados.`);

            const response = new SessionVO();
            response.id = createdSession.id;
            response.movie = createdSession.movie;
            response.roomId = createdSession.room;
            response.price = createdSession.price;

            return Result.Ok(response);
        }
        catch (error) {
            this.logger.error(`Erro fatal ao criar sessão: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSession.ErrorCreate);
        }
    }

    async UpdateAsync(model: SessionVO): Task<Result<SessionVO>> {
        try {
            if (!model.id) return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            const existingSession = await this._sessionRepo.FindByIdAsync(model.id);
            if (existingSession == null) {
                this.logger.warn(`Sessão ${model.id} não encontrada para update.`);
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);
            }

            const sessionToUpdate = new Session();
            sessionToUpdate.id = model.id;
            sessionToUpdate.movie = model.movie;
            sessionToUpdate.room = model.roomId;
            sessionToUpdate.price = model.price;

            const updateResult = await this._sessionRepo.UpdateAsync(sessionToUpdate);

            if (updateResult.isFailed || updateResult.value == null)
                return Result.Fail(ConstantsMessagesSession.ErrorPut);

            this.logger.log(`Sessão ${model.id} atualizada com sucesso.`);

            const updatedSession = updateResult.value;
            const response = new SessionVO();
            response.id = updatedSession.id;
            response.movie = updatedSession.movie;
            response.roomId = updatedSession.room;
            response.price = updatedSession.price;

            return Result.Ok(response);
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar sessão ${model.id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSession.ErrorPut);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const sessionDelete = await this._sessionRepo.FindByIdAsync(id);
            if (sessionDelete == null) {
                this.logger.warn(`Sessão ${id} não encontrada para deleção.`);
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);
            }

            const response = await this._sessionRepo.DeleteAsync(id);

            if (response.isFailed)
                return Result.Fail(ConstantsMessagesSession.ErrorDelete);

            this.logger.log(`Sessão ${id} removida.`);
            return Result.Ok();
        }
        catch (error) {
            this.logger.error(`Erro ao deletar sessão ${id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSession.ErrorDelete);
        }
    }

    async GetById(id: string): Task<Result<SessionVO>> {
        try {
            if (!id) return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            const session = await this._sessionRepo.FindByIdAsync(id);
            if (session == null) return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            const response = new SessionVO();
            response.id = session.id;
            response.movie = session.movie;
            response.roomId = session.room;
            response.price = session.price;

            return Result.Ok(response);
        }
        catch (error) {
            this.logger.error(`Erro ao buscar sessão ${id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSession.ErrorPrepare);
        }
    }

    async GetAll(): Task<Result<List<SessionVO>>> {
        try {
            const list = await this._sessionRepo.FindAllAsync();
            if (list == null) return Result.Fail(ConstantsMessagesSession.ErrorGetAll);

            const responseList: SessionVO[] = list.map(session => {
                const vo = new SessionVO();
                vo.id = session.id;
                vo.movie = session.movie;
                vo.roomId = session.room;
                vo.price = session.price;
                return vo;
            });

            return Result.Ok(responseList);
        }
        catch (error) {
            this.logger.error(`Erro ao listar sessões: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSession.ErrorGetAll);
        }
    }
}