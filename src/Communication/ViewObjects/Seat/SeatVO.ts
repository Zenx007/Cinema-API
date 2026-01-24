import { ApiProperty } from "@nestjs/swagger";

export class SeatVO {
    @ApiProperty()
    id: string;

    @ApiProperty()
    row: string;

    @ApiProperty()
    number: number;

    @ApiProperty()
    status: string;

    @ApiProperty()
    sessionId: string;
}