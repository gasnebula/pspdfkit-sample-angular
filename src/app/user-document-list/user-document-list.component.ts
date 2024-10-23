import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-user-document-list',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './user-document-list.component.html',
  styleUrl: './user-document-list.component.css'
})
export class UserDocumentListComponent {
  displayedColumns: string[] = [ 'description', 'documentcompleted','applySignature'];
  dataSource: any[] = [];
  userId :any;
  constructor(private studentService:StudentService,private userService:UserService,private router:Router,private route: ActivatedRoute) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.getUserDocuments();
  }
  getUserDocuments(){
    this.userService.getUserDocuments(this.userId ).subscribe(data => {
      this.dataSource = data;
    });
  }

  navigateToUserDocumentList(studentDocumentId: any): void {
     this.router.navigate(['/user-document', studentDocumentId]);
  }

  applySignature = async(studentDocumentId: any) =>{
    //const documentData = await this.instance.exportPDF();
    //const base64String = btoa(String.fromCharCode(...new Uint8Array(documentData)));
    var requestData = {
      StudentDocumentId: studentDocumentId,
      DocumentData: null,
      SignatureData: null,
      SignCompleted: true,
      DocumentDataBase64: "",
      ApplySignatureExternally : true
    };

    this.studentService.saveStudentDocument(requestData).subscribe(data => {
      alert("Document signed successfully");
      //this.router.navigate(['/students']);
      this.getUserDocuments();
    });
  }
}

