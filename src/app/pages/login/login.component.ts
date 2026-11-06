import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({ selector: 'app-login', imports: [ReactiveFormsModule], templateUrl: './login.component.html', styleUrl: './login.component.css' })
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly message = signal('');
  protected readonly loading = signal(false);
  protected readonly loginForm = this.fb.nonNullable.group({ usuario: ['', Validators.required], clave: ['', Validators.required] });

  constructor() { if (localStorage.getItem('token')) this.router.navigateByUrl('/productos'); }

  protected login(): void {
    if (this.loginForm.invalid || this.loading()) return;
    this.loading.set(true); this.message.set('');
    const credentials = this.loginForm.getRawValue();
    this.api.login(credentials).subscribe({
      next: (response) => { localStorage.setItem('token', response.token); localStorage.setItem('userName', response.user.userName); this.router.navigateByUrl('/productos'); },
      error: (error) => { this.loading.set(false); this.message.set(error.error?.message ?? 'No se pudo iniciar sesión. Verifica tus credenciales.'); },
    });
  }
}
