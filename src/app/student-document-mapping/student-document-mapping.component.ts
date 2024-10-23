import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-document-mapping',
  standalone: true,
  imports: [],
  templateUrl: './student-document-mapping.component.html',
  styleUrl: './student-document-mapping.component.css'
})
export class StudentDocumentMappingComponent {
  constructor(private router: Router) {}

  onNameClick() {
    this.router.navigate(['/student-detail']);
  }
}
