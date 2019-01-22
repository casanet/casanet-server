import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardCrmComponent } from './dashboard-crm.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

export const appRoutes: Routes = [
  { path: '', component: DashboardCrmComponent },
];

@NgModule({
  imports: [
    MatIconModule,
    MatExpansionModule,
    CommonModule,
    RouterModule.forChild(appRoutes),
    FlexLayoutModule,
    MatCardModule,
  ],
  declarations: [DashboardCrmComponent],
  exports: []
})
export class DashboardCrmModule { }
