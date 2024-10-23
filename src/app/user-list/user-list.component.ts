import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [MatTableModule,CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  displayedColumns: string[] = ['name', 'email', 'designation'];
  dataSource: any[] = [];
  userId :any;

  constructor(private userService:UserService,private router:Router) {}

  ngOnInit(){
    this.userService.getUsers().subscribe(data => {
      this.dataSource = data;
    });
  }

  navigateToUserDocument(studentDocumentId: number): void {
    // this.router.navigate(['/student-document', studentId]);
     this.router.navigate(['/user/document', studentDocumentId]);
   }
}
