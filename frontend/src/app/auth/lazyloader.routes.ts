import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { MinionsComponent } from '../dashboard-crm/minions/minions.component';
import { OperationsComponent } from '../dashboard-crm/operations/operations.component';
import { TimingsComponent } from '../dashboard-crm/timings/timings.component';

export const appRoutes: Routes = [{
    path: '', component: AuthComponent, children: [
        { path: 'minions', component: MinionsComponent },
        { path: 'operations', component: OperationsComponent },
        { path: 'timings', component: TimingsComponent },
        // { path: 'material-widgets', loadChildren: '../material-widgets/material-widgets.module#MaterialWidgetsModule' },
        // { path: 'tables', loadChildren: '../tables/tables.module#TablesModule' },
        // { path: 'maps', loadChildren: '../maps/maps.module#MapsModule' },
        // { path: 'charts', loadChildren: '../charts/charts.module#ChartsModule' },
        // { path: 'chats', loadChildren: '../chats/chat.module#ChatsModule' }, // fix this
        // { path: 'mail', loadChildren: '../mail/mail.module#MailModule' }, // fix this
        { path: 'pages', loadChildren: '../pages/pages.module#PagesModule' },
        // { path: 'forms', loadChildren: '../forms/forms.module#FormModule' }, //fix this
        // { path: 'guarded-routes', loadChildren: '../guarded-routes/guarded-routes.module#GuardedRoutesModule' },
        // { path: 'editor', loadChildren: '../editor/editor.module#EditorModule' },
        // { path: 'scrumboard', loadChildren: '../scrumboard/scrumboard.module#ScrumboardModule' },
    ]
}];
