import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import PSPDFKit, { ViewState } from "pspdfkit";
import { environment } from '../../environments/environment';

interface Attachment {
  url: string;
  id: string;
}
const STORAGE_KEY = "signatures_storage";
const ATTACHMENTS_KEY = "attachments_storage";

@Component({
  selector: 'app-sign-demo',
  standalone: true,
  imports: [],
  templateUrl: './sign-demo.component.html',
  styleUrl: './sign-demo.component.css'
})
export class SignDemoComponent implements AfterViewInit{
  instance: any;
  pdfDocument: any;

  ngAfterViewInit() {
		PSPDFKit.load({
			
			licenseKey: environment.PSPDFKitLicenceKey,
			// Use the assets directory URL as a base URL. PSPDFKit will download its library assets from here.
			baseUrl: environment.PSPDFKitLibUrl, //location.protocol + "//" + location.host + "/assets/",
			document: "/assets/studentformnew.pdf",
			container: "#pspdfkit-container",
			
			toolbarItems: [
				...PSPDFKit.defaultToolbarItems,
				{
				  type: "form-creator"
				},
				{ type: "content-editor" }
			  ]
			  
		}).then((instance) => {
			// For the sake of this demo, store the PSPDFKit for Web instance
			// on the global object so that you can open the dev tools and
			// play with the PSPDFKit API.
			this.instance = instance;
			
			instance.setViewState(viewState => viewState.set("interactionMode", PSPDFKit.InteractionMode.FORM_CREATOR));	
			instance.setToolbarItems(items => {
				const formEditorItem = items.find(item => item.type === "form-creator");
				if (formEditorItem) {
				}
				return items;
			  });	
        this.StudentSign();
		}).catch((error: any) => {

      console.error("Error loading PSPDFKit:", error);
    });
  }

  // Method to load stored signatures and attachments
   async loadStoredData(instance: any) {
    const signaturesString = localStorage.getItem(STORAGE_KEY);
    if (signaturesString) {
      const storedSignatures = JSON.parse(signaturesString);
      const list = PSPDFKit.Immutable.List(storedSignatures.map(PSPDFKit.Annotations.fromSerializableObject));
       instance.setStoredSignatures(list); // Uncomment if you want to set stored signatures

      const attachmentsString = localStorage.getItem(ATTACHMENTS_KEY);
      if (attachmentsString) {
        const attachmentsArray = JSON.parse(attachmentsString);
        const blobs = await Promise.all(
          attachmentsArray.map(({ url }: Attachment) => fetch(url).then(res => res.blob()))
        );

        // Create an attachment for each blob
        blobs.forEach(blob => instance.createAttachment(blob));
      }
    }
  }

  // Method to handle student signing
  StudentSign() {
    console.log("Button is clicked");
    this.instance.addEventListener("storedSignatures.create", async (annotation: any) => {
    const signaturesString = localStorage.getItem(STORAGE_KEY);
    const storedSignatures = signaturesString ? JSON.parse(signaturesString) : [];

    const serializedAnnotation = PSPDFKit.Annotations.toSerializableObject(annotation);
      if (annotation.imageAttachmentId) {
        const attachment = await this.instance.getAttachment(annotation.imageAttachmentId);
        const url = await fileToDataURL(attachment);
        const attachmentsString = localStorage.getItem(ATTACHMENTS_KEY);
        const attachmentsArray = attachmentsString ? JSON.parse(attachmentsString) : [];

        attachmentsArray.push({ url, id: annotation.imageAttachmentId });
        localStorage.setItem(ATTACHMENTS_KEY, JSON.stringify(attachmentsArray));
      }

      storedSignatures.push(serializedAnnotation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSignatures));
      this.instance.setStoredSignatures((signatures: any) => signatures.push(annotation));
    });
    this.instance.addEventListener("storedSignatures.delete", (annotation:any) => {
      const signaturesString = localStorage.getItem(STORAGE_KEY);
      const storedSignatures = signaturesString
        ? JSON.parse(signaturesString)
        : [];
      const annotations = storedSignatures.map(
        PSPDFKit.Annotations.fromSerializableObject
      );
      const updatedAnnotations = annotations.filter(
        (currentAnnotation:any) => !currentAnnotation.equals(annotation)
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          updatedAnnotations.map(PSPDFKit.Annotations.toSerializableObject)
        )
      );
      // Use setStoredSignatures API so that the current UI is properly updated
      this.instance.setStoredSignatures((signatures:any) =>
        signatures.filter((signature:any) => !signature.equals(annotation))
      );

      if (annotation.imageAttachmentId) {
        // Remove attachment from array
        const attachmentsString = localStorage.getItem(ATTACHMENTS_KEY);

        if (attachmentsString) {
          let attachmentsArray = JSON.parse(attachmentsString);

          attachmentsArray = attachmentsArray.filter(
            (attachment: any) => attachment.id !== annotation.imageAttachmentId
          );
          localStorage.setItem(
            ATTACHMENTS_KEY,
            JSON.stringify(attachmentsArray)
          );
        }
      }
    });

    return this.instance;
  };
}

// Utility function to convert file to Data URL
function fileToDataURL(file: any) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

