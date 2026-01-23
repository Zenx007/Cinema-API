import { Inject, Injectable } from "@nestjs/common";
import { Session } from "src/Core/Entities/Session/Session.entity";
import { ISessionRepository } from "src/Core/RepositoriesInterface/ISessionRepository.interface";
import { ConstantsMessagesSession } from "src/Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "src/Helpers/CustomObjects/List.Interface";
import { Result } from "src/Helpers/CustomObjects/Result";
import { Task } from "src/Helpers/CustomObjects/Task.Interface";
import { Repository } from "typeorm";

@Injectable()
export class SessionRepository extends ISessionRepository {
    private readonly _sessionDbContext: Repository<Session>;

    constructor(
        @Inject('SESSION_REPOSITORY')
        private readonly sessionDbContext: Repository<Session>,
    ) {
        super();
        this._sessionDbContext = this.sessionDbContext;
    }

    async InsertAsync(model: Session): Task<Result<Session>> {
        try {

            const result = await this._sessionDbContext.save(model);

            return Result.Ok(result);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesSession.ErrorInsert);
        }
    }

    async UpdateAsync(model: Session): Task<Result<Session>> {
        try {
            const session: Session | null = await this.FindByIdAsync(model.id);
            if (session == null)
                return Result.Fail(ConstantsMessagesSession.ErrorFindById);

            session.movideo = model.movideo;
            session.roomId = model.roomId;
            session.startTime = model.startTime;
            session.price = model.price;

            const saved = await this._sessionDbContext.save(session);

            return Result.Ok(saved);
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesSession.ErrorUpdate);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const session: Session | null = await this.FindByIdAsync(id);
            if (!session)
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            await this._sessionDbContext.delete(id);

            return Result.Ok();
        }
        catch (error) {
            return Result.Fail(ConstantsMessagesSession.ErrorDelete);
        }
    }

    async FindByIdAsync(id: string): Task<Session | null> {
        try {
            const session: Session | null = await this._sessionDbContext.findOne({
                where: { id: id },
                relations: ['seats']
            });

            return session ?? null;
        }
        catch (error) {
            return null;
        }
    }

    async FindAllAsync(): Task<List<Session> | null> {
        try {
            const list: List<Session> = await this._sessionDbContext.find({
                relations: ['seats']
            });

            return list;
        }
        catch {
            return null;
        }
    }
}