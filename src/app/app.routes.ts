import { Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { MetersComponent } from './meters/meters.component';

export const routes: Routes = [
  { path: '', redirectTo: 'connect', pathMatch: 'full' },
  { path: 'connect', component: ConnectComponent },
  { path: 'meters', component: MetersComponent }
];
