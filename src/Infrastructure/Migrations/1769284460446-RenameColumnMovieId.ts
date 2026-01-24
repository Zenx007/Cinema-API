import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameColumnMovieId1769284460446 implements MigrationInterface {
    name = 'RenameColumnMovieId1769284460446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" RENAME COLUMN "movideo" TO "movieId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" RENAME COLUMN "movieId" TO "movideo"`);
    }

}
