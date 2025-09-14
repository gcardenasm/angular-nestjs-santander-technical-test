import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateModule } from '../src/candidate/candidate.module';
import { CandidateEntity } from '../src/candidate/entities/candidate.entity';
import * as XLSX from 'xlsx';

function excelBuffer(rows: any[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [CandidateEntity],
          synchronize: true,
        }),
        CandidateModule,
      ],
    }).compile();

    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST + GET candidates', async () => {
    const buf = excelBuffer([
      ['Seniority','Years of experience','Availability'],
      ['junior', 2, true],
    ]);

    // Subir candidato
    await request(app.getHttpServer())
      .post('/candidates')
      .field('name', 'Ada')
      .field('surname', 'Lovelace')
      .attach('file', buf, 'cand.xlsx')
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.name).toBe('Ada');
        expect(body.seniority).toBe('junior');
      });

    // Listar
    await request(app.getHttpServer())
      .get('/candidates')
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(1);
        expect(body[0].name).toBe('Ada');
      });
  });
});
