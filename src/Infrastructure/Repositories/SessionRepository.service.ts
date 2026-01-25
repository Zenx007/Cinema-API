import { Injectable, Inject, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { ISessionRepository } from "../../Core/RepositoriesInterface/ISessionRepository.interface";
import { ConstantsMessagesSession } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Session } from "../../Core/Entities/Session/Session.entity";

@Injectable()
export class SessionRepository extends ISessionRepository {
    private readonly _sessionDbContext: Repository<Session>;
    private readonly logger = new Logger(SessionRepository.name);

    constructor(
        @Inject('SESSION_REPOSITORY')
        private readonly sessionDbContext: Repository<Session>,
    ) {
        super();
        this._sessionDbContext = this.sessionDbContext;
    }

   async InsertAsync(model: Session): Task<Result<Session>> {
        try {
            this.logger.debug(`Inserindo nova sessão. Filme: ${model.movie}, Sala: ${model.room}`);
            
            const result = await this._sessionDbContext.save(model);

            return Result.Ok(result);
        }
        catch (error) {
            this.logger.error(`Erro ao criar sessão: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSession.ErrorInsert);
        }
    }

    async UpdateAsync(model: Session): Task<Result<Session>> {
        try {
            const session: Session | null = await this.FindByIdAsync(model.id);
            if (session == null)
                return Result.Fail(ConstantsMessagesSession.ErrorFindById);

            session.movie = model.movie;
            session.room = model.room;
            session.price = model.price;

            this.logger.debug(`Atualizando sessão ${model.id}`);

            const saved = await this._sessionDbContext.save(session);

            return Result.Ok(saved);
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar sessão ${model.id}: ${error.message}`, error.stack);
            return Result.Fail(ConstantsMessagesSession.ErrorUpdate);
        }
    }

    async DeleteAsync(id: string): Task<Result> {
        try {
            const session: Session | null = await this.FindByIdAsync(id);
            if (!session)
                return Result.Fail(ConstantsMessagesSession.ErrorNotFound);

            await this._sessionDbContext.delete(id);

            this.logger.log(`Sessão ${id} deletada permanentemente.`);

            return Result.Ok();
        }
        catch (error) {
            this.logger.error(`Erro ao deletar sessão ${id}: ${error.message}`, error.stack);
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
            this.logger.error(`Erro na query FindByIdAsync (${id}): ${error.message}`, error.stack);
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
        catch (error) {
            this.logger.error(`Erro na query FindAllAsync: ${error.message}`, error.stack);
            return null;
        }
    }
}