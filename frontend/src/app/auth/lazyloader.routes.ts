import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { MinionsComponent } from '../dashboard-crm/minions/minions.component';
import { OperationsComponent } from '../dashboard-crm/operations/operations.component';
import { TimingsComponent } from '../dashboard-crm/timings/timings.component';
import { DevicesComponent } from '../dashboard-crm/devices/devices.component';
import { UsersComponent } from '../dashboard-crm/users/users.component';
import { MusicComponent } from '../dashboard-crm/music/music.component';

export const appRoutes: Routes = [{
    path: '', component: AuthComponent, children: [
        { path: 'minions', component: MinionsComponent },
        { path: 'operations', component: OperationsComponent },
        { path: 'timings', component: TimingsComponent },
        { path: 'devices', component: DevicesComponent },
        { path: 'music', component: MusicComponent },
        { path: 'users', component: UsersComponent },
        { path: 'pages', loadChildren: () => import('../pages/pages.module').then(m => m.PagesModule) },
    ]
}];
