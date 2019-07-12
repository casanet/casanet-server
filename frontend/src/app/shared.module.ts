import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from './translate.pipe';
import { TimesPipe } from './pipes/times.pipe';
import { LoaderComponent } from './dashboard-crm/loader/loader.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
    imports: [CommonModule],
    declarations: [TranslatePipe, TimesPipe, LoaderComponent],
    exports: [TranslatePipe, TimesPipe, LoaderComponent, MatProgressBarModule]
})
export class SharedModule { }
