import { Component, OnInit } from '@angular/core';
import PSPDFKit, { Instance, Annotation, WidgetAnnotation } from 'pspdfkit';

@Component({
  selector: 'app-signature-workflow',
  templateUrl: './signature-workflow.component.html',
  styleUrls: ['./signature-workflow.component.css']
})
export class SignatureWorkflowComponent implements OnInit {
  private instance: any;
  pspdfKitInstance: Instance | undefined;
  currentUserRole = 'approver'; // This can be dynamically set based on login or workflow status

  ngOnInit() {
    PSPDFKit.load({
      container: '#pspdfkit-container',
      document: '/assets/sample.pdf', // Your PDF file path here
      licenseKey: 'YOUR_PSPDFKIT_LICENSE_KEY'
    }).then(instance => {
      this.pspdfKitInstance = instance;

      // Apply workflow conditions and permissions
     // this.setupWorkflowPermissions();
     
      // Setup annotation event listeners to restrict signing
     // this.setupSignatureEventListeners();
    });
  }
   addStudentSign() {
    const signatureElement = document.createElement('div');
    signatureElement.innerText = 'Your Signature';
    signatureElement.style.position = 'absolute';
    signatureElement.style.border = '1px solid black';
    signatureElement.style.padding = '10px';
    signatureElement.style.cursor = 'move';

    this.instance.getContainer().appendChild(signatureElement);

    // Make the signature draggable
    signatureElement.onmousedown = (event) => {
      const offsetX = event.clientX - signatureElement.getBoundingClientRect().left;
      const offsetY = event.clientY - signatureElement.getBoundingClientRect().top;

      const mouseMoveHandler = (event: MouseEvent) => {
        signatureElement.style.left = `${event.clientX - offsetX}px`;
        signatureElement.style.top = `${event.clientY - offsetY}px`;
      };

      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };
  }
}
//   // Define permissions based on user roles and workflow
//   setupWorkflowPermissions() {
//     if (!this.pspdfKitInstance) return;

//     const { currentUserRole } = this;

//     // Example logic: Only 'approver' role can sign
//     this.pspdfKitInstance.setViewState(viewState => viewState.set("readOnly", currentUserRole !== 'approver'));

//     // Hide signature fields for users who are not approvers
//     if (currentUserRole !== 'approver') {
//       this.pspdfKitInstance.getAnnotations(0).then(annotations => {
//         annotations.forEach(annotation => {
//           if (annotation instanceof PSPDFKit.Annotations.WidgetAnnotation) {
//             if (annotation.customData && annotation.customData['type'] === 'signature') {
//               this.pspdfKitInstance?.update(annotation.set('hidden', true));
//             }
//           }
//         });
//       });
//     }
//   }

//   // Restrict adding or modifying signatures based on workflow conditions
//   setupSignatureEventListeners() {
//     if (!this.pspdfKitInstance) return;

//     // this.pspdfKitInstance.addEventListener('annotations.willChange', (annotations, reason) => {
//     //   const { currentUserRole } = this;

//     //   // Prevent non-approver users from signing
//     //   if (reason === 'add' || reason === 'modify') {
//     //     annotations.forEach(annotation => {
//     //       if (
//     //         annotation instanceof PSPDFKit.Annotations.WidgetAnnotation &&
//     //         annotation.customData['type'] === 'signature'
//     //       ) {
//     //         if (currentUserRole !== 'approver') {
//     //           console.warn('You are not authorized to sign this document.');
//     //           this.pspdfKitInstance?.delete(annotation.id); // Remove unauthorized signature
//     //         }
//     //       }
//     //     });
//     //   }
//     // });
//   }
// }


