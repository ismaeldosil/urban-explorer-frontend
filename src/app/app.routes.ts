import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./presentation/pages/tabs/tabs.routes').then((m) => m.TABS_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./presentation/pages/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
];
