import { CandidateStore } from './candidate.store';
import { Candidate } from '../models/candidate';

describe('CandidateStore', () => {
  it('add y clear actualizan la señal', () => {
    const store = new CandidateStore();
    expect(store.candidates()).toEqual([]);

    const now = new Date();
    const c = { id: 1, name: 'Ada', surname: 'Lovelace', seniority: 'junior', years: 2, availability: true, createdAt: now } as Candidate;

    store.add(c);
    expect(store.candidates()).toEqual([c]);

    store.clear();
    expect(store.candidates()).toEqual([]);
  });
});
