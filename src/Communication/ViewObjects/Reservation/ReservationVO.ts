import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ReservationVO {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    seatId: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    expiresAt: Date;

    @ApiProperty()
    movie: string;
}

export class ReservationSaveVO {
    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'O usuário é obrigatório' })
    userId: string;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'O assento é obrigatório' })
    seatId: string;
}