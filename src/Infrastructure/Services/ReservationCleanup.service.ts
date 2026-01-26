import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {ReservationStatus } from '../../Core/Entities/Reservation/Reservation.entity';
import {SeatStatus } from '../../Core/Entities/Seat/Seat.entity';
import { IReservationCleanupService } from '../../Core/ServicesInterface/IReservationCleanupService.interface';
import { ISeatRepository } from '../../Core/RepositoriesInterface/ISeatRepository.interface';
import { IReservationRepository } from '../../Core/RepositoriesInterface/IReservationRepository.interface';

@Injectable()
export class ReservationCleanupService extends IReservationCleanupService {
    private readonly logger = new Logger(ReservationCleanupService.name);

    constructor(
        private readonly reservationRepo: IReservationRepository,
        private readonly seatRepo: ISeatRepository,
    ) {
        super();
    }

    @Cron('*/5 * * * * *') 
    async ProcessExpiredReservations(): Promise<void> {
        try {
            const now = new Date();
            
            const expiredReservations = await this.reservationRepo.FindExpiredAsync(now);

            if (!expiredReservations || expiredReservations.length === 0) {
                return;
            }

            this.logger.debug(`Encontradas ${expiredReservations.length} reservas expiradas. Iniciando limpeza...`);

            for (const reservation of expiredReservations) {
                reservation.status = ReservationStatus.CANCELLED; 
                await this.reservationRepo.UpdateAsync(reservation);

                if (reservation.seat) {
                    reservation.seat.status = SeatStatus.AVAILABLE;
                    await this.seatRepo.UpdateAsync(reservation.seat);
                    
                    this.logger.log(`[CLEANUP] Assento ${reservation.seat.id} liberado. Reserva ${reservation.id} expirou.`);
                } else {
                    this.logger.warn(`Reserva expirada ${reservation.id} não tinha assento vinculado.`);
                }
            }
        } catch (error) {
            this.logger.error(`Erro fatal no Job de Cleanup: ${error.message}`, error.stack);
        }
    }
  }