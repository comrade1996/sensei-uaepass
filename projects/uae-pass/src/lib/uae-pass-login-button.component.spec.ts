import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { UAE_PASS_CONFIG } from './uae-pass.config';
import { UaePassLoginButtonComponent } from './uae-pass-login-button.component';
import { UaePassAuthService } from './uae-pass.oauth.service';

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
            clientId: 'client',
            redirectUri: 'https://app.example.com/callback',
            isProduction: false,
            language: 'ar',
            tokenProxyUrl: '/token',
            userInfoProxyUrl: '/userinfo',
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
    expect(image.alt).toContain('هوية الإمارات');
    expect(button.getAttribute('aria-label')).toContain('هوية الإمارات');
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
    spyOn(auth, 'redirectToAuthorization').and.resolveTo();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(fixture.componentInstance.pressed.emit).toHaveBeenCalled();
    expect(auth.redirectToAuthorization).toHaveBeenCalled();
  });
});
