import { Component, EventEmitter, Output, AfterViewInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';

import { CandidateService } from '../services/candidate.service';
import { CandidateStore } from '../services/candidate.store';
import { Candidate } from '../models/candidate';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss'],
})
export class CandidateFormComponent implements AfterViewInit {
  @Output() candidateAdded = new EventEmitter<Candidate>();

  private fb = inject(FormBuilder);
  private api = inject(CandidateService);
  private store = inject(CandidateStore);

  form = this.fb.group({
    name: ['', Validators.required],
    surname: ['', Validators.required],
    file: [null as File | null, Validators.required],
  });

  loading = false;
  entered = false;

  ngAfterViewInit() {
    // dispara transición CSS local
    requestAnimationFrame(() => (this.entered = true));
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0] ?? null;
    this.form.patchValue({ file });
    this.form.controls.file.markAsTouched();
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;

    const fd = new FormData();
    fd.append('name', this.form.value.name!);
    fd.append('surname', this.form.value.surname!);
    if (this.form.value.file) fd.append('file', this.form.value.file);

    this.api.uploadCandidate(fd).pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: (c) => {
        // ✅ Estado inmutable y centralizado
        this.store.add(c);
        this.candidateAdded.emit(c);
        this.form.reset();

        // micro “pulse” visual
        this.entered = false;
        requestAnimationFrame(() => (this.entered = true));
      },
      error: (err) => console.error('Error uploading candidate:', err),
    });
  }
}
