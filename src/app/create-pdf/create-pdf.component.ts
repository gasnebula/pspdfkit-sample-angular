import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import PSPDFKit, { ViewState } from "pspdfkit";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-pdf',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './create-pdf.component.html',
  styleUrl: './create-pdf.component.css'
})
export class CreatePdfComponent implements AfterViewInit, OnDestroy  {

  instance: any;
  pdfDocument: any;
	
	constructor(private router: Router){
		console.log("create pdf called");
	}
	ngAfterViewInit() {
		PSPDFKit.load({
			
			licenseKey: environment.PSPDFKitLicenceKey,
			// Use the assets directory URL as a base URL. PSPDFKit will download its library assets from here.
			baseUrl: environment.PSPDFKitLibUrl, //location.protocol + "//" + location.host + "/assets/",
			document: "/assets/Sample PDF.pdf",
			container: "#pspdfkit-container",
			// inlineTextSelectionToolbarItems: (
			// 	{ defaultItems, hasDesktopLayout },
			// 	selection
			//   ) => {
			// 	return [];
			//   },
			
			toolbarItems: [
				...PSPDFKit.defaultToolbarItems,
				{
				  type: "form-creator"
				},
				{ type: "content-editor" }
			  ]
			//   ,

			//   styleSheets: [
			// 	//"https://example.com/my-pspdfkit.css", // hosted CSS file
			// 	"./hide-delete-button.css" // or local CSS file
			//   ]
			  
		}).then((instance) => {
			// For the sake of this demo, store the PSPDFKit for Web instance
			// on the global object so that you can open the dev tools and
			// play with the PSPDFKit API.
			this.instance = instance;
			
			// Add a custom button to the form creation toolbar
			// instance.setToolbarItems(items => [
			// 	...items,
			// 	{ type: "custom", id: "addStudentNumber", title: "Student Number", onPress: this.addStudentNumber },
			// 	{ type: "custom", id: "addStudentName", title: "Student Name", onPress: this.addStudentName }
			// ]);
			instance.setViewState(viewState => viewState.set("interactionMode", PSPDFKit.InteractionMode.FORM_CREATOR));
			//instance.setViewState(viewState => viewState.set("showToolbar", !viewState.showToolbar));
			//instance.setViewState((state) => state.set("allowPrinting", false));
			//instance.setViewState((viewState) => viewState.set('sidebarMode', PSPDFKit.SidebarMode.ANNOTATIONS),);	
			instance.setToolbarItems(items => {
				const formEditorItem = items.find(item => item.type === "form-creator");
				if (formEditorItem) {
				  // formEditorItem = [
			// 	// 	...formEditorItem.items,
			// 	// 	{
			// 	// 	  type: "custom",
			// 	// 	  id: "addCustomField",
			// 	// 	  title: "Add Custom Field",
			// 	// 	  onPress: this.addCustomField,
			// 	// 	  icon: "customIconUrl" // Optionally, add a custom icon
			// 	// 	}
				   //];
				}
				return items;
			  });

			 const items = instance.toolbarItems;
			//instance.setToolbarItems(items.filter((item) => item.type !== "export-pdf"));
			//instance.setToolbarItems(items.filter((item) => item.type !== "print"));
			//instance.setToolbarItems(items.filter((item) => item.type !== "ink"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-thumbnails"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-document-outline"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-annotations"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-bookmarks"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-signatures"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-layers"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-signatures"));
			//instance.setToolbarItems(items => items.filter(item => item.type !== "sidebar-signatures"));
			//instance.contentDocument.addEventListener("contextmenu", (event) => event.preventDefault());		

		}).catch((error: any) => {

      console.error("Error loading PSPDFKit:", error);
    });
  }

//    // Add Button with an icon and JavaScript action
//    addButtonWithIcon = async () => {
//     const widget = new PSPDFKit.Annotations.WidgetAnnotation({
//       id: PSPDFKit.generateInstantId(),
//       pageIndex: 0, // You can adjust the page number based on your needs
//       formFieldName: "buttonIcon",
//       boundingBox: new PSPDFKit.Geometry.Rect({
//         left: 100, // X position
//         top: 100,  // Y position
//         width: 150, // Button width
//         height: 40, // Button height
//       }),
//       action: new PSPDFKit.Actions.JavaScriptAction({
//         script: "event.target.buttonImportIcon()" // Runs the JavaScript action when clicked
//       }),
//       borderWidth: 0, // No border around the button
//     });

//     const formField = new PSPDFKit.FormFields.ButtonFormField({
//       name: "buttonIcon",
//       annotationIds: PSPDFKit.Immutable.List([widget.id]),
//     });

//     // Create the widget and form field in the document
//     await this.instance.create([widget, formField]);

//     console.log("Button with icon created:", widget);
//   }


