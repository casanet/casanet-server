import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-general-message-dialog',
  templateUrl: './general-message-dialog.component.html',
  styleUrls: ['./general-message-dialog.component.scss']
})
export class GeneralMessageDialogComponent implements OnInit {

  data: Object = {};
  constructor(private dialogRef: MatDialogRef<GeneralMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.data = data;
  }

  ngOnInit() {
  }

}
