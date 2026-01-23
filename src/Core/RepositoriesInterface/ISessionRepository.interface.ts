import { Module } from "@nestjs/common";
import { List } from "src/Helpers/CustomObjects/List.Interface";
import { Result } from "src/Helpers/CustomObjects/Result";
import { Task } from "src/Helpers/CustomObjects/Task.Interface";
import { Session } from "../Entities/Session/Session.entity";

@Module({})
export abstract class ISessionRepository {
    abstract InsertAsync(model: Session): Task<Result<Session>>;
    abstract UpdateAsync(model: Session): Task<Result<Session>>;
    abstract DeleteAsync(id: string): Task<Result>;
    abstract FindByIdAsync(id: string): Task<Session | null>;
    abstract FindAllAsync(): Task<List<Session> | null>;
}