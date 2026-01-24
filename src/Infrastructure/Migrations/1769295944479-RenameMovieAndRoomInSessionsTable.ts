import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameMovieAndRoomInSessionsTable1769295944479 implements MigrationInterface {
    name = 'RenameMovieAndRoomInSessionsTable1769295944479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "movieId"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "roomId"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "movie" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "room" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "room"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "movie"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "startTime" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "roomId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "movieId" character varying NOT NULL`);
    }

}
