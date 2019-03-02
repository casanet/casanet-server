import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import {
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    MatToolbarModule
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared.module';

const routes: Routes = [
    { path: '', component: LoginComponent },
];


@NgModule({
    imports: [
        SharedModule,
        MatCardModule,
        CommonModule,
        FlexLayoutModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatInputModule,
        MatToolbarModule,
        FormsModule,
        ReactiveFormsModule,
        MatGridListModule,
        MatIconModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        LoginComponent,
    ],
    exports: [
        RouterModule
    ],
    providers: [
    ]
})
export class LoginModule {
}
