import { inject, Injectable, signal } from '@angular/core';
import { Candidate } from '../models/candidate';
import { CandidateService } from './candidate.service';

@Injectable({ providedIn: 'root' })
export class CandidateStore {
  private readonly _candidates = signal<Candidate[]>([]);
  private readonly api = inject(CandidateService);
  
  readonly candidates = this._candidates.asReadonly();
  

  setAll(list: Candidate[]) {
    this._candidates.set(list ?? []);
  }

  add(c: Candidate) {
    this._candidates.update(list => [c, ...list]);
  }

  remove(id: number) {
    const prev = this._candidates();
    this._candidates.set(prev.filter(c => c.id !== id));

    this.api.delete(id).subscribe({
      error: err => {
        console.error('delete failed; rolling back', err);
        this._candidates.set(prev);
      }
    });
  }


  removeAll() {
    const prev = this._candidates();
    this._candidates.set([]);

    this.api.deleteAll().subscribe({
      next: () => { },
      error: err => {
        console.error('deleteAll failed; rolling back', err);
        this._candidates.set(prev);
      }
    });
  }
}
