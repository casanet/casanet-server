import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTimingDialogComponent } from './create-timing-dialog.component';

describe('AutoTimeoutDialogComponent', () => {
  let component: CreateTimingDialogComponent;
  let fixture: ComponentFixture<CreateTimingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTimingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTimingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
