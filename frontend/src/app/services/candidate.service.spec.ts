import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CandidateService } from './candidate.service';

describe('CandidateService', () => {
  let svc: CandidateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CandidateService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    svc = TestBed.inject(CandidateService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll hace GET /candidates', () => {
    svc.getAll().subscribe(res => { /* asserts */ });
    const req = http.expectOne('/api/candidates'); // ✅ ahora coincide
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
