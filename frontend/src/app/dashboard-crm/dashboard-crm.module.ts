import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MinionsComponent } from './minions/minions.component';
import { OperationsComponent } from './operations/operations.component';
import { TimingsComponent } from './timings/timings.component';
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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { DevicesComponent } from './devices/devices.component';
import { UsersComponent } from './users/users.component';
import { MusicComponent } from './music/music.component';




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
    MatProgressSpinnerModule,
    SharedModule,
    MatIconModule,
    MatExpansionModule,
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatButtonToggleModule,
    MatTableModule,
    MatInputModule,
  ],
  declarations: [
    MinionsComponent,
    OperationsComponent,
    TimingsComponent,
    DevicesComponent,
    UsersComponent,
    MusicComponent,
  ],
  exports: [
  ],
  providers: [
  ],
})
export class DashboardCrmModule { }
