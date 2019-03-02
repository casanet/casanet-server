import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LazyLoadModule } from './lazy-load/lazy-load.module';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from './translate.service';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { ToasterAndErrorsService } from './services/toaster-and-errors.service';

export function setupTranslateFactory(
  service: TranslateService): Function {
  return async() => {
    await service.load();
    // await service.setLeng('en');
  };
}
import { MinionsService } from './services/minions.service';
import { DevicesService } from './services/devices.service';

@NgModule({
  declarations: [
    AppComponent,

  ],
  exports: [

  ],
  imports: [
    BrowserModule,
    LazyLoadModule,
    CoreModule,
    BrowserAnimationsModule,
    // NoopAnimationsModule,
    HttpClientModule,
    SweetAlert2Module.forRoot({
      buttonsStyling: true,
      customClass: 'modal-content',
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn'
    })
  ],
  providers: [
    MinionsService,
    DevicesService,
    ToasterAndErrorsService,
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupTranslateFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
