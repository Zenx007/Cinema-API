import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SessionVO {
    @ApiProperty()
    id: string;

    @ApiProperty()
    movie: string;

    @ApiProperty()
    roomId: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty()
    price: number;

    @ApiProperty()
    numberOfSeats: number;
}

export class SessionSaveVO {
    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'O nome do filme é obrigatório' })
    movie: string;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'O nome da sala é obrigatória' })
    room: string;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'O preço do ingresso é obrigatório' })
    @IsNumber({}, { message: 'O preço do ingresso deve ser um número' })
    price: number;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'O número de assentos é obrigatório' })
    @IsNumber({}, { message: 'O número de assentos deve ser um número' })
    numberOfSeats: number;
}