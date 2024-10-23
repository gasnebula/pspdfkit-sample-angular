import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../student.service';
import { environment } from '../../environments/environment';
import PSPDFKit, { Instance } from 'pspdfkit';
import { AnnotationTypeEnum } from '../utils/types';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent {
  instance: any;
  studentId: any;
  studentDocumentData: any;
  pdfData: any;
  pspdfkitService: any;
  isTextAnnotationMovable: boolean = false;
  currUser: any;
  renderConfigurations: any = [];
  mySignatureIdsRef: any = [];
  signatureAnnotationIds: any = [];
  newAssigned: boolean = false;
  constructor(private studentService: StudentService, private router: Router) {

  }
  ngOnInit(): void {
    //this.studentId = this.route.snapshot.paramMap.get('studentDocumentMappingId');
    // this.getStudentDocumentId();
  }
  AssignDoc = async () => {


    this.newAssigned = true;
    this.studentService.assignDocument().subscribe(data => {
      //this.dataSource = data;
    });
  }

  getStudentDocumentId() {
    this.studentService.getStudentDocumentId().subscribe(data => {
      let studentDocumentId = data?.studentDocumentId;
      if (studentDocumentId > 0) {
        document.getElementById("pills-profile-tab")?.click();
        this.getStudentDocumentDetail(studentDocumentId);
        //this.bindStudentDocument();
      }
    });
  }
  getStudentDocumentDetail(studentDocumentId: number) {
    this.studentService.getStudentDocument(studentDocumentId).subscribe(data => {
      this.studentDocumentData = data;
      if (this.studentDocumentData != null) {
        this.bindStudentDocument();
      }
    });
  }

  async makeFormFieldsReadonly() {
    const formFieldValues = [
      { name: 'txtStudentAddress', value: '' }
    ];


    try {
      const formFields = await this.instance.getFormFields();

      // Iterate over each form field and set the value
      for (const formField of formFields) {
        const matchingField = formFieldValues.find(field => formField.name.indexOf(field.name) > -1);
        if (matchingField) {
          console.log("Before setting:", formField);

          const annotations = await this.instance.getAnnotations(0); // Adjust for relevant pages
          for (const annotation of annotations) {
            if (annotation.formFieldName === formField.name) {

              let key: string = formField.name;
              let value: string = matchingField.value;
              let newObj = {
                [key]: value
              }
              await this.instance.update([
                formField.set("isEditable", false),
                formField.set("readOnly", true)
              ]);
            }
          }

          console.log("After setting:", formField);
        }
      }
      console.log('Form fields populated successfully!');
    } catch (error) {
      console.error('Error setting form field values:', error);
    }
  }


  bindStudentDocument() {


    const arrayBuffer = this.byteToArrayBuffer(this.studentDocumentData.documentData);
    let currentObject = this;

    if (this.instance) {
      PSPDFKit.unload(this.instance);
    }

    PSPDFKit.load({
      //licenseKey: environment.PSPDFKitLicenceKey,
      baseUrl: environment.PSPDFKitLibUrl,//location.protocol + "//" + location.host + "/assets/",
      document: arrayBuffer,//this.byteToUint8Array(this.studentDocumentData.documentData), //this.pdfData, //"/assets/studentformnew.pdf",
      container: "#pspdfkit-container",
      isEditableAnnotation: function (annotation: any) {
        return !annotation.isSignature;
      },
      customRenderers: this.getCustomRenderers(),
      styleSheets: ['/assets/viewer.css']
      // toolbarItems: [
      // 	...PSPDFKit.defaultToolbarItems,
      // 	{
      // 		type: "form-creator",
      // 	}
      // ]
    }).then(instance => {
      this.instance = instance;
      let signIds = this.mySignatureIdsRef;
      let annotationIds = [this.signatureAnnotationIds, this.setSignatureAnnotationIds([])];
      this.instance.addEventListener(
        "annotations.load",
        async function (loadedAnnotations: any) {
          for await (const annotation of loadedAnnotations) {
            currentObject.handleAnnotatitonCreation(
              instance,
              annotation,
              signIds,
              annotationIds
            );
          }
        }
      );

      this.instance.addEventListener(
        "annotations.create",
        async function (createdAnnotations: any) {
          const annotation = createdAnnotations.get(0);
          currentObject.handleAnnotatitonCreation(
            instance,
            annotation,
            signIds,
            annotationIds
          );
        }
      );
      this.instance.setViewState((viewState: any) => viewState.set("showToolbar", false));
      if (this.studentDocumentData?.documentCompleted == null || this.studentDocumentData?.documentCompleted == false) {
        this.makeFormFieldsReadonly();

        this.setSignFieldsBasedOnUser(this.studentDocumentData?.currentUserRole);
        //this.bindGoogleMapAddress();
      } else {
        this.instance.setViewState((viewState: any) => viewState.set("showToolbar", false));
        this.instance.setViewState((viewState: any) => viewState.set("readOnly", true));
      }
    });
  }
  setSignatureAnnotationIds(signIds: string[]) {
    this.signatureAnnotationIds = [...signIds];
  }
  byteToArrayBuffer(byteArray: any): ArrayBuffer {
    // If byteArray is a Base64 string
    if (typeof byteArray === 'string') {
      const binaryString = window.atob(byteArray);
      const len = binaryString.length;
      const uint8Array = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      return uint8Array.buffer; // Return ArrayBuffer
    } else if (Array.isArray(byteArray)) {
      // If it's an array of bytes, convert to ArrayBuffer
      const uint8Array = new Uint8Array(byteArray);
      return uint8Array.buffer; // Return ArrayBuffer
    } else {
      throw new Error("Unsupported document data format.");
    }
  }
  downloadPdf = async () => {
    if (this.instance) {
      try {
        // Export the current PDF as a Blob
        const pdfBlob = await this.instance.exportPDF();

        let newblob = new Blob([pdfBlob]);
        // Create a download link
        const url = window.URL.createObjectURL(newblob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'downloaded.pdf';  // Set the desired file name

        // Append to body, trigger the download, and clean up
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('PDF downloaded successfully!');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to download PDF.');
      }
    } else {
      alert('PSPDFKit instance is not initialized.');
    }
  }


  submitDocument = async () => {
    const documentData = await this.instance.exportPDF();
    // const base64String = btoa(String.fromCharCode(...new Uint8Array(documentData)));
    const base64String = btoa(new Uint8Array(documentData).reduce(
      function (data, byte) {
        return data + String.fromCharCode(byte);
      },
      ''
    ));
    var requestData = {
      StudentDocumentId: this.studentDocumentData.id,
      DocumentData: null,
      SignatureData: null,
      SignCompleted: true,
      DocumentDataBase64: base64String
    };

    this.studentService.saveStudentDocument(requestData).subscribe(data => {
      alert("Document submitted successfully");
      document.getElementById("pills-home-tab")?.click();
      //this.router.navigate(['/users']);
    });
  }


  setIsTextAnnotationMovable(value: boolean) {
    this.isTextAnnotationMovable = value;
  }

  setSignFieldsBasedOnUser = async (userRole: any) => {
    let user = { role: userRole };
    const formFields = await this.instance.getFormFields();
    const signatureFormFields = formFields.filter(
      (field: any) => field instanceof PSPDFKit.FormFields.SignatureFormField
    );
    const signatureAnnotations = async () => {
      let annotations: any[] = [];
      for (let i = 0; i < this.instance.totalPageCount; i++) {
        let ann = await this.instance.getAnnotations(i);
        ann.forEach((annotation: any) => {
          if (
            annotation.customData &&
            annotation.customData.signerRole == user.role
          ) {
            annotations.push(annotation.id);
          }
        });
      }
      return annotations;
    };
    const userFieldIds = await signatureAnnotations();
    const readOnlyFormFields = signatureFormFields
      .map((it: any) => {
        if (userFieldIds.includes(it.name)) {
          return it.set("readOnly", false);
        } else {
          return it.set("readOnly", true);
        }
      })
      .filter(Boolean); // Filter out undefined values
    await this.instance.update(readOnlyFormFields);
  }

  private getCustomRenderers(): any {
    return {
      Annotation: ({ annotation }: any) => {
        // if (annotation.customData?.type === 'DigitalSignature') {
        //   const ele = document.createElement('div');
        //   ele.innerHTML = 'Digital Signature';
        //   return { node: ele, append: true };
        // }
        // return null;
        return this.getAnnotationRenderers({ annotation })
      }
    };
  }

  getAnnotationRenderers = ({ annotation }: any) => {

    if (annotation.isSignature && annotation.customData?.type !== AnnotationTypeEnum.DS) {
      // Create a new div element
      const box = document.createElement('div');

      // Apply box styles
      box.className = 'signature-box-demo';
      // box.innerHTML = `<span class="signature-label-demo">By PSPDFKit</span><span class="signature-id-demo">${annotation.id.substring(0, 15) + (annotation.id.length > 15 ? '...' : '')}</span>`
      box.innerHTML = `<span class="signature-id-demo">${annotation.id}</span>`
      box.style.height = (annotation.boundingBox.height / 16) + 'rem';
      box.style.width = (annotation.boundingBox.width / 16) + 'rem';
      box.style.setProperty('--box-height', (annotation.boundingBox.height / 50) + 'rem');
      //box.style.margin = '0px';
      box.id = annotation.id;

      // Append the annotation to the box
      //box.appendChild(annotation.node);
      let ele = { node: box, append: true }
      // Replace the annotation with the box
      //annotation.node = box;
      return ele;
    }
    if (annotation.name) {

      if (this.renderConfigurations[annotation.id]) {
        return this.renderConfigurations[annotation.id];
      }

      this.renderConfigurations[annotation.id] = {
        node: this.createCustomSignatureNode({
          annotation,
          type: annotation.customData?.type,
        }),
        append: true,
      };

      return this.renderConfigurations[annotation.id] || null;
    }
  };

  createCustomSignatureNode({ annotation, type }: any) {
    const container = document.createElement("div");

    if (type === AnnotationTypeEnum.SIGNATURE) {
      container.innerHTML = `<div class="custom-annotation-wrapper custom-signature-wrapper" style="background-color: ${annotation.customData?.signerColor}">
      <div class="custom-signature">
        <div class="custom-signature-label">
             <span style="color: #ffff;margin: auto;vertical-align: super;">Sign</span>
             <svg fill="#ffff" width="1.5625rem" height="1.25rem" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>down-round</title>
              <path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208q0 3.264-1.28 6.208t-3.392 5.12-5.12 3.424-6.208 1.248-6.208-1.248-5.12-3.424-3.392-5.12-1.28-6.208zM4 16q0 3.264 1.6 6.048t4.384 4.352 6.016 1.6 6.016-1.6 4.384-4.352 1.6-6.048-1.6-6.016-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016zM10.048 18.4q-0.128-0.576 0.096-1.152t0.736-0.896 1.12-0.352h2.016v-5.984q0-0.832 0.576-1.408t1.408-0.608 1.408 0.608 0.608 1.408v5.984h1.984q0.608 0 1.12 0.352t0.736 0.896q0.224 0.576 0.096 1.152t-0.544 1.024l-4 4q-0.576 0.576-1.408 0.576t-1.408-0.576l-4-4q-0.448-0.416-0.544-1.024z"></path>
            </svg>
        </div>
      
      </div>
    </div>`;
    } else if (type === AnnotationTypeEnum.INITIAL) {
      container.innerHTML = `<div class="custom-annotation-wrapper custom-signature-wrapper" style="height:3rem; background-color: ${annotation.customData?.signerColor}">
          <div class="custom-signature">
            <div class="custom-signature-label">
               Initial
            </div>
            <svg fill="#000000" width="1.5625rem" height="1.25rem" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>down-round</title>
              <path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208q0 3.264-1.28 6.208t-3.392 5.12-5.12 3.424-6.208 1.248-6.208-1.248-5.12-3.424-3.392-5.12-1.28-6.208zM4 16q0 3.264 1.6 6.048t4.384 4.352 6.016 1.6 6.016-1.6 4.384-4.352 1.6-6.048-1.6-6.016-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016zM10.048 18.4q-0.128-0.576 0.096-1.152t0.736-0.896 1.12-0.352h2.016v-5.984q0-0.832 0.576-1.408t1.408-0.608 1.408 0.608 0.608 1.408v5.984h1.984q0.608 0 1.12 0.352t0.736 0.896q0.224 0.576 0.096 1.152t-0.544 1.024l-4 4q-0.576 0.576-1.408 0.576t-1.408-0.576l-4-4q-0.448-0.416-0.544-1.024z"></path>
            </svg>
          </div>
        </div>`;
    }
    else if (type === AnnotationTypeEnum.DS) {
      container.innerHTML = `<div class="custom-annotation-wrapper custom-signature-wrapper" style="height: 6rem; background-color: ${annotation.customData?.signerColor}">
          <div class="custom-signature">
            <div class="custom-signature-label">
               Digital Signature
            </div>
            <svg fill="#000000" width="1.5625rem" height="1.25rem" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>down-round</title>
              <path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208q0 3.264-1.28 6.208t-3.392 5.12-5.12 3.424-6.208 1.248-6.208-1.248-5.12-3.424-3.392-5.12-1.28-6.208zM4 16q0 3.264 1.6 6.048t4.384 4.352 6.016 1.6 6.016-1.6 4.384-4.352 1.6-6.048-1.6-6.016-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016zM10.048 18.4q-0.128-0.576 0.096-1.152t0.736-0.896 1.12-0.352h2.016v-5.984q0-0.832 0.576-1.408t1.408-0.608 1.408 0.608 0.608 1.408v5.984h1.984q0.608 0 1.12 0.352t0.736 0.896q0.224 0.576 0.096 1.152t-0.544 1.024l-4 4q-0.576 0.576-1.408 0.576t-1.408-0.576l-4-4q-0.448-0.416-0.544-1.024z"></path>
            </svg>
          </div>
        </div>`;
    }

    return container;
  }
  handleAnnotatitonCreation = async (
    instance: any,
    annotation: any,
    mySignatureIdsRef: any,
    setSignatureAnnotationIds: any,
  ) => {
    if (annotation.isSignature) {
      for (let i = 0; i < instance.totalPageCount; i++) {
        const annotations = await instance.getAnnotations(i);
        for await (const maybeCorrectAnnotation of annotations) {
          if (
            annotation.boundingBox.isRectOverlapping(
              maybeCorrectAnnotation.boundingBox
            )
          ) {
            const newAnnotation = this.getAnnotationRenderers({
              annotation: maybeCorrectAnnotation,
            });
            if (newAnnotation?.node) {
              newAnnotation.node.className = "signed";
            }
          }
        }
      }
      const signatures = [mySignatureIdsRef, annotation.id];
      this.setSignatureAnnotationIds(signatures);
      mySignatureIdsRef = signatures;
    }
  }
}
