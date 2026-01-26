import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class SessionVO {
    @ApiProperty()
    id: string;

    @ApiProperty()
    movie: string;

    @ApiProperty()
    room: string;

    @ApiProperty()
    startTime: string;

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

    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => String(value))
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
        message: 'O horário deve estar no formato HH:MM (ex: 18:30)' 
    })
    startTime: string;
}

export class SessionUpdateVO {

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'O ID da sessão é obrigatório' })
    id: string;
    
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

    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
        message: 'O horário deve estar no formato HH:MM (ex: 18:30)' 
    })
    startTime: string;
}