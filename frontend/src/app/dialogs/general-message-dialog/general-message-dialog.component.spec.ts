import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralMessageDialogComponent } from './general-message-dialog.component';

describe('GeneralMessageDialogComponent', () => {
  let component: GeneralMessageDialogComponent;
  let fixture: ComponentFixture<GeneralMessageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralMessageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
