import { Controller, Get, Res, Req, Post, Body, Query, Put, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { SessionVO, SessionSaveVO } from "../../Communication/ViewObjects/Session/SessionVO";
import { ISessionService } from "../../Core/ServicesInterface/ISessionService.interface";
import { ConstantsMessagesSession } from "../../Helpers/ConstantsMessages/ConstantsMessages";
import { List } from "../../Helpers/CustomObjects/List.Interface";
import { Result } from "../../Helpers/CustomObjects/Result";
import { StatusCode, StatusCodes } from "../../Helpers/StatusCode/StatusCode";
import { ApiResponse } from "../../Helpers/CustomObjects/ApiResponse.interface";

@ApiTags('Sessions') 
@Controller("Session")
export class SessionController {
    constructor(
        private readonly _sessionService: ISessionService,
    ) { }

    @ApiOperation({ summary: 'Getall - Lista todas as sessões' })
    @Get('GetAll')
    async GetAllAsync(
        @Res() res: Response,
        @Req() req: Request) {
        const response = new ApiResponse<List<SessionVO>>();
        try {

            const list = await this._sessionService.GetAll();
            if (list.isFailed) {
                response.success = false,
                response.message = list.errors[0];
                return StatusCode(res, StatusCodes.STATUS_404_NOT_FOUND, response);
            }

            response.success = true;
            response.object = list.value;

            return StatusCode(res, StatusCodes.STATUS_200_OK, response);

        }
        catch (error) {

            response.success = false;
            response.message = ConstantsMessagesSession.ErrorGetAll;
            return StatusCode(
                res,
                StatusCodes.STATUS_500_INTERNAL_SERVER_ERROR,
                response);
        }
    }

    @ApiOperation({ summary: 'Create - Cria uma nova sessão' })
    @Post('Create')
    async CreateAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Body() model: SessionSaveVO,
    ) {
        const response = new ApiResponse<SessionVO>();
        try {
            const result = await this._sessionService.CreateAsync(model);
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
            response.message = ConstantsMessagesSession.ErrorCreate,
            response.success = false;

            return StatusCode(res, StatusCodes.STATUS_500_INTERNAL_SERVER_ERROR, response);
        }
    }

    @ApiOperation({ summary: 'Prepare - Busca uma sessão por ID' })
    @Get('Prepare')
    async PrepareAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Query('id') id: string,
    ) {
        const response = new ApiResponse<SessionVO>();
        try {
            const result = await this._sessionService.GetById(id);

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
            response.message = ConstantsMessagesSession.ErrorPrepare,
            response.object = null,
            response.success = false;

            return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
        }
    }

    @ApiOperation({ summary: 'Update - Atualiza uma sessão' })
    @Put('Update')
    async UpdateAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Body() model: SessionVO,
    ) {
        const response = new ApiResponse<SessionVO>();
        try {
            const result = await this._sessionService.UpdateAsync(model);

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
            response.message = ConstantsMessagesSession.ErrorUpdate;
            response.success = false;

            return StatusCode(res, StatusCodes.STATUS_500_INTERNAL_SERVER_ERROR, response);
        }
    }

    @ApiOperation({ summary: 'Delete - Deleta uma sessão' })
    @Delete('Delete')
    async DeleteAsync(
        @Res() res: Response,
        @Req() req: Request,
        @Query('id') id: string, 
    ) {
        const response = new ApiResponse<Result>();
        try {
            const result = await this._sessionService.DeleteAsync(id);

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
            response.message = ConstantsMessagesSession.ErrorDelete,
                response.object = null,
                response.success = false;

            return StatusCode(res, StatusCodes.STATUS_400_BAD_REQUEST, response);
        }
    }
}