import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DeviceKind } from '../../../../../backend/src/models/sharedInterfaces';
import { Validators, FormControl } from '@angular/forms';
import { MinionsService } from '../../services/minions.service';
import { DevicesService } from '../../services/devices.service';

export interface DeviceOption {
  mac: string;
  display: string;
}

@Component({
  selector: 'app-create-minion-dialog',
  templateUrl: './create-minion-dialog.component.html',
  styleUrls: ['./create-minion-dialog.component.scss']
})

export class CreateMinionDialogComponent implements OnInit {


  devicesControl: FormControl;
  devices: DeviceOption[];

  brandsControl: FormControl;
  brands: string[];

  modelsControl: FormControl;
  models: string[];

  requiredIdControl: FormControl;
  requireDeviceId = false;

  requiredTokenControl: FormControl;
  requireToken = false;

  nameControl: FormControl;

  constructor(private devicesService: DevicesService,
    private minionsService: MinionsService,
    private dialogRef: MatDialogRef<CreateMinionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
  }

  ngOnInit() {

    this.devicesControl = new FormControl('', [Validators.required]);

    this.devices = [];
    for (const device of this.devicesService.lanDevices) {
      this.devices.push({
        mac: device.mac,
        display: `${device.name || ''} ${device.ip} ${device.vendor ? device.vendor.substr(0, Math.min(device.vendor.length, 10)) : ''}`,
      });
    }

    this.brandsControl = new FormControl('', [Validators.required]);

    this.brands = [];
    for (const kind of this.devicesService.devicesKinds) {
      if (this.brands.indexOf(kind.brand) === -1) {
        this.brands.push(kind.brand);
      }
    }

    this.modelsControl = new FormControl('', [Validators.required]);

    this.requiredIdControl = new FormControl('', [Validators.required]);

    this.requiredTokenControl = new FormControl('', [Validators.required]);

    this.nameControl = new FormControl('', [Validators.required]);


  }


  public onBrandSelected() {
    this.models = [];

    for (const kind of this.devicesService.devicesKinds) {
      if (kind.brand === this.brandsControl.value) {
        this.models.push(kind.model);
      }
    }
  }

  public onModelSelected() {
    // Get the minion kind
    let selectedKind: DeviceKind;
    for (const kind of this.devicesService.devicesKinds) {
      if (kind.brand === this.brandsControl.value && kind.model === this.modelsControl.value) {
        selectedKind = kind;
        break;
      }
    }

    if (!selectedKind) {
      return;
    }
    this.requireToken = selectedKind.isTokenRequierd;
    this.requireDeviceId = selectedKind.isIdRequierd;
  }

  public async createMinion() {

    this.minionsService.createMinion({
      minionStatus: {},
      minionType: 'toggle',
      name: this.nameControl.value,
      device: {
        brand: this.brandsControl.value,
        model: this.modelsControl.value,
        deviceId: this.devicesControl.value,
        token: this.requiredTokenControl.value,
        pysicalDevice: {
          mac: this.devicesControl.value,
        },
      },
    });

    this.dialogRef.close();
  }
}
