import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslatePipe } from './translate.pipe';
import { TimesPipe } from './pipes/times.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [TranslatePipe, TimesPipe],
    exports: [TranslatePipe, TimesPipe]
})
export class SharedModule { }
