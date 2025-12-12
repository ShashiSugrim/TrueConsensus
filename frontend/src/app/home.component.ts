import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemsComponent } from './items/items.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [RouterModule, CommonModule, FormsModule, ItemsComponent],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Drag and drop handlers for Todo/Completed sections
  onDropTodo(event: DragEvent) {
    event.preventDefault();
    const id = Number(event.dataTransfer?.getData('text/plain'));
    this.updateItemStatus(id, false);
  }

  onDropCompleted(event: DragEvent) {
    event.preventDefault();
    const id = Number(event.dataTransfer?.getData('text/plain'));
    this.updateItemStatus(id, true);
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  async updateItemStatus(id: number, newStatus: boolean) {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('jwt') || '';
    }
    if (!token) {
      alert('No JWT token found.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/items/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        alert('Failed to update item status.');
        return;
      }
      await this.fetchItems();
    } catch (err) {
      alert('Error updating item status.');
    }
  }
  items: any[] = [];

  newTitle: string = '';
  newDescription: string = '';
  newStatus: string = 'false';
  addError: string = '';

  signedInEmail: string = '';

  signOut() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('email');
    this.signedInEmail = '';
    // Optionally, clear items array if you want to hide items immediately
    this.items = [];
  }
  constructor(private router: Router) {
    this.fetchItems();
    const jwt = localStorage.getItem('jwt') || '';
    if (jwt) {
      // Try to get email from localStorage or set a placeholder
      this.signedInEmail = localStorage.getItem('email') || 'User';
    }
  }

    goHome() {
    this.router.navigate(['/']);
  }

  async fetchItems() {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('jwt') || '';
    }
    if (!token) {
      console.error('No JWT token found in localStorage');
      return;
    }
    console.log("token is ", token);
    try {
      const response = await fetch('http://localhost:8080/items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        console.error('Failed to fetch items:', response.status);
        return;
      }
      this.items = await response.json();
      console.log('Items:', this.items);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }

  async addItem() {
    this.addError = '';
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('jwt') || '';
    }
    if (!token) {
      this.addError = 'No JWT token found.';
      return;
    }
    if (!this.newTitle.trim() || !this.newDescription.trim()) {
      this.addError = 'Title and description are required.';
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.newTitle,
          description: this.newDescription,
          status: this.newStatus
        })
      });
      if (!response.ok) {
        this.addError = 'Failed to add item.';
        return;
      }
      // Optionally refresh items list
      this.newTitle = '';
      this.newDescription = '';
      this.newStatus = 'false';
      await this.fetchItems();
    } catch (err) {
      this.addError = 'Error adding item.';
    }
  }
}
