import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1769133432430 implements MigrationInterface {
    name = 'InitialMigration1769133432430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "movideo" character varying NOT NULL, "roomId" character varying NOT NULL, "startTime" TIMESTAMP NOT NULL, "price" numeric(10,2) NOT NULL, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "seats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "row" character varying NOT NULL, "number" integer NOT NULL, "status" "public"."seats_status_enum" NOT NULL DEFAULT 'AVAILABLE', "sessionId" uuid NOT NULL, "version" integer NOT NULL, CONSTRAINT "PK_3fbc74bb4638600c506dcb777a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "seatId" uuid NOT NULL, "status" "public"."reservations_status_enum" NOT NULL DEFAULT 'PENDING', "expiresAt" TIMESTAMP NOT NULL, "paidPrice" numeric(10,2) NOT NULL, CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "seats" ADD CONSTRAINT "FK_c0489065c4695958dbf26cffdb2" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_9ca8462dd93d9e80423ea888976" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_9ca8462dd93d9e80423ea888976"`);
        await queryRunner.query(`ALTER TABLE "seats" DROP CONSTRAINT "FK_c0489065c4695958dbf26cffdb2"`);
        await queryRunner.query(`DROP TABLE "reservations"`);
        await queryRunner.query(`DROP TABLE "seats"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
    }

}
