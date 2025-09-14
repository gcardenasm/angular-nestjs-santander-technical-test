import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CandidateFormComponent } from '../candidate-form/candidate-form.component';
import { CandidateStore } from '../services/candidate.store';


@Component({
  selector: 'app-candidates-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, CandidateFormComponent],
  templateUrl: './candidates-page.component.html',
  styleUrls: ['./candidates-page.component.scss'] 
})
export class CandidatesPageComponent {
  title = 'Candidate Loader';
  private store = inject(CandidateStore);

  displayed = ['name', 'surname', 'seniority', 'years', 'availability'];
  candidates = computed(() => this.store.candidates());

  clear() {
    this.store.clear();
  }
}
