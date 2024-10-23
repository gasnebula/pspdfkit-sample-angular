import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePdfComponent } from '../create-pdf/create-pdf.component';
import { ViewPdfComponent } from '../view-pdf/view-pdf.component';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-pdf-manager',
  standalone: true,
  imports: [CommonModule,CreatePdfComponent,ViewPdfComponent,RouterOutlet],
  templateUrl: './pdf-manager.component.html',
  styleUrl: './pdf-manager.component.css'
})
export class PdfManagerComponent {
  sidebarOpen = false;
  constructor(private router:Router){}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onAssignClick() {
    this.router.navigate(['/workflow']);  // Navigate to create-pdf
    console.log('Assign button clicked');
  }

  onViewClick() {
    this.router.navigate(['/view-pdf']);  // Navigate to view-pdf
    console.log('View button clicked');
  }
}

