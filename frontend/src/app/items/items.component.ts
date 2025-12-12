import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent {
  @Input() title!: string;
  @Input() description!: string;
  @Input() status!: boolean;
  @Input() id!: number;

  @Output() itemDeleted = new EventEmitter<number>();
  @Output() itemDropped = new EventEmitter<{id: number, newStatus: boolean}>();

  editing: boolean = false;
  editTitle: string = '';
  editDescription: string = '';
  editStatus: boolean = false;
  // Drag and drop handlers
  onDragStart(event: DragEvent) {
    event.dataTransfer?.setData('text/plain', this.id.toString());
  }

  // Called by parent when dropped
  onDrop(newStatus: boolean) {
    this.itemDropped.emit({id: this.id, newStatus});
  }

  async deleteItem() {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('jwt') || '';
    }
    if (!token) {
      alert('No JWT token found.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/items/${this.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        alert('Failed to delete item.');
        return;
      }
      this.itemDeleted.emit(this.id);
      window.location.reload();
    } catch (err) {
      alert('Error deleting item.');
    }
  }

  startEdit() {
    this.editing = true;
    this.editTitle = this.title;
    this.editDescription = this.description;
    this.editStatus = this.status;
  }

  cancelEdit() {
    this.editing = false;
  }

  async updateItem() {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = window.localStorage.getItem('jwt') || '';
    }
    if (!token) {
      alert('No JWT token found.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/items/${this.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: this.editTitle,
          description: this.editDescription,
          status: this.editStatus
        })
      });
      if (!response.ok) {
        alert('Failed to update item.');
        return;
      }
      window.location.reload();
    } catch (err) {
      alert('Error updating item.');
    }
  }
}
