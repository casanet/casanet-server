import { Component } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
} from '@angular/animations';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],


})
export class AppComponent {

  constructor(private swUpdates: SwUpdate) {
    swUpdates.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });

    swUpdates.available.subscribe(event => {
      console.log('updating now to', event.available);
      swUpdates.activateUpdate().then(() => this.updateApp());
    });
  }

  updateApp() {
    // setTimeout(() => document.location.reload(), 1000);
  }
}
