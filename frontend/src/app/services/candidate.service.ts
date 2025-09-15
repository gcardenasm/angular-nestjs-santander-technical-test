import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly apiUrl = `${environment.apiBaseUrl}/candidates`;
  private readonly http = inject(HttpClient);

  getAll(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }

  /**
   * Sends candidate data along with an Excel file to the backend.  The backend
   * responds with a merged candidate object.
   */
  uploadCandidate(formData: FormData): Observable<Candidate> {
    console.log('Uploading candidate with formData:', formData);
    return this.http.post<Candidate>(this.apiUrl, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteAll(): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(this.apiUrl);
  }
}