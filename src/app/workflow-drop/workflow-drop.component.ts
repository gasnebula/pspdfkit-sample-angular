import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import PSPDFKit, { ViewState } from "pspdfkit";
import { SignerListComponent } from '../workflow-list/workflow-list.component';
import { AnnotationTypeEnum, User } from '../utils/types';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-signer-drop',
  templateUrl: './workflow-drop.component.html',
  styleUrls: ['./workflow-drop.component.css'],
  standalone: true,
  imports: [CommonModule, SignerListComponent],
})
export class SignerDropComponent implements OnInit {
  @ViewChild('dropZone', { static: true }) dropZone!: ElementRef;
  signers = [
    { id: 'student', name: 'Student', email: 'gasolanki120@gmail.com', color: 'green' },
    { id: 'staff', name: 'Staff', email: 'gautam.solanki@nebulaedge.ai', color: 'blue' }
  ];
  private instance!: any;
  private pageIndex: any = 0;
  private users: User[] = [];
  private currentUser: any;
  private currentSignee: any;
  private isTextAnnotationMovable = false;
  pdfDocument: any;

  renderConfigurations: any = {};
  constructor(private router: Router) {
    console.log("create pdf called");
  }
  ngOnInit(): void {
    this.currentSignee = this.signers.find(x => x.email == 'gasolanki120@gmail.com');
    this.currentUser = {
      id: 'student101',
      email: 'gasolanki120@gmail.com',
      name: 'Gautam Solanki',
      role: 'SE'
    };

    this.loadPdf();
  }

  private async loadPdf(): Promise<void> {
    this.instance = await PSPDFKit.load({
      container: this.dropZone.nativeElement,
      //licenseKey: environment.PSPDFKitLicenceKey,
      // Use the assets directory URL as a base URL. PSPDFKit will download its library assets from here.
      baseUrl: environment.PSPDFKitLibUrl, //location.protocol + "//" + location.host + "/assets/",
      document: "/assets/Sample PDF.pdf",

      toolbarItems: [
        ...PSPDFKit.defaultToolbarItems,
        // {
        //   type: "form-creator"
        // }
        //,

        { type: "content-editor" }
      ],
      customRenderers: {
        Annotation: ({ annotation }: any) => {
          // if(digitallySigned && annotation.customData?.type === AnnotationTypeEnum.DS){
          //   const isFieldSigned = digitallySigned.signatures.find((sign: any) => sign.signatureFormFQN === annotation.formFieldName);
          //   const ele = document.createElement('div');
          //   if(isFieldSigned) return {node : ele, append: true}
          // }
          return this.getAnnotationRenderers({ annotation })
        }
      },
    }).then(instance => {
      this.instance = instance;
      instance.setViewState(viewState => viewState.set("interactionMode", PSPDFKit.InteractionMode.FORM_CREATOR));
      instance.setViewState((viewState: any) => viewState.set("showToolbar", true));

      //(window as any).instance = instance; 

      // **** Setting Page Index ****
      instance.addEventListener(
        "viewState.currentPageIndex.change",
        (page: any) => {
          this.setOnPageIndex(page);
        }
      );

      // **** Handling Add Signature / Initial UI ****
      // Track which signature form field was clicked on
      // and wether it was an initial field or not.
      instance.addEventListener("annotations.press", (event: any) => {
        let lastFormFieldClicked = event.annotation;

        let annotationsToLoad;
        // if (
        //   lastFormFieldClicked.customData &&
        //   lastFormFieldClicked.customData.isInitial === true
        // ) {
        //   annotationsToLoad = sessionInitials;

        //   isCreateInitial = true;
        // } else {
        //   annotationsToLoad = sessionSignatures;

        //   isCreateInitial = false;
        // }
        // instance.setStoredSignatures(
        //   PSPDFKit.Immutable.List(annotationsToLoad)
        // );

        // if (
        //   !isTextAnnotationMovableRef.current &&
        //   event.annotation instanceof PSPDFKit.Annotations.TextAnnotation
        // ) {
        //   //@ts-ignore
        //   event.preventDefault();
        // }
      });


      let formDesignMode = !1;

      instance.setToolbarItems((items: any) => [
        ...items,
        { type: "form-creator" },
      ]);
      instance.addEventListener("viewState.change", (viewState: any) => {
        formDesignMode = viewState.formDesignMode === true;
      });

      instance.addEventListener(
        "storedSignatures.create",
        async (annotation: any) => {
          // Logic for showing signatures and intials in the UI
          // if (isCreateInitial) {
          //   setSessionInitials([...sessionInitials, annotation]);
          // } else {
          //   setSessionSignatures([...sessionSignatures, annotation]);
          // }
        }
      );

      // **** Handling Signature / Initial fields appearance ****

      instance.addEventListener(
        "annotations.load",
        async function (loadedAnnotations: any) {
          for await (const annotation of loadedAnnotations) {
            // await handleAnnotatitonCreation(
            //   instance,
            //   annotation,
            //   mySignatureIdsRef,
            //   setSignatureAnnotationIds,
            //   currUser.email
            // );
          }
        }
      );

      instance.addEventListener(
        "annotations.create",
        async function (createdAnnotations: any) {
          const annotation = createdAnnotations.get(0);
          // await handleAnnotatitonCreation(
          //   instance,
          //   annotation,
          //   mySignatureIdsRef,
          //   setSignatureAnnotationIds,
          //   this.currentUser?.email
          // );
        }
      );

      instance.addEventListener(
        "annotations.delete",
        async (deletedAnnotations: any) => {
          const annotation = deletedAnnotations.get(0);
          // await handleAnnotatitonDelete(instance, annotation, this.currentUser?.email);
          // const updatedAnnotationIds = mySignatureIdsRef.current.filter(
          //   (id) => id !== annotation.id
          // );
          //(updatedAnnotationIds);
          //mySignatureIdsRef.current = updatedAnnotationIds;
        }
      );
      instance.setViewState((viewState: any) =>
        viewState.set(
          "interactionMode",
          PSPDFKit.InteractionMode.FORM_CREATOR
        )
      );
      this.setIsTextAnnotationMovable(true);
      return instance;
    });
    this.setupDragAndDrop();
  }

