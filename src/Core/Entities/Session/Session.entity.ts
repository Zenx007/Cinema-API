import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Seat } from "../Seat/Seat.entity";

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    movieId: string;

    @Column()
    roomId: string;

    @Column()
    startTime: Date;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @OneToMany(() => Seat, (seat) => seat.session, { cascade: true })
    seats: Seat[];
}