import { Module } from "@nestjs/common";
import { Session } from "../Entities/Session/Session.entity";
import { Task } from "../../Helpers/CustomObjects/Task.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { List } from "../../Helpers/CustomObjects/List.Interface";

@Module({})
export abstract class ISessionRepository {
    abstract InsertAsync(model: Session): Task<Result<Session>>;
    abstract UpdateAsync(model: Session): Task<Result<Session>>;
    abstract DeleteAsync(id: string): Task<Result>;
    abstract FindByIdAsync(id: string): Task<Session | null>;
    abstract FindAllAsync(): Task<List<Session> | null>;
}