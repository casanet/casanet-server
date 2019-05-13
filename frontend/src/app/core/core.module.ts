import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { SidemenuItemComponent } from './sidemenu-item/sidemenu-item.component';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { FullscreenComponent } from './fullscreen/fullscreen.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import {
    MatSnackBarModule,
    MatSidenavModule,
    MatSliderModule,
    MatProgressBarModule,
    MatDialogModule
} from '@angular/material';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { SharedModule } from '../shared.module';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};

@NgModule({

    declarations: [

        SidemenuComponent,
        SidemenuItemComponent,
        ToolbarComponent,
        SearchBarComponent,
        FullscreenComponent,
        SidebarComponent,
        UserMenuComponent,
        AboutDialogComponent,
        HelpDialogComponent,
    ],

    imports: [
        SharedModule,
        CommonModule,
        MatListModule,
        MatTooltipModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatChipsModule,
        RouterModule,
        PerfectScrollbarModule,
        FlexLayoutModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatSidenavModule,
        MatTabsModule,
        MatSliderModule,
        MatSnackBarModule,
        MatProgressBarModule,
        MatDialogModule,
        MatSelectModule,
    ],
    exports: [
        SidemenuComponent,
        SidemenuItemComponent,
        ToolbarComponent,
        SearchBarComponent,
        FullscreenComponent,
        SidebarComponent,
        UserMenuComponent,
        AboutDialogComponent,
        HelpDialogComponent
    ],

    providers: [

    ],
    entryComponents: [
        AboutDialogComponent,
        HelpDialogComponent]
})
export class CoreModule { }
