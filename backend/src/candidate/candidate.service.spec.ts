import { Test } from '@nestjs/testing';
import { CandidateService } from './candidate.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CandidateEntity } from './entities/candidate.entity';
import * as XLSX from 'xlsx';

function excelBuffer(rows: any[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('CandidateService', () => {
  let service: CandidateService;
  const repo = {
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ id: 1, ...x })),
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: getRepositoryToken(CandidateEntity), useValue: repo },
      ],
    }).compile();
    service = mod.get(CandidateService);
    jest.clearAllMocks();
  });

  it('parsea con cabecera y persiste', async () => {
    const buf = excelBuffer([
      ['Seniority', 'Years of experience', 'Availability'],
      ['junior', 2, true],
    ]);
    const body = { name: 'Ada', surname: 'Lovelace' };
    const saved = await service.processCandidate(body as any, { buffer: buf } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(saved).toMatchObject({ id: 1, name: 'Ada', seniority: 'junior', years: 2, availability: true });
  });

  it('acepta coma decimal en years', async () => {
    const buf = excelBuffer([
      ['Seniority', 'Years of experience', 'Availability'],
      ['senior', '2,5', 'yes'],
    ]);
    const body = { name: 'Linus', surname: 'T' };
    const saved = await service.processCandidate(body as any, { buffer: buf } as any);
    expect(saved.years).toBeCloseTo(2.5);
    expect(saved.availability).toBe(true);
  });

  it('lanza error si falta file', async () => {
    await expect(service.processCandidate({} as any, null as any)).rejects.toThrow('File is required');
  });

  it('lanza error por seniority inválido', async () => {
    const buf = excelBuffer([
      ['Seniority', 'Years of experience', 'Availability'],
      ['mid', 3, true],
    ]);
    await expect(
      service.processCandidate({ name: 'a', surname: 'b' } as any, { buffer: buf } as any),
    ).rejects.toThrow(/Seniority must be "junior" or "senior"/);
  });
});