  private setOnPageIndex(pageIndex: any) {
    this.pageIndex = pageIndex;
  }

  private setUsers(allUsers: User[]) {
    return this.users = allUsers;
  }

  private setCurrSignee(pageIndex: any) {
    return this.users.find((user) => user.role !== "Editor")
  }

  private setIsTextAnnotationMovable(isMovable: boolean) {
    this.isTextAnnotationMovable = isMovable;
  }


  private setupDragAndDrop(): void {
    const dropZoneElement = this.dropZone.nativeElement;

    dropZoneElement.addEventListener('dragover', (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'copy'; // Show copy icon
    });

    dropZoneElement.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();
      const signerData = event.dataTransfer!.getData('text/plain');
      this.handleDrop(signerData, event);
    });
  }

  private handleDrop(signerData: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Get the mouse position when dropping the signature
    const rect = this.dropZone.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    const dataArray = event.dataTransfer!.getData("text").split("%");
    let [name, email, instantId, annotationType] = dataArray;
    instantId = PSPDFKit.generateInstantId();

    const signee = this.currentSignee;// currSigneeRef.current;
    const user = this.currentUser; //currUserRef.current;
    const pageIndex = this.pageIndex;// onPageIndexRef.current;
    let rectWidth = 120;
    let rectHeight = 40;
    switch (annotationType) {
      case AnnotationTypeEnum.INITIAL:
        rectWidth = 70;
        rectHeight = 40;
        break;

      case AnnotationTypeEnum.SIGNATURE:
        rectWidth = 120;
        rectHeight = 60;
        break;

      case AnnotationTypeEnum.DS:
        rectWidth = 250;
        rectHeight = 100;
        break;

      default:
        break;
    }

    const clientRect = new PSPDFKit.Geometry.Rect({
      left: event.clientX - rectWidth / 2,
      top: event.clientY - rectHeight / 2,
      height: rectHeight,
      width: rectWidth,
    });
    const pageRect = this.instance.transformContentClientToPageSpace(
      clientRect,
      pageIndex
    ) as any;
    if (
      annotationType === AnnotationTypeEnum.SIGNATURE ||
      annotationType === AnnotationTypeEnum.INITIAL
    ) {
      const widget = new PSPDFKit.Annotations.WidgetAnnotation({
        boundingBox: pageRect,
        formFieldName: instantId,
        id: instantId,
        pageIndex,
        name: instantId,
        customData: {
          createdBy: user?.id,
          signerID: signee?.id,
          signerEmail: email,
          type: annotationType,
          signerColor: signee?.color,
          isInitial: annotationType === AnnotationTypeEnum.INITIAL,
        },
        //backgroundColor: signee.color,
      });
      const formField = new PSPDFKit.FormFields.SignatureFormField({
        annotationIds: PSPDFKit.Immutable.List([widget.id]),
        name: instantId,
        id: instantId,
        readOnly: signee.id != user.id,
      });
      this.instance.create([widget, formField]);
    }
    else if (annotationType === AnnotationTypeEnum.DS) {
      const widget = new PSPDFKit.Annotations.WidgetAnnotation({
        boundingBox: pageRect,
        formFieldName: "DigitalSignature",
        id: instantId,
        pageIndex,
        name: instantId,
        customData: {
          createdBy: user.id,
          signerID: user.id,
          signerEmail: email,
          type: annotationType,
          signerColor: PSPDFKit.Color.WHITE,
          isInitial: false,
        },
        //backgroundColor: signee.color,
      });
      const formField = new PSPDFKit.FormFields.SignatureFormField({
        annotationIds: PSPDFKit.Immutable.List([widget.id]),
        name: 'DigitalSignature',
        id: instantId,
        readOnly: signee.id != user.id,
      });
      const created = this.instance.create([widget, formField]);
      console.log("Digital Signature created", created);
    }
    else {
      const text = new PSPDFKit.Annotations.TextAnnotation({
        pageIndex,
        boundingBox: pageRect,
        text: {
          format: "plain",
          value: annotationType === "name" ? name : new Date().toDateString(),
        },
        name: name,
        customData: {
          signerEmail: email,
          type: annotationType,
          signerColor: signee?.color,
        },
        font: "Helvetica",
        fontSize: 14,
        horizontalAlign: "center",
        verticalAlign: "center",
        isEditable: false,
        //backgroundColor: signee?.color,
      });
      this.instance.create(text);
    }

  }

  addStudentNumber = async () => {
    this.createCustomField("txtStudentNumber_", "text");

  }

  addStudentName = async () => {
    this.createCustomField("txtStudentName_", "text");
  }

  addStudentAddress = async () => {
    this.createCustomField("txtStudentAddress_", "text");
  }

  createCustomField = async (fieldName: string, fieldType: string) => {
    const uniqueId = PSPDFKit.generateInstantId();

    const widget = new PSPDFKit.Annotations.WidgetAnnotation({
      id: uniqueId,
      pageIndex: 0,  // Set page index where the widget should appear
      formFieldName: fieldName + uniqueId,  // Unique form field name
      boundingBox: new PSPDFKit.Geometry.Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 40
      })
    });


    if (fieldType == "text") {

      const formField = new PSPDFKit.FormFields.TextFormField({
        name: fieldName + uniqueId,
        annotationIds: PSPDFKit.Immutable.List([widget.id]),
        readOnly: true
      });

      await this.instance.create([widget, formField]);
    }
  }
  // Function to download the currently loaded PDF from PSPDFKit
  downloadPdf = async () => {
    if (this.instance) {
      try {
        // Export the current PDF as a Blob
        const pdfBlob = await this.instance.exportPDF();

        // Create a download link
        const url = window.URL.createObjectURL(pdfBlob);
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

  // Function to trigger the signature tool in PSPDFKit
  openSignature() {
    if (this.instance) {
      this.instance.executeCommand("startNewSignature");
    }
  }
  ngOnDestroy() {
    // Unload the PSPDFKit instance when the component is destroyed to prevent memory leaks
    if (this.instance) {
      //this.instance.unload();
      PSPDFKit.unload(this.instance);
    }
  }


  getAnnotationRenderers = ({ annotation }: any) => {

    if (annotation.isSignature && annotation.customData?.type !== AnnotationTypeEnum.DS) {
      // Create a new div element
      const box = document.createElement('div');

      // Apply box styles
      box.className = 'signature-box-demo';
      box.innerHTML = `<span class="signature-label-demo">By PSPDFKit</span><span class="signature-id-demo">${annotation.id.substring(0, 15) + (annotation.id.length > 15 ? '...' : '')}</span>`
      box.style.height = (annotation.boundingBox.height / 16) + 'rem';
      box.style.width = (annotation.boundingBox.width / 16) + 'rem';
      box.style.setProperty('--box-height', (annotation.boundingBox.height / 16) + 'rem');
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
  }


  createCustomSignatureNode({ annotation, type }: any) {
    const container = document.createElement("div");

    if (type === AnnotationTypeEnum.SIGNATURE) {
      container.innerHTML = `<div class="custom-annotation-wrapper custom-signature-wrapper" style="background-color: rgb(${annotation.customData?.signerColor.r},${annotation.customData?.signerColor.g},${annotation.customData?.signerColor.b})">
          <div class="custom-signature">
            <div class="custom-signature-label">
               Sign
            </div>
            <svg fill="#000000" width="1.5625rem" height="1.25rem" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>down-round</title>
              <path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208q0 3.264-1.28 6.208t-3.392 5.12-5.12 3.424-6.208 1.248-6.208-1.248-5.12-3.424-3.392-5.12-1.28-6.208zM4 16q0 3.264 1.6 6.048t4.384 4.352 6.016 1.6 6.016-1.6 4.384-4.352 1.6-6.048-1.6-6.016-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016zM10.048 18.4q-0.128-0.576 0.096-1.152t0.736-0.896 1.12-0.352h2.016v-5.984q0-0.832 0.576-1.408t1.408-0.608 1.408 0.608 0.608 1.408v5.984h1.984q0.608 0 1.12 0.352t0.736 0.896q0.224 0.576 0.096 1.152t-0.544 1.024l-4 4q-0.576 0.576-1.408 0.576t-1.408-0.576l-4-4q-0.448-0.416-0.544-1.024z"></path>
            </svg>
          </div>
        </div>`;
    } else if (type === AnnotationTypeEnum.INITIAL) {
      container.innerHTML = `<div class="custom-annotation-wrapper custom-signature-wrapper" style="height:3rem; background-color: rgb(${annotation.customData?.signerColor.r},${annotation.customData?.signerColor.g},${annotation.customData?.signerColor.b})">
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
      container.innerHTML = `<div class="custom-annotation-wrapper custom-signature-wrapper" style="height: 6rem; background-color: rgb(${annotation.customData?.signerColor.r},${annotation.customData?.signerColor.g},${annotation.customData?.signerColor.b})">
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
}
