import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LazyLoadModule } from './lazy-load/lazy-load.module';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from './translate.service';
import { ToasterAndErrorsService } from './services/toaster-and-errors.service';
import { AutoTimeoutDialogComponent } from './dialogs/auto-timeout-dialog/auto-timeout-dialog.component';
import { CreateMinionDialogComponent } from './dialogs/create-minion-dialog/create-minion-dialog.component';
import { CreateOperationDialogComponent } from './dialogs/create-operation-dialog/create-operation-dialog.component';
import { CreateActivityDialogComponent } from './dialogs/create-activity-dialog/create-activity-dialog.component';
import { CreateTimingDialogComponent } from './dialogs/create-timing-dialog/create-timing-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from './shared.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export function setupTranslateFactory(
  service: TranslateService): Function {
  return async () => {
    await service.load();
    // await service.setLeng('en');
  };
}
import { MinionsService } from './services/minions.service';
import { OperationService } from './services/operations.service';
import { DevicesService } from './services/devices.service';
import { TimingsService } from './services/timings.service';
import { SettingsService } from './services/settings.service';
import { AuthService } from './services/auth/auth.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    AutoTimeoutDialogComponent,
    CreateMinionDialogComponent,
    CreateOperationDialogComponent,
    CreateActivityDialogComponent,
    CreateTimingDialogComponent,
  ],
  exports: [
  ],
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatTableModule,
    MatSliderModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
    BrowserModule,
    LazyLoadModule,
    CoreModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    SharedModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatStepperModule,
    MatSelectModule,
  ],
  providers: [
    MinionsService,
    OperationService,
    DevicesService,
    TimingsService,
    SettingsService,
    AuthService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    ToasterAndErrorsService,
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupTranslateFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    AutoTimeoutDialogComponent,
    CreateMinionDialogComponent,
    CreateOperationDialogComponent,
    CreateActivityDialogComponent,
    CreateTimingDialogComponent
  ]
})
export class AppModule { }
