import { Controller, Get, Res, Req, Query, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response, Request } from "express";
import { SeatVO } from "../../Communication/ViewObjects/Seat/SeatVO";
import { ISeatService } from "../../Core/ServicesInterface/ISeatService.interface";
import { ConstantsMessagesSeat } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { StatusCode, StatusCodes } from "../../Helpers/StatusCode/StatusCode";
import { ApiResponse } from "../../Helpers/CustomObjects/ApiResponse.interface";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";

@ApiTags('Seats') 
@Controller("Seat")
export class SeatController {
    constructor(
        private readonly _seatService: ISeatService,
    ) { }

    @ApiOperation({ summary: 'GetAvailable - Lista apenas assentos disponiveis de uma sessão' })
    @Get('GetAvailable')
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(2)
    async GetAvailableAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Query('sessionId') sessionId: string
    ) {
        const response = new ApiResponse<List<SeatVO>>();
        try {
            const result = await this._seatService.GetAvailableBySession(sessionId);

            if (result.isFailed) {
                response.success = false;
                response.message = result.errors[0];
                return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
            }

            response.success = true;
            response.object = result.value;

            return StatusCode(res, StatusCodes.STATUS_200_OK, response);

        } catch (error) {
            response.success = false;
            response.message = ConstantsMessagesSeat.ErrorFindAll;
            return StatusCode(res, StatusCodes.STATUS_500_INTERNAL_SERVER_ERROR, response);
        }
    }
}