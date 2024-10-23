import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = environment.ESignCenterAPI +"Student";

  constructor(private http: HttpClient) { }


  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getStudentDocuments(studentId:number): Observable<any> {
    return this.http.get<any>(this.apiUrl+"/get-student-document/"+studentId);
  }

  getStudentDocument(studentDocumentId:number): Observable<any> {
    return this.http.get<any>(this.apiUrl+"/get-student-document-by-id/"+ studentDocumentId);
  }

  saveStudentDocument(data:any): Observable<any> {
    return this.http.post<any>(this.apiUrl+"/save-student-document",data);
  }

  assignDocument(): Observable<any> {
    return this.http.post<any>(this.apiUrl+"/assign-document",null);
  }

  getStudentDocumentId(): Observable<any> {
    return this.http.get<any>(this.apiUrl+"/get-student-document-id/");
  }

  // Method to save the student's signature
  saveStudentSignature(studentDocumentId : number, documentDataBase64: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save-student-signature`, {
      StudentDocumentId: studentDocumentId,
      DocumentDataBase64: documentDataBase64
    });
  }

   // Retrieve the student's signature
   getStudentSignature(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-student-signature/${studentId}`);
  }
}
