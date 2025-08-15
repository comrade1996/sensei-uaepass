import { Component, inject, input, output, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { UaePassAuthService } from './uae-pass.oauth.service';
import { UaePassAuthStatus } from './uae-pass.enums';
import { UAE_PASS_CONFIG } from './uae-pass.config';
import { getUaePassTexts } from './uae-pass.i18n';

@Component({
  selector: 'uae-pass-callback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'uaepass-callback' },
  template: `
    <div class="callback-container" [attr.dir]="isRTL() ? 'rtl' : 'ltr'">
      @if (status() === Status.ExchangingToken || status() === Status.Authorizing) {
        <div class="loading-state">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          <h2 class="status-title">{{ texts().uaePass }}</h2>
          <p class="status-message" aria-live="polite">{{ texts().completingSignIn }}</p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      } @else if (status() === Status.Authenticated) {
        <div class="success-state">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#10b981"/>
              <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="status-title success">{{ texts().signedInSuccessfully }}</h2>
          <p class="status-message" aria-live="polite">{{ texts().redirectingToHomePage }}</p>
          <div class="countdown-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      } @else if (status() === Status.Error) {
        <div class="error-state">
          <div class="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#ef4444"/>
              <path d="m15 9-6 6m0-6 6 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="status-title error">{{ texts().error }}</h2>
          <p class="error-message" role="alert">{{ error() }}</p>
          <a href="/" class="return-button">{{ texts().returnToHome }}</a>
        </div>
      } @else {
        <div class="loading-state">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          <h2 class="status-title">{{ texts().uaePass }}</h2>
          <p class="status-message">{{ texts().redirectingToHomePage }}</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
    }

    .loading-state,
    .success-state,
    .error-state {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 3rem 2rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .spinner-container {
      margin-bottom: 2rem;
    }

    .spinner {
      width: 64px;
      height: 64px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #1e40af;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .status-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 1rem 0;
      line-height: 1.3;
    }

    .status-title.success {
      color: #059669;
    }

    .status-title.error {
      color: #dc2626;
    }

    .status-message {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 2rem 0;
      line-height: 1.5;
    }

    .error-message {
      font-size: 0.95rem;
      color: #dc2626;
      margin: 0 0 2rem 0;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      line-height: 1.5;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1e40af, #3b82f6);
      border-radius: 2px;
      animation: progress 2s ease-in-out infinite;
    }

    @keyframes progress {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 100%; }
    }

    .success-icon,
    .error-icon {
      margin-bottom: 1.5rem;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    .countdown-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .dot:nth-child(2) {
      animation-delay: 0.3s;
    }

    .dot:nth-child(3) {
      animation-delay: 0.6s;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .return-button {
      display: inline-block;
      background: #1e40af;
      color: white;
      text-decoration: none;
      padding: 0.75rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .return-button:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
    }

    .return-button:active {
      transform: translateY(0);
    }

    /* RTL Support */
    [dir="rtl"] .callback-container {
      font-family: 'Noto Sans Arabic', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    [dir="rtl"] .status-title,
    [dir="rtl"] .status-message,
    [dir="rtl"] .error-message {
      text-align: right;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .callback-container {
        padding: 1rem;
      }

      .loading-state,
      .success-state,
      .error-state {
        padding: 2rem 1.5rem;
        border-radius: 16px;
      }

      .status-title {
        font-size: 1.25rem;
      }

      .spinner {
        width: 48px;
        height: 48px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      :host {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      }

      .loading-state,
      .success-state,
      .error-state {
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .status-title {
        color: #f8fafc;
      }

      .status-message {
        color: #cbd5e1;
      }

      .spinner {
        border-color: #475569;
        border-top-color: #3b82f6;
      }

      .progress-bar {
        background: #475569;
      }
    }
  `,
})
export class UaePassCallbackComponent {
  private readonly auth = inject(UaePassAuthService);
  private readonly config = inject(UAE_PASS_CONFIG);
  readonly Status = UaePassAuthStatus;

  // Optional current URL input (useful for SSR or router-less contexts)
  url = input<string | null>(null);

  // Outputs for host app to react
  success = output<void>();
  failed = output<string>();

  readonly status = this.auth.status;
  readonly error = this.auth.error;

  // Localized texts
  readonly texts = computed(() => {
    const lang = this.config.language || 'en';
    return getUaePassTexts(lang as 'en' | 'ar');
  });

  // RTL support
  readonly isRTL = computed(() => {
    const lang = this.config.language || 'en';
    return lang === 'ar';
  });

  // React to status changes
  private readonly _fx = effect(() => {
    const s = this.auth.status();
    if (s === UaePassAuthStatus.Authenticated) {
      this.success.emit();
      // Auto-redirect to home after successful authentication
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 2000);
    }
    if (s === UaePassAuthStatus.Error) {
      const msg = this.auth.error();
      if (msg) this.failed.emit(msg);
    }
  });

  constructor() {
    // Only handle callback if we're actually on the callback route with a code parameter
    const currentUrl = this.url() ?? (typeof window !== 'undefined' ? window.location.href : '');
    if (currentUrl && (currentUrl.includes('code=') || currentUrl.includes('error='))) {
      // No await to avoid blocking change detection; service sets signals when done
      void this.auth.handleRedirectCallback(currentUrl);
    } else {
      // If no OAuth parameters, redirect to home immediately
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }
}
