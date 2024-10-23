import { Component, ViewChild, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import { Router } from '@angular/router';
import { MatTableDataSource,MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-assign-document',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatTableModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    FormsModule,
    MatOptionModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  templateUrl: './assign-document.component.html',
  styleUrls: ['./assign-document.component.css'],
})
export class AssignDocumentComponent implements OnInit {
  displayedColumns: string[] = ['name', 'studentNumber', 'campusCode', 'programCode', 'startDate', 'graduationDate', 'campusStatus', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private studentService: StudentService, private router: Router, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    // Register custom SVG icons
    this.iconRegistry.addSvgIcon('add_icon', this.sanitizer.bypassSecurityTrustResourceUrl('assets/add.svg'));
    this.iconRegistry.addSvgIcon('view_icon', this.sanitizer.bypassSecurityTrustResourceUrl('assets/view.svg'));
    this.iconRegistry.addSvgIcon('email_icon', this.sanitizer.bypassSecurityTrustResourceUrl('assets/email.svg'));
  }

  ngOnInit() {
    this.studentService.getStudents().subscribe(data => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator; // Set paginator for the data source
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  navigateToStudentDocument(studentId: number): void {
    this.router.navigate(['/student/document', studentId]);
  }
}
