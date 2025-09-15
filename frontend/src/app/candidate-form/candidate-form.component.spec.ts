import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CandidateFormComponent } from './candidate-form.component';
import { CandidateService } from '../services/candidate.service';
import { CandidateStore } from '../services/candidate.store';

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let serviceMock: { uploadCandidate: jasmine.Spy };

  beforeEach(async () => {
    // 👇 nuevo spy por test (o podrías resetear en afterEach)
    serviceMock = {
      uploadCandidate: jasmine.createSpy('uploadCandidate').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [CandidateFormComponent],
      providers: [
        CandidateStore,
        { provide: CandidateService, useValue: serviceMock }
      ],
    }).compileComponents();

    component = TestBed.createComponent(CandidateFormComponent).componentInstance;
  });

  function mockFile(name = 'cand.xlsx') {
    return new File(['dummy'], name, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  it('envía el formulario y llama al servicio con FormData', () => {
    const file = mockFile();
    component.form.patchValue({ name: 'Ada', surname: 'Lovelace', file });

    const returned: any = { id: 1, name: 'Ada' };
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