import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';       // ⬅️ iconos
import { CandidateFormComponent } from '../candidate-form/candidate-form.component';
import { CandidateStore } from '../services/candidate.store';

@Component({
  selector: 'app-candidates-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    CandidateFormComponent,
  ],
  templateUrl: './candidates-page.component.html',
  styleUrls: ['./candidates-page.component.scss']
})
export class CandidatesPageComponent {
  title = 'Candidate Loader';
  private store = inject(CandidateStore);

  displayed = ['name', 'surname', 'seniority', 'years', 'availability', 'actions'];
  candidates = computed(() => this.store.candidates());

  deleteAll() {
    if (this.candidates().length && confirm('Delete ALL candidates?')) {
      this.store.removeAll();
    }
  }

  deleteOne(id: number) {
    if (confirm('Delete this candidate?')) {
      this.store.remove(id);
    }
  }
}
