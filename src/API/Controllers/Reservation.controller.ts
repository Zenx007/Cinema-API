import { Controller, Get, Res, Req, Post, Body, Query, Put, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { ReservationSaveVO, ReservationVO } from "../../Communication/ViewObjects/Reservation/ReservationVO";
import { IReservationService } from "../../Core/ServicesInterface/IReservationService.interface";
import { ConstantsMessagesReservation } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { StatusCode, StatusCodes } from "../../Helpers/StatusCode/StatusCode";
import { ApiResponse } from "../../Helpers/CustomObjects/ApiResponse.interface";

@ApiTags('Reservations') 
@Controller("Reservation")
export class ReservationController {
    constructor(
        private readonly _reservationService: IReservationService,
    ) { }

    @ApiOperation({ summary: 'Getall - Lista todas as reservas' })
    @Get('GetAll')
    async GetAllAsync(
        @Res() res: Response,
        @Req() req: Request) {
        const response = new ApiResponse<List<ReservationVO>>();
        try {

            const list = await this._reservationService.GetAll();
            if (list.isFailed) {
                response.success = false;
                response.message = list.errors[0];
                return StatusCode(res, StatusCodes.STATUS_404_NOT_FOUND, response);
            }

            response.success = true;
            response.object = list.value;

            return StatusCode(res, StatusCodes.STATUS_200_OK, response);

        }
        catch (error) {

            response.success = false;
            response.message = ConstantsMessagesReservation.ErrorGetAll;
            return StatusCode(
                res,
                StatusCodes.STATUS_500_INTERNAL_SERVER_ERROR,
                response);
        }
    }

    @ApiOperation({ summary: 'Create - Cria uma nova reserva' })
    @Post('Create')
    async CreateAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Body() model: ReservationSaveVO,
    ) {
        const response = new ApiResponse<ReservationVO>();
        try {
            const result = await this._reservationService.CreateAsync(model);
            if (result.isFailed) {
                response.object = null,
                response.message = result.errors[0],
                response.success = false;

                return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
            }

            response.object = result.value,
            response.success = true;

            return StatusCode(res, StatusCodes.STATUS_201_CREATED, response);
        }
        catch (error) {

            response.object = null,
            response.message = ConstantsMessagesReservation.ErrorCreate,
            response.success = false;

            return StatusCode(res, StatusCodes.STATUS_500_INTERNAL_SERVER_ERROR, response);
        }
    }

    @ApiOperation({ summary: 'Prepare - Busca uma reserva por ID' })
    @Get('Prepare')
    async PrepareAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Query('id') id: string,
    ) {
        const response = new ApiResponse<ReservationVO>();
        try {
            const result = await this._reservationService.GetById(id);

            if (result.isFailed) {
                response.object = null,
                response.message = result.errors[0],
                response.success = false;

                return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
            }

            response.object = result.value,
            response.success = true;

            return StatusCode(res, StatusCodes.STATUS_200_OK, response);
        }
        catch (error) {
            response.message = ConstantsMessagesReservation.ErrorPrepare,
            response.object = null,
            response.success = false;

            return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
        }
    }

    @ApiOperation({ summary: 'Update - Atualiza status da reserva' })
    @Put('Update')
    async UpdateAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Body() model: ReservationVO,
    ) {
        const response = new ApiResponse<ReservationVO>();
        try {
            const result = await this._reservationService.UpdateAsync(model);

            if (result.isFailed) {
                response.object = null,
                response.message = result.errors[0],
                response.success = false;

                return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST)
            }

            response.object = result.value,
            response.success = true;

            return StatusCode(res, StatusCodes.STATUS_200_OK, response);
        }
        catch (error) {
            response.object = null,
            response.message = ConstantsMessagesReservation.ErrorUpdate;
            response.success = false;

            return StatusCode(res, StatusCodes.STATUS_500_INTERNAL_SERVER_ERROR, response);
        }
    }

    @ApiOperation({ summary: 'Delete - Cancela/Remove uma reserva' })
    @Delete('Delete')
    async DeleteAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Query('id') id: string, 
    ) {
        const response = new ApiResponse<Result>();
        try {
            const result = await this._reservationService.DeleteAsync(id);

            if (result.isFailed) {
                response.object = null,
                response.message = result.errors[0],
                response.success = false;

                return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
            }

            response.object = result,
            response.success = true;

            return StatusCode(res, StatusCodes.STATUS_200_OK, response);
        }
        catch (error) {
            response.message = ConstantsMessagesReservation.ErrorDelete,
            response.object = null,
            response.success = false;

            return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
        }
    }
}