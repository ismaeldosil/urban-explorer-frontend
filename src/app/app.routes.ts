import { Routes } from '@angular/router';
import { authGuard } from './presentation/guards/auth.guard';

export const routes: Routes = [
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
  {
    path: 'locations',
    loadComponent: () =>
      import('./presentation/pages/location-list/location-list.page').then(
        (m) => m.LocationListPage
      ),
  },
  {
    path: 'location/:id',
    loadComponent: () =>
      import('./presentation/pages/location-detail/location-detail.page').then(
        (m) => m.LocationDetailPage
      ),
  },
  {
    path: 'location/:id/review',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./presentation/pages/location-detail/write-review.page').then(
        (m) => m.WriteReviewPage
      ),
  },
  {
    path: 'location/:id/reviews',
    loadComponent: () =>
      import('./presentation/pages/location-detail/location-reviews.page').then(
        (m) => m.LocationReviewsPage
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      {
        path: 'edit',
        loadComponent: () =>
          import('./presentation/pages/profile/edit-profile/edit-profile.page').then(
            (m) => m.EditProfilePage
          ),
      },
      {
        path: 'my-reviews',
        loadComponent: () =>
          import('./presentation/pages/profile/my-reviews/my-reviews.page').then(
            (m) => m.MyReviewsPage
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./presentation/pages/profile/settings/settings.page').then(
            (m) => m.SettingsPage
          ),
      },
      {
        path: ':username',
        loadComponent: () =>
          import('./presentation/pages/tabs/profile/profile.page').then(
            (m) => m.ProfilePage
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/profile',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'review/:id',
    loadComponent: () =>
      import('./presentation/pages/location-detail/location-detail.page').then(
        (m) => m.LocationDetailPage
      ),
  },
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
];
