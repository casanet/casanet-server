import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardCrmComponent } from './dashboard-crm.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { EcoFabSpeedDialModule} from '@ecodev/fab-speed-dial';
import { MccColorPickerModule } from 'material-community-components';

// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { BrowserModule } from '@angular/platform-browser';

import { LoaderComponent } from './loader/loader.component';
import { TimesPipe } from '../pipes/times.pipe';

export const appRoutes: Routes = [
  { path: '', component: DashboardCrmComponent },
];

@NgModule({
  imports: [
    // BrowserModule,
    // BrowserAnimationsModule,
    MccColorPickerModule.forRoot({
      empty_color: 'transparent',
      used_colors: ['#000000', '#FFF555']
    }),
    EcoFabSpeedDialModule,
    MatDividerModule,
    MatSliderModule,
    FormsModule,
    MatSelectModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    SharedModule,
    MatIconModule,
    MatExpansionModule,
    CommonModule,
    RouterModule.forChild(appRoutes),
    FlexLayoutModule,
    MatCardModule,
  ],
  declarations: [
    DashboardCrmComponent,
    LoaderComponent,
    TimesPipe,
  ],
  exports: [
    TimesPipe
  ],
  providers: [
  ],
})
export class DashboardCrmModule { }
