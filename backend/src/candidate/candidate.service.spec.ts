import { Test } from '@nestjs/testing';
import { CandidateService } from './candidate.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CandidateEntity } from './entities/candidate.entity';
import * as XLSX from 'xlsx';
import { NotFoundException } from '@nestjs/common';

function excelBuffer(rows: any[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('CandidateService', () => {
  let service: CandidateService;

  const qbMock = {
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const repo = {
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ id: 1, ...x })),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => qbMock),
    find: jest.fn(),
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

  // ---------- existentes ----------
  it('parsea con cabecera y persiste', async () => {
    const buf = excelBuffer([
      ['Seniority', 'Years of experience', 'Availability'],
      ['junior', 2, true],
    ]);
    const body = { name: 'Ada', surname: 'Lovelace' };
    const saved = await service.processCandidate(body as any, { buffer: buf } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(saved).toMatchObject({
      id: 1,
      name: 'Ada',
      seniority: 'junior',
      years: 2,
      availability: true,
    });
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
    await expect(service.processCandidate({} as any, null as any)).rejects.toThrow(
      'File is required',
    );
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

  it('remove elimina por id (affected > 0)', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(10)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(10);
  });

  it('remove lanza NotFound si affected = 0', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.delete).toHaveBeenCalledWith(999);
  });

  it('removeAll borra todos y devuelve el número de filas', async () => {
    qbMock.execute.mockResolvedValue({ affected: 5 });

    const deleted = await service.removeAll();

    expect(repo.createQueryBuilder).toHaveBeenCalled();
    expect(qbMock.delete).toHaveBeenCalled();
    expect(qbMock.from).toHaveBeenCalledWith(CandidateEntity);
    expect(qbMock.execute).toHaveBeenCalled();
    expect(deleted).toBe(5);
  });

  it('removeAll devuelve 0 si el driver no informa affected', async () => {
    qbMock.execute.mockResolvedValue({}); 

    const deleted = await service.removeAll();
    expect(deleted).toBe(0);
  });
});
