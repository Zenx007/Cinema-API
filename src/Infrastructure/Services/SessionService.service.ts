import { Injectable } from "@nestjs/common";
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
    
    constructor(
        private readonly sessionRepo: ISessionRepository,
    ) {
        super();
        this._sessionRepo = this.sessionRepo;
    }

    async CreateAsync(model: SessionSaveVO): Task<Result<SessionVO>> {
        try {
            const session = new Session();
            session.movideo = model.movieId;
            session.roomId = model.roomId;
            session.startTime = model.startTime;
            session.price = model.price;

            const seats: Seat[] = [];
            const rows = ['A', 'B']; 
            for (const row of rows) {
                for (let i = 1; i <= 10; i++) { 
                    const seat = new Seat();
                    seat.row = row;
                    seat.number = i;
                    seat.status = SeatStatus.AVAILABLE;
                    seats.push(seat);
                }
            }
            session.seats = seats;

            const savedResult = await this._sessionRepo.InsertAsync(session);
            
            if (savedResult.isFailed || savedResult.value == null)
                return Result.Fail(ConstantsMessagesSession.ErrorCreate);

            const createdSession = savedResult.value;
            const response = new SessionVO();
            response.id = createdSession.id;
            response.movie = createdSession.movideo;
            response.roomId = createdSession.roomId;
            response.startTime = createdSession.startTime;
            response.price = createdSession.price;

            return Result.Ok(response);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesSession.ErrorCreate);
        }
    }

    async UpdateAsync(model: SessionVO): Task<Result<SessionVO>> {
        try {
            if (!model.id)
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            const existingSession = await this._sessionRepo.FindByIdAsync(model.id);
            if (existingSession == null) {
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);
            }

            const sessionToUpdate = new Session();
            sessionToUpdate.id = model.id;
            sessionToUpdate.movideo = model.movie;
            sessionToUpdate.roomId = model.roomId;
            sessionToUpdate.startTime = model.startTime;
            sessionToUpdate.price = model.price;

            const updateResult = await this._sessionRepo.UpdateAsync(sessionToUpdate);
            
            if (updateResult.isFailed || updateResult.value == null)
                return Result.Fail(ConstantsMessagesSession.ErrorPut);

            const updatedSession = updateResult.value;
            const response = new SessionVO();
            response.id = updatedSession.id;
            response.movie = updatedSession.movideo;
            response.roomId = updatedSession.roomId;
            response.startTime = updatedSession.startTime;
            response.price = updatedSession.price;

            return Result.Ok(response);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesSession.ErrorPut);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const sessionDelete = await this._sessionRepo.FindByIdAsync(id);
            if (sessionDelete == null)
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            const response = await this._sessionRepo.DeleteAsync(id);
            
            if (response.isFailed)
                return Result.Fail(ConstantsMessagesSession.ErrorDelete);

            return Result.Ok();
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesSession.ErrorDelete);
        }
    }

    async GetById(id: string): Task<Result<SessionVO>> {
        try {
            if (!id) return Result.Fail(ConstantsMessagesSession.ErrorNotFound);
                
            const session = await this._sessionRepo.FindByIdAsync(id);
            if (session == null)
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            const response = new SessionVO();
            response.id = session.id;
            response.movie = session.movideo;
            response.roomId = session.roomId;
            response.startTime = session.startTime;
            response.price = session.price;

            return Result.Ok(response);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesSession.ErrorPrepare);
        }
    }

    async GetAll(): Task<Result<List<SessionVO>>> {
        try {
            const list = await this._sessionRepo.FindAllAsync();
            if (list == null)
                return Result.Fail(ConstantsMessagesSession.ErrorGetAll);

            const responseList: SessionVO[] = list.map(session => {
                const vo = new SessionVO();
                vo.id = session.id;
                vo.movie = session.movideo;
                vo.roomId = session.roomId;
                vo.startTime = session.startTime;
                vo.price = session.price;
                return vo;
            });

            return Result.Ok(responseList);
        }
        catch(error) {
            return Result.Fail(ConstantsMessagesSession.ErrorGetAll);
        }
    }
}