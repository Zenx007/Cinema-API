import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Reservation Module - Concurrency Integrity (E2E)', () => {
    let app: INestApplication;
    let targetSeatId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const sessionRes = await request(app.getHttpServer())
            .post('/Session/Create')
            .send({ 
                movie: 'Concurrency Stress Test', 
                room: 'Lab-01', 
                price: 20, 
                numberOfSeats: 16 ,
                startTime: '20:00'
            });

        const sessionVO = sessionRes.body.object;
        
        const seatsRes = await request(app.getHttpServer())
            .get(`/Seat/GetAvailable?sessionId=${sessionVO.id}`);

        targetSeatId = seatsRes.body.object[0].id;
    });

    it('should ensure atomicity: only one reservation succeeds among simultaneous requests', async () => {

        const clientA = { userId: 'Joao', seatId: targetSeatId };
        const clientB = { userId: 'Maria', seatId: targetSeatId };

        console.log(`[INFO] Initiating parallel reservation requests for Seat ID: ${targetSeatId}`);

        const [responseA, responseB] = await Promise.all([
            request(app.getHttpServer()).post('/Reservation/Create').send(clientA),
            request(app.getHttpServer()).post('/Reservation/Create').send(clientB),
        ]);

        console.log(`[DEBUG] Request A Result: HTTP ${responseA.status}`);
        console.log(`[DEBUG] Request B Result: HTTP ${responseB.status}`);

        const responses = [responseA, responseB];

        const successCount = responses.filter(r => 
            r.status === HttpStatus.CREATED || r.status === HttpStatus.OK
        ).length;

        const failCount = responses.filter(r => 
            r.status === HttpStatus.BAD_REQUEST || r.status === HttpStatus.CONFLICT
        ).length;

        expect(successCount).toBe(1);
        expect(failCount).toBe(1);
    });

    afterAll(async () => {
        await app.close();
    });
});