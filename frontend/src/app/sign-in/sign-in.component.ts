
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})

export class SignInComponent {
  signInEmail: string = '';
  signInPassword: string = '';
  signInError: string = '';
  signedIn: boolean = false;

  createEmail: string = '';
  createPassword: string = '';
  confirmPassword: string = '';
  createError: string = '';

  constructor(private router: Router) {
    const jwt = localStorage.getItem('jwt') || '';
    this.signedIn = !!jwt;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  async onSignIn() {
    this.signInError = '';
    try {
      const response = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.signInEmail,
          password: this.signInPassword
        })
      });
      if (response.status === 403) {
        this.signInError = 'Invalid email or password.';
        return;
      }
      const text = await response.text();
      if (text === 'bad credentials') {
        this.signInError = 'Invalid email or password.';
      } else {
        localStorage.setItem('jwt', text);
        localStorage.setItem('email', this.signInEmail);
        console.log('Login successful:', text);
        this.signInError = '';
        this.signedIn = true;
        alert('Login successful!');
        this.router.navigate(['/']);
      }
    } catch (err) {
      this.signInError = 'Error connecting to server.';
    }
  }

  async onCreateAccount() {
    this.createError = '';
    if (this.createPassword !== this.confirmPassword) {
      this.createError = 'Passwords do not match.';
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/users/createAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.createEmail,
          password: this.createPassword
        })
      });
      if (response.status === 200) {
        const text = await response.text();
        localStorage.setItem('jwt', text);
        localStorage.setItem('email', this.createEmail);
        this.signedIn = true;
        alert('Account created successfully!');
        this.router.navigate(['/']);
      } else if (response.status === 409) {
        this.createError = 'Account already exists.';
      } else {
        this.createError = 'Failed to create account.';
      }
    } catch (err) {
      this.createError = 'Error connecting to server.';
    }
  }
}
