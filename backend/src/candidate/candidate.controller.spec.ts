import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { HTTP_CODE_METADATA } from '@nestjs/common/constants';

describe('CandidateController', () => {
  let ctrl: CandidateController;

  const service = {
    processCandidate: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
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
      expect.objectContaining({ buffer: expect.any(Buffer) }),
    );
    expect(res).toEqual(expected);
  });

  it('GET /candidates delega en servicio', async () => {
    const list = [{ id: 1 }];
    service.findAll.mockResolvedValue(list);

    const res = await ctrl.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(res).toEqual(list);
  });

  it('DELETE /candidates/:id delega en servicio con el id y devuelve 204', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(ctrl.removeOne(123)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(123);

    // Verifica que el método tenga @HttpCode(204)
    const status = Reflect.getMetadata(
      HTTP_CODE_METADATA,
      CandidateController.prototype.removeOne,
    );
    expect(status).toBe(204);
  });

  it('DELETE /candidates elimina todos y devuelve el contador', async () => {
    service.removeAll.mockResolvedValue(3);

    const res = await ctrl.removeAll();

    expect(service.removeAll).toHaveBeenCalled();
    expect(res).toEqual({ deleted: 3 });
  });
});
