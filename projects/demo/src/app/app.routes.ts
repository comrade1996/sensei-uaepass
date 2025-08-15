import { Routes } from '@angular/router';
import { UaePassCallbackComponent } from 'sensei-uaepass';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'uae-pass/callback',
    component: UaePassCallbackComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
