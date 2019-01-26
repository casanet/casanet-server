import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from './translate.service';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  /**
   * Translate string.
   * @param key key of string to show.
   * @param isMessageCode if the key is message code key.
   * @returns Translated string to show in UI.
   */
  transform(key: any, isMessageCode: boolean = false): any {
    if (isMessageCode) {
      return this.translate.data['--messages'][key.toString()] ||  `${this.transform('ERROR')}: ${key}`;
    }
    return this.translate.data[key] || key;
  }

}
