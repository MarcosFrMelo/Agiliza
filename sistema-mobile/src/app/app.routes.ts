import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'projetos',
    loadComponent: () => import('./projetos/projetos.page').then( m => m.ProjetosPage)
  },
  {
    path: 'projeto-cadastro',
    loadComponent: () => import('./projeto-cadastro/projeto-cadastro.page').then( m => m.ProjetoCadastroPage)
  },
];
