import { Injectable, signal } from '@angular/core';
import { Candidate } from '../models/candidate';

@Injectable({ providedIn: 'root' })
export class CandidateStore {
  readonly candidates = signal<Candidate[]>([]);

  setAll(list: Candidate[]) {
    this.candidates.set(list ?? []);
  }

  add(c: Candidate) {
    this.candidates.update(list => [c, ...list]);
  }

  clear() {
    this.candidates.set([]);
  }
}
