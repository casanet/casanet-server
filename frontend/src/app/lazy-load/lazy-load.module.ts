import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AuthModule } from '../auth/auth.module';

const routes: Routes = [
    { path: 'auth', loadChildren: () => import('../auth/auth.module').then(m => m.AuthModule) },
    // {path: 'register', loadChildren: '../register/register.module#RegisterModule'},
    { path: 'login', loadChildren: () => import('../pages/login/login.module').then(m => m.LoginModule) },
    // {path: 'editor', loadChildren: '../editor/editor.module#EditorModule'},

    { path: '**', redirectTo: 'auth/minions' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class LazyLoadModule { }
