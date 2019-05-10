import { Component, OnInit, OnDestroy } from '@angular/core';
import { DevicesService } from '../../services/devices.service';
import { Subscription } from 'rxjs';
import { LocalNetworkDevice } from '../../../../../backend/src/models/sharedInterfaces';
import swal, { SweetAlertResult } from 'sweetalert2';
import { TranslatePipe } from '../../translate.pipe';
import { TranslateService } from '../../translate.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, OnDestroy {

  private translatePipe: TranslatePipe;

  private devicesSubscription: Subscription;

  readonly devicesColumns = ['position', 'mac', 'name', 'ip', 'vendor', 'set-name'];

  devices: LocalNetworkDevice[];
  dataLoading: boolean;

  constructor(
    private devicesService: DevicesService,
    private translateService: TranslateService) {

    this.translatePipe = new TranslatePipe(this.translateService);

    this.devicesSubscription =
      this.devicesService.lanDevicesFeed.subscribe((devices) => {
        this.devices = devices;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.devicesSubscription.unsubscribe();
  }

  public async setName(device: LocalNetworkDevice) {
    const swalResult: void | SweetAlertResult = await swal({
      type: 'info',
      title: `${this.translatePipe.transform('PRESS_NAME')}`,
      text: `${this.translatePipe.transform('DEVICE')} ${device.name ? device.name : '--'} ${device.mac}`,
      input: 'text',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.translatePipe.transform('SUBMIT'),
      cancelButtonText: this.translatePipe.transform('CANCEL')
    });

    // Case user select 'cancel' cancel the delete.
    if (swalResult && swalResult.dismiss) {
      return;
    }

    device['sync'] = true;
    await this.devicesService.setDeviceName(device, swalResult.value);
    device['sync'] = false;
  }

  public async reScanNetwork() {
    this.dataLoading = true;

    await this.devicesService.rescanLanDevices();

    this.dataLoading = false;
  }
}
