import { Module } from "@nestjs/common";
import { Result } from "../../Helpers/CustomObjects/Result";
import { SessionSaveVO, SessionVO } from "../../Communication/ViewObjects/Session/SessionVO";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";


@Module({})
export abstract class ISessionService {
    abstract CreateAsync (model: SessionSaveVO): Task<Result<SessionVO>>;
    abstract UpdateAsync (model: SessionVO): Task<Result<SessionVO>>;
    abstract DeleteAsync(id: string): Task<Result>;
    abstract GetById (id: string): Task<Result<SessionVO>>;
    abstract GetAll (): Task<Result<List<SessionVO>>>;
}