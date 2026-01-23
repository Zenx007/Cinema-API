import { ApiProperty } from "@nestjs/swagger";

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
}

export class SessionSaveVO {
    @ApiProperty()
    movieId: string;

    @ApiProperty()
    roomId: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty()
    price: number;
}