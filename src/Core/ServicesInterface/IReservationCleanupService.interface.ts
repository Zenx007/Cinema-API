import { Module } from "@nestjs/common";

@Module({})
export abstract class IReservationCleanupService {
    abstract ProcessExpiredReservations(): Promise<void>;
}