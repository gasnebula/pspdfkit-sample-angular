import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-signer-list',
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.css'],
	standalone: true,
	imports: [CommonModule],
})
export class SignerListComponent {
  signers = [
    { id: 'student101', name: 'Student',email:'gasolanki120@gmail.com' },
    { id: 'staff101', name: 'Staff' ,email:'gautam.solanki@nebulaedge.ai'}   
  ];
  @Input() currentSigneeEmail!: string;
  currSignee:any

  onDragStart(event: DragEvent, type: string): void {
    //event.dataTransfer?.setData('text/plain', signerId);
   this.currSignee = this.signers.find(x=>x.email == this.currentSigneeEmail);

    const instantId = "PSPDFKit.generateInstantId()";
    let data =
      this.currSignee.name + // value from select, name of signer
      "%" + // % is an invalid email character so we can use it as a delimiter
      this.currSignee.email + // value from select, email of signer
      "%" +
      instantId +
      "%" +
      type;

    (event.target as HTMLDivElement).style.opacity = "0.8";
    const img = document.getElementById(`${type}-icon`);
    if (img) {
      event.dataTransfer?.setDragImage(img, 10, 10);
    }
    event.dataTransfer?.setData("text/plain", data);
    event.dataTransfer!.dropEffect = "move";
  }
}
