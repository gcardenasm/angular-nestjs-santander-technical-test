import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CandidateService } from './candidate.service';

describe('CandidateService', () => {
  let service: CandidateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CandidateService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CandidateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll hace GET /candidates', () => {
    service.getAll().subscribe();
    const req = http.expectOne('/api/candidates');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deleteAll hace DELETE /api/candidates', () => {
    service.deleteAll().subscribe(res => {
      expect(res).toEqual({ deleted: 3 });
    });
    const req = http.expectOne('/api/candidates');
    expect(req.request.method).toBe('DELETE');
    req.flush({ deleted: 3 });
  });

  it('delete(id) hace DELETE /api/candidates/:id', () => {
    service.delete(42).subscribe(res => {
      expect(res).toBeNull();               
    });
    const req = http.expectOne('/api/candidates/42');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);                        
  });
});
