import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CandidateStore } from './candidate.store';
import { CandidateService } from './candidate.service';
import { Candidate } from '../models/candidate';

describe('CandidateStore', () => {
  let store: CandidateStore;
  let api: jasmine.SpyObj<CandidateService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<CandidateService>('CandidateService', [
      'delete',
      'deleteAll',
      'getAll',
      'uploadCandidate',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CandidateStore,
        { provide: CandidateService, useValue: api },
      ],
    });

    store = TestBed.inject(CandidateStore);
  });

  it('add inserta en cabeza', () => {
    expect(store.candidates()).toEqual([]);

    const now = new Date();
    const c = {
      id: 1,
      name: 'Ada',
      surname: 'Lovelace',
      seniority: 'junior',
      years: 2,
      availability: true,
      createdAt: now,
    } as Candidate;

    store.add(c);
    expect(store.candidates()).toEqual([c]);
  });

  it('remove quita por id y hace rollback si falla', fakeAsync(() => {
    const a = { id: 1 } as any, b = { id: 2 } as any;
    store.setAll([a, b]);

    api.delete.and.returnValue(throwError(() => new Error('boom')));

    store.remove(1);
    flush();

    expect(store.candidates()).toEqual([a, b]); // rollback
    expect(api.delete).toHaveBeenCalledWith(1);
  }));

  it('removeAll vacía y hace rollback si falla', fakeAsync(() => {
    const a = { id: 1 } as any;
    store.setAll([a]);

    api.deleteAll.and.returnValue(throwError(() => new Error('boom')));

    store.removeAll();
    flush();

    expect(store.candidates()).toEqual([a]); // rollback
    expect(api.deleteAll).toHaveBeenCalled();
  }));

  it('remove elimina definitivamente cuando la API ok', fakeAsync(() => {
    const a = { id: 1 } as any, b = { id: 2 } as any;
    store.setAll([a, b]);
    api.delete.and.returnValue(of(void 0));

    store.remove(1);
    flush();

    expect(store.candidates()).toEqual([b]);
  }));

  it('removeAll deja vacío cuando la API ok', fakeAsync(() => {
    const a = { id: 1 } as any;
    store.setAll([a]);
    api.deleteAll.and.returnValue(of({ deleted: 1 }));

    store.removeAll();
    flush();

    expect(store.candidates()).toEqual([]);
  }));
});
