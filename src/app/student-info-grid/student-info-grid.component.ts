import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import {MatTableModule} from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-student-info-grid',
  standalone: true,
  imports: [CommonModule,MatTableModule],
  templateUrl: './student-info-grid.component.html',
  styleUrl: './student-info-grid.component.css'
})
export class StudentInfoGridComponent implements OnInit {
  displayedColumns: string[] = ['studentNumber', 'name', 'address'];
  dataSource: any[] = [];

  constructor(private studentService:StudentService,private router:Router) {}

  ngOnInit() {
    this.studentService.getStudents().subscribe(data => {
      this.dataSource = data;
    });
  }

  navigateToStudentDocument(studentId: number): void {
   // this.router.navigate(['/student-document', studentId]);
    this.router.navigate(['/student/document', studentId]);
  }
}
