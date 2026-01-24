import { ApiProperty } from "@nestjs/swagger";

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
}

export class ReservationSaveVO {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    seatId: string;
}