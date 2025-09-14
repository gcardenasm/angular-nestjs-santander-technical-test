import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757867813985 implements MigrationInterface {
    name = 'Init1757867813985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`candidates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(120) NOT NULL, \`surname\` varchar(120) NOT NULL, \`seniority\` enum ('junior', 'senior') NOT NULL, \`years\` int UNSIGNED NOT NULL, \`availability\` tinyint NOT NULL DEFAULT 0, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX \`IDX_11f2951d8383f3c871bd773aa6\` (\`name\`), INDEX \`IDX_49b031ba8f5f40a26d5ca80f72\` (\`surname\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_49b031ba8f5f40a26d5ca80f72\` ON \`candidates\``);
        await queryRunner.query(`DROP INDEX \`IDX_11f2951d8383f3c871bd773aa6\` ON \`candidates\``);
        await queryRunner.query(`DROP TABLE \`candidates\``);
    }

}
