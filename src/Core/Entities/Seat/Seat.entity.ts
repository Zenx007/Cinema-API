import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, VersionColumn } from "typeorm";
import { Version } from "@nestjs/common";
import { Session } from "../Session/Session.entity";

export enum SeatStatus {
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'LOCKED',
    SOLD = 'SOLD',
}

@Entity('seats')
export class Seat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    row: string;

    @Column()
    number: number;

    @Column({
        type: 'enum',
        enum: SeatStatus,
        default: SeatStatus.AVAILABLE,
    })
    status: SeatStatus;

    @Column()
    sessionId: string;

    @ManyToOne(() => Session, (session) => session.seats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sessionId' })
    session: Session;

    @VersionColumn()
    version: number;

}