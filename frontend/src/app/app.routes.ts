import { Routes } from '@angular/router';
import { CandidatesPageComponent } from './candidates-page/candidates-page.component';
import { candidatesResolver } from './candidates.resolver';

export const routes: Routes = [
  {
    path: '',
    component: CandidatesPageComponent,
    resolve: { preloaded: candidatesResolver } 
  },
];
