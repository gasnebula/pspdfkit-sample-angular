import {Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PdfManagerComponent } from './pdf-manager/pdf-manager.component';
import { ViewPdfComponent } from './view-pdf/view-pdf.component';
import { SignDemoComponent } from './sign-demo/sign-demo.component';
import { StudentInfoGridComponent } from './student-info-grid/student-info-grid.component';
import { StudentDocumentComponent } from './student-document/student-document.component';
import { WorkflowDemoComponent } from './workflow-demo/workflow-demo.component';
import { SignerDropComponent } from './workflow-drop/workflow-drop.component';
import { SignerListComponent } from './workflow-list/workflow-list.component';
import { SignWorkflowComponent } from './sign-workflow/sign-workflow.component';
@Component({
 selector: 'app-root',
 standalone: true,
 imports: [RouterOutlet,PdfManagerComponent,SignDemoComponent,StudentInfoGridComponent,StudentDocumentComponent,WorkflowDemoComponent,SignWorkflowComponent],
 templateUrl: './app.component.html',
 styleUrl: './app.component.css'
})
export class AppComponent {
 	title = "Esigncenter";
}
