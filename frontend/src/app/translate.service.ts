import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly LANG_STORAGE_KEY = 'lang';
  /**
   * Strings map.
   */
  data: any = {};

  constructor(private http: HttpClient) { }

  /**
   * Set html body element to be with corrent 'dir' attribute value.
   */
  private changePageDir() {
    window.document
      .getElementById('casa-page')
      .setAttribute('dir', this.data['DIR']);
  }

  /**
   * Set translation for given leng.
   * @param lang to to translate.
   */
  private async retriveLeng(lang: string) {
    const langPath = `assets/i18n/${lang || 'en'}.json`;
    const translation = await this.http
      .get<{}>(langPath)
      .toPromise()
      .catch(() => {
        this.data = {};
      });
    this.data = Object.assign({}, translation || {});
    this.changePageDir();
  }

  /**
   * Get client leng based on broswer leng and old selections.
   */
  private getLeng(): string {
    const clientLeng = localStorage.getItem(this.LANG_STORAGE_KEY);

    if (clientLeng) {
      return clientLeng;
    }
    const langCode =
      navigator.language ||
      (navigator.languages && navigator.languages[0]) || 'en';

    // check for hebrew
    if (langCode.indexOf('he') !== -1) {
      return 'he';
    }

    // check for othe lenguages here.

    // Otherways return en.
    return 'en';
  }

  /**
   * Set leng and keep it to next client uses.
   */
  public async setLeng(lang: string) {
    await this.retriveLeng(lang);
    localStorage.setItem(this.LANG_STORAGE_KEY, lang);

    /** refresh page to avtivate changes */
    window.location.reload();
  }

  /**
   * Load leng strings maps
   */
  public async load(): Promise<void> {
    await this.retriveLeng(this.getLeng());
  }
}
