import { Component, inject } from '@angular/core';
import { UaePassAuthService, UaePassLoginButtonComponent, UaePassAuthStatus } from 'sensei-uaepass';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [UaePassLoginButtonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly auth = inject(UaePassAuthService) as UaePassAuthService;
  
  readonly status = this.auth.status;
  readonly profile = this.auth.profile;
  readonly tokens = this.auth.tokens;
  readonly error = this.auth.error;
  readonly isAuthenticated = this.auth.isAuthenticated;
  
  readonly AuthStatus = UaePassAuthStatus;

  formatJson(obj: any): string {
    if (!obj) return 'null';
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return String(obj);
    }
  }

  onLoginPressed(): void {
    // Clear any previous errors before starting new auth flow
    this.auth.resetError();
  }

  clearError(): void {
    this.auth.resetError();
  }

  logout(): void {
    this.auth.logout();
  }

  clearSession(): void {
    // Clear local session without redirecting to UAE Pass logout
    this.auth.resetError();
    // Manually clear the internal state
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('uae-pass:tokens');
      window.localStorage.removeItem('uae-pass:profile');
    }
    // Force page reload to reset state
    window.location.reload();
  }
}
