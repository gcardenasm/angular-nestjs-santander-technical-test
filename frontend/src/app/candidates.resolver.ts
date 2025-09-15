import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CandidateService } from './services/candidate.service';
import { CandidateStore } from './services/candidate.store';
import { catchError, tap } from 'rxjs/operators';
import { of, take } from 'rxjs';
import { Candidate } from './models/candidate';

export const candidatesResolver: ResolveFn<Candidate[]> = () => {
  const api = inject(CandidateService);
  const store = inject(CandidateStore);
  return api.getAll().pipe(
    take(1),
    tap(list => store.setAll(list)),
    catchError(err => {
      console.error('Resolver failed loading candidates:', err);
      store.setAll([]);
      return of([] as Candidate[]);
    })
  );
};
