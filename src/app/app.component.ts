import { MessageModule } from 'primeng/message';
import { CommonModule, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    FormsModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private primeng: PrimeNG) {
    this.primeng.theme.set({
      preset: Aura,
      options: {
        cssLayer: {
          name: 'primeng',
          order: 'primeng',
        },
      },
    });

    // Set a flag in session storage on page load
    sessionStorage.setItem('pageLoaded', 'true');
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(): void {
    // Check if the session storage flag is still there
    if (!sessionStorage.getItem('pageLoaded')) {
      // The flag isn't there, so we assume the window is being closed
      localStorage.removeItem('authToken');
    }

    // Optionally clear the session storage here if you want
    sessionStorage.removeItem('pageLoaded');
  }
}
