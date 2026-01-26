import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Seat } from "../Seat/Seat.entity";

export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

@Entity('reservations')
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()   
    userId: string;

    @Column()
    seatId: string;

    @ManyToOne(() => Seat)
    @JoinColumn({ name: 'seatId' })
    seat: Seat;

    @Column({
        type: 'enum',
        enum: ReservationStatus,
        default: ReservationStatus.PENDING,
    })
    status: ReservationStatus;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    paidPrice: number;
}