  addStudentNumber = async () => {
	this.createCustomField("txtStudentNumber_","text");
	
  }

  addStudentName = async () => {
	this.createCustomField("txtStudentName_","text");
  }

  addStudentAddress = async () => {
	this.createCustomField("txtStudentAddress_","text");
  }
  addStudentSign = async () => {
	//this.createCustomField("txtStudentSign_","sign");
		//await this.addButtonWithIcon();
  }

  createCustomField = async (fieldName:string,fieldType:string) => {
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

	
	if(fieldType =="text"){

		const formField = new PSPDFKit.FormFields.TextFormField({
			name: fieldName + uniqueId,
			annotationIds: PSPDFKit.Immutable.List([widget.id]),
			readOnly: true
		  });
		
		  await this.instance.create([widget, formField]);
	}
	// if(fieldType =="sign"){

	// 	const signformField = new PSPDFKit.FormFields.SignatureFormField({
	// 		name: fieldName + "sign_" + uniqueId,
	// 		annotationIds: PSPDFKit.Immutable.List([widget.id])
	// 	  });
	// 	const formField = new PSPDFKit.FormFields.ButtonFormField({
	// 		name: fieldName + uniqueId,
	// 		annotationIds: PSPDFKit.Immutable.List([widget.id])
	// 	  });		
	// 	await this.instance.create([widget, formField,signformField]);
	// }
  }
  
//   // Function to create an image box for signatures
//   createImageBox = async () => {
//     const uniqueId = PSPDFKit.generateInstantId();

//     // Create the bounding box for the image box
//     const boundingBox = new PSPDFKit.Geometry.Rect({
//       left: 100,
//       top: 200,  // Adjust top position to place below other fields
//       width: 150,
//       height: 100  // Height for image box
//     });

//     // Create the image annotation (it can be empty initially or filled with a placeholder)
//     const imageAnnotation = new PSPDFKit.Annotations.ImageAnnotation({
//       id: uniqueId,
//       pageIndex: 0,  // Place it on the first page
//       boundingBox: boundingBox,
//       // If you have an image source, set it here
//       image: null  // Placeholder; set a base64 image or URL here if available
//     });

//     await this.instance.create([imageAnnotation]);
//     console.log("Image box created:", imageAnnotation);
//   }


  handleAssignButton = async () => {
	alert("PDF loaded successfully.");
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

  // Method to add a draggable signature
//   addStudentSign() {
//     const signatureElement = document.createElement('div');
//     signatureElement.innerText = 'Your Signature';
//     signatureElement.className = 'signature'; // Add a CSS class for styling
//     signatureElement.draggable = true; // Make the element draggable

//     // Handle drag start
//     signatureElement.ondragstart = (event) => {
//       //event.dataTransfer.setData('text/plain', signatureElement.innerText); // Set the data for the drag
//     };

//     this.instance.getContainer().appendChild(signatureElement);

//     // Initial positioning
//     signatureElement.style.position = 'absolute';
//     signatureElement.style.left = '100px'; // Initial position
//     signatureElement.style.top = '100px';  // Initial position

//     // Add dragover and drop event listeners to the container
//     const container = this.instance.getContainer();
//     container.ondragover = (event:any) => {
//       event.preventDefault(); // Prevent default to allow drop
//     };

//     container.ondrop = (event:any) => {
//       event.preventDefault(); // Prevent default action (open as link for some elements)
//       const data = event.dataTransfer.getData('text/plain'); // Get the dragged data

//       // Create a new signature element at the drop position
//       const newSignatureElement = document.createElement('div');
//       newSignatureElement.innerText = data;
//       newSignatureElement.className = 'signature';

//       // Set the position of the new signature element
//       const offsetX = event.offsetX; // Get the drop position
//       const offsetY = event.offsetY;
//       newSignatureElement.style.position = 'absolute';
//       newSignatureElement.style.left = `${offsetX}px`;
//       newSignatureElement.style.top = `${offsetY}px`;

//       container.appendChild(newSignatureElement);
//     };
//   }
  ngOnDestroy() {
    // Unload the PSPDFKit instance when the component is destroyed to prevent memory leaks
    if (this.instance) {
      //this.instance.unload();
	  PSPDFKit.unload(this.instance);
    }
  }
}
