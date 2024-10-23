import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiUrl = environment.ESignCenterAPI +"User";

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserDocuments(userId:number): Observable<any> {
    return this.http.get<any>(this.apiUrl+"/get-user-document/"+userId);
  }

  getUserDocument(userId:number): Observable<any> {
    return this.http.get<any>(this.apiUrl+"/get-user-document-by-id/"+ userId);
  }
}


