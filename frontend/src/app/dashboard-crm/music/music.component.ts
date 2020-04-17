import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss']
})
export class MusicComponent implements OnInit, OnDestroy {

  private translatePipe: TranslatePipe;

  public dataLoading = false;


  public musicFrameUrl = '';


  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService,
    private usersService: UsersService
  ) {

    this.musicFrameUrl = localStorage.getItem('musicFrameUrl');
    this.translatePipe = new TranslatePipe(this.translateService);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

}
