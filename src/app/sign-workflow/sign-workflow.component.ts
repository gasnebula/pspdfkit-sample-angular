import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PspdfkitService } from '../services/pspdfkit.service';
import { AnnotationTypeEnum, User } from '../utils/types';
import PSPDFKit, { Color } from 'pspdfkit';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-sign-workflow',
  templateUrl: './sign-workflow.component.html',
  styleUrls: ['./sign-workflow.component.css']
})
export class SignWorkflowComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;

  pdfUrl: string = '/assets/studentassigndocument3.pdf';
  allUsers: User[] = [];
  currUser!: User;
  currSignee!: User;
  isVisible: boolean = false;
  readyToSign: boolean = false;
  isTextAnnotationMovable: boolean = false;
  instance: any;
  
  constructor(private pspdfkitService: PspdfkitService) { }

  async ngOnInit() {
    let user1 = { id: 1, name: 'Gautam', email: 'gautam.solanki@nebulaedge.ai', role: 'Student', color: 'lightblue' }; // Set initial user
    let user2 = { id: 2, name: 'Sachin', email: 'gautam.solanki+11@nebulaedge.ai', role: 'Dean', color: 'lightblue' }; // Set initial user
    let user3 = { id: 3, name: 'Naresh', email: 'gautam.solanki+12@nebulaedge.ai', role: 'Registrar', color: 'lightblue' }; // Set initial user
    
    this.allUsers.push(user1);
    this.allUsers.push(user2);
    this.allUsers.push(user3);
    this.allUsers.forEach((user) => {
      user.color = "#0250d9";//this.randomColor(PSPDFKit);
    });
    this.currUser = user1;
    this.currSignee = user1;
    await this.loadPSPDFKit();
    
  }

  async ngOnDestroy() {
    if (this.containerRef?.nativeElement) {
      this.pspdfkitService.unload(this.containerRef.nativeElement);
    }
  }

  async loadPSPDFKit() {
    const container = this.containerRef.nativeElement;
    await this.pspdfkitService.load(container, this.pdfUrl);
    this.setupDragAndDrop();
      this.pspdfkitService.instance.setViewState((viewState: any) =>
        viewState.set("showToolbar", true)
      );
  }

  onUserChange(event: any) {
    var userId = parseInt(event.target.value);
    const selectedUser = this.allUsers.find((user) => user.id === userId);
    if (selectedUser) {
      this.currUser = selectedUser;
      this.isVisible = this.currUser.role === 'Editor';
      this.setSignFieldsBasedOnUser();
    }
  }

  setSignFieldsBasedOnUser = async () => {
    let user = this.currUser;
    const formFields = await this.pspdfkitService.instance.getFormFields();
    const signatureFormFields = formFields.filter(
      (field: any) => field instanceof PSPDFKit.FormFields.SignatureFormField
    );
    const signatureAnnotations = async () => {
      let annotations: any[] = [];
      for (let i = 0; i < this.pspdfkitService.instance.totalPageCount; i++) {
        let ann = await this.pspdfkitService.instance.getAnnotations(i);
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
    await this.pspdfkitService.instance.update(readOnlyFormFields);
    // User with role Editor can edit the document
    if (user.role == "Editor") {
      
      // this.pspdfkitService.instance.setViewState((viewState: any) =>
      //   viewState.set("showToolbar", true)
      // );
      this.setIsVisible(true);
      this.onChangeReadyToSign(false, user, PSPDFKit);
    } else {
      // this.pspdfkitService.instance.setViewState((viewState: any) =>
      //   viewState.set("showToolbar", false)
      // );
      this.setIsVisible(false);
      this.onChangeReadyToSign(true, user, PSPDFKit);
    }
  }

  onChangeReadyToSign = async (
    value: boolean,
    user: User,
    PSPDFKit: any
  ) => {
    this.setReadyToSign(value);
    if (user.role == "Editor") {
      if (value) {
        this.pspdfkitService.instance.setViewState((viewState: any) =>
          viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
        );
        this.setIsTextAnnotationMovable(false);
      } else {
        this.pspdfkitService.instance.setViewState((viewState: any) =>
          viewState.set(
            "interactionMode",
            PSPDFKit.InteractionMode.FORM_CREATOR
          )
        );
        this.setIsTextAnnotationMovable(true);
      }
    } else {
      this.pspdfkitService.instance.setViewState((viewState: any) =>
        viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
      );
      this.setIsTextAnnotationMovable(false);
    }
    
  };
  setIsVisible(value: boolean) {
    this.isVisible = value;
  }
  setReadyToSign(value: boolean) {
    this.readyToSign = value;
  }
  setIsTextAnnotationMovable(value: boolean) {
    this.isTextAnnotationMovable = value;
  }

  onSigneeChange(event: any) {
    var userId = parseInt(event.target.value);
    const selectedUser = this.allUsers.find((user) => user.id === userId);
    if (selectedUser) {
      this.currSignee = selectedUser;
    }
  }

  private setupDragAndDrop(): void {
    const dropZoneElement = this.containerRef.nativeElement;

    dropZoneElement.addEventListener('dragover', (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'copy'; // Show copy icon
    });

    dropZoneElement.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const data = event.dataTransfer?.getData('text/plain') || '';
      const [name, email, annotationType,role] = data.split('%');
      const pageIndex = 0; // Change this to the desired page index

      const instantId = PSPDFKit.generateInstantId();

      const signee = this.currSignee;// currSigneeRef.current;
      const user = this.currUser; //currUserRef.current;
      //const pageIndex = this.pageIndex;// onPageIndexRef.current;
      let rectWidth = 120;
      let rectHeight = 40;
      switch (annotationType) {
        case AnnotationTypeEnum.INITIAL:
          rectWidth = 70;
          rectHeight = 40;
          break;

        case AnnotationTypeEnum.SIGNATURE:
          rectWidth = 120;
          rectHeight = 40;
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
      const pageRect = this.pspdfkitService.instance.transformContentClientToPageSpace(
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
          //className: signee.id !== user.id ? 'PSPDFKit-7181s3qkmmn7fdexydqff3quq3' : '',
          customData: {
            createdBy: user?.id,
            signerID: signee?.id,
            signerEmail: email,
            signerRole:role,
            type: annotationType,
            signerColor: signee?.color,
            isInitial: annotationType === AnnotationTypeEnum.INITIAL,
          },
         // backgroundColor: PSPDFKit.Color.LIGHT_BLUE,

        });
        const formField = new PSPDFKit.FormFields.SignatureFormField({
          annotationIds: PSPDFKit.Immutable.List([widget.id]),
          name: instantId,
          id: instantId,
          readOnly: signee.id != user.id,
        });

        
        this.pspdfkitService.instance.create([widget, formField]);
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
            signerRole:role,
            type: annotationType,
            signerColor: PSPDFKit.Color.WHITE,
            isInitial: false,
          },
          //backgroundColor: PSPDFKit.Color.LIGHT_BLUE,
        });
        const formField = new PSPDFKit.FormFields.SignatureFormField({
          annotationIds: PSPDFKit.Immutable.List([widget.id]),
          name: 'DigitalSignature',
          id: instantId,
          readOnly: signee.id != user.id,
        });
        const created = this.pspdfkitService.instance.create([widget, formField]);
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
            signerRole:role,
            signerColor: signee?.color,
          },
          font: "Helvetica",
          fontSize: 14,
          horizontalAlign: "center",
          verticalAlign: "center",
          isEditable: false,
          //backgroundColor: PSPDFKit.Color.LIGHT_BLUE,
        });
        this.pspdfkitService.instance.create(text);
      }
    });
  }

  async onDragStart(event: DragEvent, type: string) {
    const data = `${this.currSignee.name}%${this.currSignee.email}%${type}%${this.currSignee.role}`;
    event.dataTransfer?.setData('text/plain', data);
  }  

  addUser() {
    const id = Math.floor(Math.random() * 1000000);
    const newUser: User = { id, name: 'New User', email: `user${id}@example.com`, role: 'signee', color: 'lightgreen' };
    this.allUsers.push(newUser);
    this.onSigneeChange(newUser.id);
  }

  downloadsignPdf = async () => {
    try {
      // Export the current PDF as a Blob
      const pdfBlob = await this.pspdfkitService.instance.exportPDF();

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
  }

  randomColor = (PSPDFKit: any) => {
    const colors: any = [
      // PSPDFKit.Color.LIGHT_GREY,
      // PSPDFKit.Color.LIGHT_GREEN,
      // PSPDFKit.Color.LIGHT_YELLOW,
      // PSPDFKit.Color.LIGHT_ORANGE,
      // PSPDFKit.Color.LIGHT_RED,
      PSPDFKit.Color.LIGHT_BLUE,
      PSPDFKit.Color.fromHex("#c6cef3fc"),
    ];
    const usedColors = this.allUsers.map((signee) => signee.color);
    const availableColors = colors.filter(
      (color: any) => !usedColors.includes(color as any)
    );
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
  };
}
