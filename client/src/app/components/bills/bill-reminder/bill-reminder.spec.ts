import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillReminder } from './bill-reminder';

describe('BillReminder', () => {
  let component: BillReminder;
  let fixture: ComponentFixture<BillReminder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillReminder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillReminder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
