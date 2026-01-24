import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Seat } from "../Seat/Seat.entity";

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    movie: string;

    @Column()
    room: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @OneToMany(() => Seat, (seat) => seat.session, { cascade: true })
    seats: Seat[];
}