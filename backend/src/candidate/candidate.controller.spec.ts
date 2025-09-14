import { Test } from '@nestjs/testing';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

describe('CandidateController', () => {
  let ctrl: CandidateController;
  const service = {
    processCandidate: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      controllers: [CandidateController],
      providers: [{ provide: CandidateService, useValue: service }],
    }).compile();

    ctrl = mod.get(CandidateController);
    jest.clearAllMocks();
  });

  it('POST /candidates llama al servicio con body y file', async () => {
    const body = { name: 'A', surname: 'B' } as any;
    const file = { buffer: Buffer.from([]) } as any;
    const expected = { id: 1, ...body, seniority: 'junior', years: 1, availability: true };
    service.processCandidate.mockResolvedValue(expected);
    const res = await ctrl.uploadCandidate(file, body); 
    expect(service.processCandidate).toHaveBeenCalledWith(
      body,
      expect.objectContaining({ buffer: expect.any(Buffer) })
    );

    expect(res).toEqual(expected);
  });

  it('GET /candidates delega en servicio', async () => {
    const list = [{ id: 1 }];
    service.findAll.mockResolvedValue(list);
    const res = await ctrl.findAll();
    expect(res).toEqual(list);
  });
});
