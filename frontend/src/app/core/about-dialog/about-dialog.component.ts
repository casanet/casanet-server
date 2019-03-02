import { Component, OnInit, Inject } from '@angular/core';
// import { MatDialog, MatDialogConfig} from "@angular/material";

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
