import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoTimeoutDialogComponent } from './auto-timeout-dialog.component';

describe('AutoTimeoutDialogComponent', () => {
  let component: AutoTimeoutDialogComponent;
  let fixture: ComponentFixture<AutoTimeoutDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoTimeoutDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoTimeoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
