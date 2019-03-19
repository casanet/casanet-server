import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMinionDialogComponent } from './create-minion-dialog.component';

describe('AutoTimeoutDialogComponent', () => {
  let component: CreateMinionDialogComponent;
  let fixture: ComponentFixture<CreateMinionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateMinionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMinionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
