import { Routes } from '@angular/router';
import { CreatePdfComponent } from './create-pdf/create-pdf.component';
import { ViewPdfComponent } from './view-pdf/view-pdf.component';
import { AppComponent } from './app.component';
import { PdfManagerComponent } from './pdf-manager/pdf-manager.component';
import { SignDemoComponent } from './sign-demo/sign-demo.component';
import { StudentInfoGridComponent } from './student-info-grid/student-info-grid.component';
import { StudentDocumentComponent } from './student-document/student-document.component';
import { WorkflowDemoComponent } from './workflow-demo/workflow-demo.component';
import { SignWorkflowComponent } from './sign-workflow/sign-workflow.component';
import { StudentDocumentGridComponent } from './student-document-grid/student-document-grid.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserDocumentListComponent } from './user-document-list/user-document-list.component';
import { UserDocumentComponent } from './user-document/user-document.component';
import { AssignDocumentComponent } from './assign-document/assign-document.component';
import { StudentDocumentMappingComponent } from './student-document-mapping/student-document-mapping.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';

export const routes: Routes = [
    {path: '',component: StudentDocumentMappingComponent},
    //{ path: '', component: StudentInfoGridComponent }, 
    {path: 'create-pdf',component: CreatePdfComponent},
    { path: 'view-pdf', component: ViewPdfComponent },
    { path: 'view-pdf/:userId', component: ViewPdfComponent },
    { path: 'sign-pdf', component: SignDemoComponent },
    {path: 'workflow',component: WorkflowDemoComponent},
   // {path: 'student-document',component: StudentDocumentComponent},
    {path: 'students',component: StudentInfoGridComponent},
    {path: 'assign-document',component: AssignDocumentComponent},
    {path: 'student/document/:studentId', component:StudentDocumentGridComponent},
    {path: 'student-document/:studentDocumentMappingId',component: StudentDocumentComponent},
    {path: 'users',component: UserListComponent},
    {path: 'user/document/:userId', component:UserDocumentListComponent},
    {path: 'user-document/:studentDocumentMappingId',component: UserDocumentComponent},
    {path: 'sign-workflow',component: SignWorkflowComponent},
    {path: 'student-document-mapping',component: StudentDocumentMappingComponent},
    {path: 'student-detail',component: StudentDetailComponent}
];
