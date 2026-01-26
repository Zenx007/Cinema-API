import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class NotificationConsumerController {
    private readonly logger = new Logger(NotificationConsumerController.name);

    @EventPattern('reservation_created')
    async handleReservationCreated(@Payload() data: any, @Ctx() context: RmqContext) {

        this.logger.log(`[RABBITMQ CONSUMER] Nova reserva recebida!`);
        this.logger.log(`Simulando envio de e-mail para User: ${data.userId}...`);

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg);
    }

    @EventPattern('payment_confirmed')
    async handlePaymentConfirmed(@Payload() data: any, @Ctx() context: RmqContext) {
        this.logger.log(`[RABBITMQ CONSUMER] Pagamento Confirmado: ${data.reservationId}`);
        this.logger.log(`Gerando Nota Fiscal e enviando QR Code...`);

        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        channel.ack(originalMsg);
    }

    @EventPattern('reservation_expired')
    async handleReservationExpired(@Payload() data: any, @Ctx() context: RmqContext) {
        this.logger.warn(`[RABBITMQ] Reserva expirada: ${data.reservationId}. Enviando email de 'Você perdeu a vez'.`);
        context.getChannelRef().ack(context.getMessage());
    }

    @EventPattern('seat_released')
    async handleSeatReleased(@Payload() data: any, @Ctx() context: RmqContext) {
        this.logger.debug(`[RABBITMQ] Assento liberado: ${data.seatId}. Notificar usuários na lista de espera.`);
        context.getChannelRef().ack(context.getMessage());
    }

}