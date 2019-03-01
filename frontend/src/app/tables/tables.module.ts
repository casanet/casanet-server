import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TablesRouterModule } from './tables.router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';

import { MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatSortModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatChipsModule,
  MatButtonToggleModule,
  MatDialogModule,
  MatCardModule
} from '@angular/material';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { FileDropModule } from 'ngx-file-drop';

import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

// import * as hljs from 'highlight.js';
// import { HighlightJsModule, HIGHLIGHT_JS } from 'angular-highlight-js';
// import * as hljsTypescript from 'highlight.js/lib/languages/typescript';
import { GeneralMessageDialogComponent } from '../dialogs/general-message-dialog/general-message-dialog.component';
// export function highlightJsFactory(): any {
//   hljs.registerLanguage('typescript', hljsTypescript);
//   return hljs;
// }
// import { UsersComponent } from './users/users.component';

import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatListModule,
    MatStepperModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatChipsModule,
    MatButtonToggleModule,
    SweetAlert2Module,
    MatMenuModule,
    MatSelectModule,
    FileDropModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatBottomSheetModule,
    PerfectScrollbarModule,
    NgxMatSelectSearchModule,
    // HighlightJsModule.forRoot({
    //   provide: HIGHLIGHT_JS,
    //   useFactory: highlightJsFactory
    // }),
    TablesRouterModule,
    MatDialogModule,
    MatCardModule
  ],
  declarations: [
    GeneralMessageDialogComponent,
    // UsersComponent,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  exports: [
    GeneralMessageDialogComponent
  ],
  entryComponents: [
    GeneralMessageDialogComponent]

})
export class TablesModule { }


