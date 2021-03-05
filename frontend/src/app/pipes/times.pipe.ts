import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../translate.service';
import { TranslatePipe } from '../translate.pipe';

@Pipe({
  name: 'times',
  pure: false
})
export class TimesPipe implements PipeTransform {

  private translatePipe: TranslatePipe;

  constructor(private translateService: TranslateService) {
    this.translatePipe = new TranslatePipe(this.translateService);
  }

  transform(miliseconds: any) {
    const seconds = (Math.floor(miliseconds / 100) / 10) % 60;
    const minutes = Math.floor(miliseconds * 0.00001667) % 60;
    const hours = Math.floor(miliseconds * 2.8e-7);
    return `${hours} ${this.translatePipe.transform('HOURS')} ${minutes} ${this.translatePipe.transform('MINUTES')}${!seconds ? '' : ` ${seconds} ${this.translatePipe.transform('SECONDS')}`}`;
  }
}
