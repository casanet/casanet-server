import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalibrateDialogComponent } from './calibrate-dialog.component';

describe('AutoTimeoutDialogComponent', () => {
  let component: CalibrateDialogComponent;
  let fixture: ComponentFixture<CalibrateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalibrateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalibrateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
