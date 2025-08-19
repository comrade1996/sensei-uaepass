import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UaePassAuthService } from './uae-pass.oauth.service';
import { UaePassAuthStatus, UaePassLanguageCode } from './uae-pass.enums';
import { UAE_PASS_CONFIG, UaePassConfig } from './uae-pass.config';

@Component({
  selector: 'uae-pass-login-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'uaepass-login-button',
  },
  template: `
    <button
      type="button"
      class="uae-pass-login-btn"
      [disabled]="disabled()"
      (click)="handleLogin()"
      [attr.aria-label]="'Sign in with UAE Pass'"
    >
      <img
        [src]="imageSrc()"
        alt="Sign with UAE PASS"
        class="uae-pass-btn-image"
        [class.loading]="disabled()"
        [style]="customStyles()"
      />
      <div class="loading-spinner" *ngIf="disabled()"></div>
    </button>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .uae-pass-login-btn {
      display: block;
      width: 100%;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
    }

    .uae-pass-btn-image {
      width: 100%;
      height: auto;
      display: block;
      transition: all 0.3s ease;
    }

    .uae-pass-login-btn:hover:not([disabled]) .uae-pass-btn-image {
      transform: translateY(-2px);
      filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.15));
    }

    .uae-pass-login-btn:active:not([disabled]) .uae-pass-btn-image {
      transform: translateY(0);
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
    }

    .uae-pass-login-btn[disabled] .uae-pass-btn-image {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .uae-pass-btn-image.loading {
      opacity: 0.6;
    }

    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top: 3px solid #1e40af;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .uae-pass-btn-image {
        max-width: 280px;
        margin: 0 auto;
      }
    }
  `,
})
export class UaePassLoginButtonComponent {
  private readonly auth = inject(UaePassAuthService);
  private readonly config = inject(UAE_PASS_CONFIG);

  // Default asset paths for UAE Pass button
  private readonly defaultAssetPaths = {
    english: 'assets/UAEPASS_Sign_with_Btn_Outline_Active@2x.svg',
    arabic: 'assets/UAEPASS_Sign_with_Btn_Outline_Active_AR@2x.svg',
  };

  // Inputs
  language = input<'en' | 'ar'>();
  customImageSrc = input<string | null>(null);
  customStyles = input<string>('');
  isDisabled = input<boolean>(false);

  // Outputs
  pressed = output<void>();

  // Computed properties
  readonly isBusy = computed(() => {
    const s = this.auth.status();
    return (
      s === UaePassAuthStatus.Authorizing ||
      s === UaePassAuthStatus.ExchangingToken
    );
  });

  readonly imageSrc = computed(() => {
    console.log('Input language:', this.language());
    console.log('Config language:', this.config.language);
    
    if (this.customImageSrc()) {
      return this.customImageSrc();
    }

    // Use input language first, then config language, then default to 'en'
    const configLang = this.config.language;
    const inputLang = this.language();
    
    // Handle the case where config.language might be 'ar' string or enum value
    let normalizedConfigLang: 'en' | 'ar' = 'en';
    if (configLang === 'ar' || configLang === 'Arabic' || String(configLang).toLowerCase() === 'ar') {
      normalizedConfigLang = 'ar';
    }
    
    const lang = inputLang || normalizedConfigLang;
    
    console.log('Final language used:', lang);
    console.log('Config language raw:', configLang);
    console.log('Normalized config language:', normalizedConfigLang);

    const configLogos = this.config.buttonLogos;
    if (configLogos) {
      console.log('Config logos:', configLogos);
      if (lang === 'ar' && configLogos.arabic) {
        console.log('Using config Arabic logo:', configLogos.arabic);
        return configLogos.arabic;
      }
      if (lang === 'en' && configLogos.english) {
        console.log('Using config English logo:', configLogos.english);
        return configLogos.english;
      }
    }

    // Fallback to default asset paths
    const finalImage = lang === 'ar'
      ? this.defaultAssetPaths.arabic
      : this.defaultAssetPaths.english;
    
    console.log('Using default asset path:', finalImage);
    return finalImage;
  });

  readonly disabled = computed(() => {
    return this.isDisabled() || this.isBusy();
  });

  handleLogin(): void {
    this.pressed.emit();
    this.auth.redirectToAuthorization();
  }
}
