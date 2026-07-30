import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideUaePass } from 'sensei-uaepass';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideUaePass({
          loginUrl: '/auth/uae-pass/login',
          sessionUrl: '/api/session',
          logoutUrl: '/auth/logout',
          autoRestoreSession: false,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates without exposing browser token state', () => {
    expect(component).toBeTruthy();
    expect('tokens' in (component as unknown as Record<string, unknown>)).toBeFalse();
  });
});
