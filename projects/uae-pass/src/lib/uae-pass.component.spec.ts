import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UaePassComponent } from './uae-pass.component';

describe('UaePassComponent', () => {
  let component: UaePassComponent;
  let fixture: ComponentFixture<UaePassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UaePassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UaePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
