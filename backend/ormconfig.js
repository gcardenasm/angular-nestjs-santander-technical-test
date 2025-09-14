"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const candidate_entity_1 = require("./src/candidate/entities/candidate.entity");
require("dotenv/config");
exports.default = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [candidate_entity_1.CandidateEntity],
    migrations: ['src/migrations/*.ts'],
});
//# sourceMappingURL=ormconfig.js.map