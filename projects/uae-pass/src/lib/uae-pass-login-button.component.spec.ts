import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { UaePassAuthService } from './uae-pass-auth.service';
import { UAE_PASS_CONFIG } from './uae-pass.config';
import { UaePassLoginButtonComponent } from './uae-pass-login-button.component';

describe('UaePassLoginButtonComponent', () => {
  let fixture: ComponentFixture<UaePassLoginButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UaePassLoginButtonComponent],
      providers: [
        provideHttpClient(),
        {
          provide: UAE_PASS_CONFIG,
          useValue: {
            loginUrl: '/auth/uae-pass/login',
            sessionUrl: '/api/session',
            logoutUrl: '/auth/logout',
            autoRestoreSession: false,
            language: 'ar',
            buttonLogos: { arabic: '/arabic.svg', english: '/english.svg' },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UaePassLoginButtonComponent);
    fixture.detectChanges();
  });

  it('uses the configured Arabic logo and accessible text', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(image.getAttribute('src')).toBe('/arabic.svg');
    expect(image.alt).toContain('الهوية الرقمية');
    expect(button.getAttribute('aria-label')).toContain('الهوية الرقمية');
  });

  it('allows an input language to override global configuration', () => {
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();

    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('/english.svg');
  });

  it('emits pressed and starts authentication when clicked', () => {
    const auth = TestBed.inject(UaePassAuthService);
    spyOn(fixture.componentInstance.pressed, 'emit');
    spyOn(auth, 'login');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(fixture.componentInstance.pressed.emit).toHaveBeenCalled();
    expect(auth.login).toHaveBeenCalled();
  });
});
