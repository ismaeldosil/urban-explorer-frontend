import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../../guards/auth.guard';

export const TABS_ROUTES: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'explore',
        loadComponent: () => import('./explore/explore.page').then(m => m.ExplorePage),
      },
      {
        path: 'search',
        loadComponent: () => import('./search/search.page').then(m => m.SearchPage),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./favorites/favorites.page').then(m => m.FavoritesPage),
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
        canActivate: [authGuard],
      },
      {
        path: '',
        redirectTo: 'explore',
        pathMatch: 'full',
      },
    ],
  },
];
