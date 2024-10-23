import { Component } from '@angular/core';
import { StudentService } from '../student.service';
import { ActivatedRoute, Router } from '@angular/router';
import {MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-student-document-grid',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './student-document-grid.component.html',
  styleUrl: './student-document-grid.component.css'
})
export class StudentDocumentGridComponent {
  displayedColumns: string[] = [ 'documentname','documentassigned','studentsigncompleted', 'documentcompleted'];
  dataSource: any[] = [];
  studentId :any;
  constructor(private studentService:StudentService,private router:Router,private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('studentId');
    this.studentService.getStudentDocuments(this.studentId ).subscribe(data => {
      this.dataSource = data;
    });
  }

  navigateToStudentDocumentList(studentDocumentId: number): void {
    // this.router.navigate(['/student-document', studentId]);
     this.router.navigate(['/student-document', studentDocumentId]);
   }

}
