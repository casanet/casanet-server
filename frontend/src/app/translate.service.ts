import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  private readonly LENG_STORAGE_KEY = 'leng';
  /**
   * Strings map.
   */
  data: any = {};

  constructor(private http: HttpClient) { }

  /**
   * Set html body element to be with corrent 'dir' attribute value.
   */
  private changePageDir() {
    window.document.getElementById('casa-page').setAttribute('dir', this.data['DIR']);
  }

  /**
   * Set translation for given leng.
   * @param lang to to translate.
   */
  private async retriveLeng(lang: string) {
    const langPath = `assets/i18n/${lang || 'en'}.json`;
    const translation = await this.http.get<{}>(langPath).toPromise()
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
    let clientLeng = localStorage.getItem(this.LENG_STORAGE_KEY);
    if (!clientLeng) {
      clientLeng = (window.navigator['language'].toLowerCase().indexOf('he') !== -1 ||
        window.navigator['language'].toLowerCase().indexOf('il') !== -1)
        ? 'he'
        : 'en';
    }
    return clientLeng;
  }

  /**
   * Set leng and keep it to next client uses.
   */
  public async setLeng(lang: string) {
    await this.retriveLeng(lang);
    localStorage.setItem(this.LENG_STORAGE_KEY, lang);
  }

  /**
   * Load leng strings maps
   */
  public async load(): Promise<void> {
    await this.retriveLeng(this.getLeng());
  }
}
