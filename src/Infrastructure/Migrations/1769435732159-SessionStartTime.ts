import { MigrationInterface, QueryRunner } from "typeorm";

export class SessionStartTime1769435732159 implements MigrationInterface {
    name = 'SessionStartTime1769435732159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "start_time" TIME NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "start_time"`);
    }

}
