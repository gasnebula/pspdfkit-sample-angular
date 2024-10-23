import { CommonModule } from '@angular/common';
import {Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignerDropComponent } from '../workflow-drop/workflow-drop.component';
import { SignerListComponent } from '../workflow-list/workflow-list.component';
@Component({
 selector: 'app-workflow',
 standalone: true,
 imports: [CommonModule,SignerListComponent,SignerDropComponent],
 templateUrl: './workflow-demo.component.html',
 styleUrl: './workflow-demo.component.css'
})
export class WorkflowDemoComponent {
 	title = "Esigncenter";
}
