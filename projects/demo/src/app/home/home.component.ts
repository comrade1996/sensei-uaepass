import { Component, inject } from '@angular/core';
import { UaePassAuthService, UaePassAuthStatus, UaePassLoginButtonComponent } from 'sensei-uaepass';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [UaePassLoginButtonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly auth = inject(UaePassAuthService);

  readonly status = this.auth.status;
  readonly profile = this.auth.profile;
  readonly error = this.auth.error;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly AuthStatus = UaePassAuthStatus;

  refreshSession(): void {
    void this.auth.restoreSession();
  }

  logout(): void {
    void this.auth.logout();
  }
}
