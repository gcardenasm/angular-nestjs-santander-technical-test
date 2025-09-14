import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CandidateFormComponent } from './candidate-form.component';
import { CandidateService } from '../services/candidate.service';
import { CandidateStore } from '../services/candidate.store';
import { Candidate } from '../models/candidate';

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;

  const serviceMock = {
    uploadCandidate: jasmine.createSpy().and.returnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateFormComponent], // standalone
      providers: [
        CandidateStore,
        { provide: CandidateService, useValue: serviceMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function mockFile(name = 'cand.xlsx'): File {
    return new File(['dummy'], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  it('envía el formulario y llama al servicio con FormData', () => {
    const file = mockFile();
    component.form.patchValue({ name: 'Ada', surname: 'Lovelace', file });

    const returned: Candidate = {
      id: 1, name: 'Ada', surname: 'Lovelace',
      seniority: 'junior', years: 2, availability: true, createdAt: new Date()
    } as any;
    serviceMock.uploadCandidate.and.returnValue(of(returned));

    component.submit();

    expect(serviceMock.uploadCandidate).toHaveBeenCalledTimes(1);
    const sentFD = serviceMock.uploadCandidate.calls.mostRecent().args[0] as FormData;
    expect(sentFD.get('name')).toBe('Ada');
    expect(sentFD.get('surname')).toBe('Lovelace');
    expect((sentFD.get('file') as File).name).toBe('cand.xlsx');
  });

  it('no envía si el formulario es inválido', () => {
    component.form.reset();
    component.submit();
    expect(serviceMock.uploadCandidate).not.toHaveBeenCalled();
  });
});
