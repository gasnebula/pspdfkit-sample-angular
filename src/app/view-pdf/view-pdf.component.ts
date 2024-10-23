
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import PSPDFKit, { Instance } from 'pspdfkit';
import { FormDataService } from '../../form-data.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { User } from '../utils/types';

@Component({
	selector: 'app-view-pdf',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './view-pdf.component.html',
	styleUrls: ['./view-pdf.component.css']
})
export class ViewPdfComponent {
	instance: any;
	isTextAnnotationMovable: boolean = true;
	currUser!: User;
	allUsers: User[] = [];

	constructor(private formDataService: FormDataService, private http: HttpClient,private router: Router, private route: ActivatedRoute) { }
	ngOnInit(): void {
		let user1 = { id: 1, name: 'Admin', email: 'gautam.solanki@nebulaedge.ai', role: 'Editor', color: 'lightblue' }; // Set initial user
		let user2 = { id: 2, name: 'Gautam', email: 'gasolanki120@gmail.com', role: 'Operator', color: 'lightblue' }; // Set initial user
		let user3 = { id: 3, name: 'Naresh', email: 'naresh@gmail.com', role: 'Operator', color: 'lightblue' }; // Set initial user

		this.allUsers.push(user1);
		this.allUsers.push(user2);
		this.allUsers.push(user3);
		let userId = this.route.snapshot.paramMap.get('userId');
		if(userId){

			let user = this.allUsers.find(x=>x.id == parseInt(userId));
			if(user){
				this.currUser = user;
			}
		}
	  }
	ngAfterViewInit() {

		
		// Check if an instance already exists and destroy it before loading a new one
		if (this.instance) {
			PSPDFKit.unload(this.instance);// Destroy the previous instance if it exists
		}

		PSPDFKit.load({
			licenseKey: environment.PSPDFKitLicenceKey,
			baseUrl: environment.PSPDFKitLibUrl,// location.protocol + "//" + location.host + "/assets/",
			//document: "/assets/StudentDocNew.pdf",
			document: "/assets/StudentDocument.pdf",
			container: "#pspdfkit-container",
			styleSheets: ['/assets/viewer.css'],
			disableTextSelection: true,
			isEditableAnnotation: function (annotation:any) {
				return !annotation.isSignature;
			  },
			// ,
			// toolbarItems: [
			// 	...PSPDFKit.defaultToolbarItems,
			// 	{
			// 		type: "form-creator",
			// 	}
			// ]
		}).then(instance => {
			const defaultItems = PSPDFKit.defaultToolbarItems;
			console.log(defaultItems);

			this.instance = instance;
			this.instance.setViewState((viewState: any) => viewState.set("showToolbar", true));
			// Fetch the form data and bind to PDF
			// this.formDataService.getFormData().subscribe(formData => {
			// 	this.fillFormFields(formData);
			// });

			//(window as any).instance = instance;

			this.setSignFieldsBasedOnUser();

			this.instance.addEventListener("annotations.create", async (annotations:any) => {
				for (const annotation of annotations) {
					// if (
					// 	annotation.customData &&
					// 	annotation.customData.signerID == this.currUser.id
					// ){
							// Make the annotation read-only so it cannot be modified
							//const updatedAnnotation = annotation.set("isMovable", false);
									
							// Update the annotation in the document
							//await instance.update(updatedAnnotation);

							// this.instance.setViewState((viewState: any) =>
							// 	viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
							//   );
					//}
				}
			});

			
		});
	}

	ngOnDestroy() {
		// Unload the PSPDFKit instance when the component is destroyed to prevent memory leaks
		if (this.instance) {
			//this.instance.unload();
			PSPDFKit.unload(this.instance);
		}
	}
	async fillFormFields(formData: any) {
		const formFieldValues = [
			{ name: 'txtStudentName', value: formData.studentName },
			{ name: 'txtStudentNumber', value: formData.studentNumber },
			{ name: 'txtStudentAddress', value: formData.studentAddress }
		];

		try {
			const formFields = await this.instance.getFormFields();

			// Iterate over each form field and set the value
			for (const formField of formFields) {
				const matchingField = formFieldValues.find(field => formField.name.indexOf(field.name) > -1);
				if (matchingField) {
					console.log("Before setting:", formField);

					// Set the field properties
					// await this.instance.update([
					//     formField.set("readOnly", true)
					// ]);

					// Update associated widget annotations

					const annotations = await this.instance.getAnnotations(0); // Adjust for relevant pages
					for (const annotation of annotations) {
						if (annotation.formFieldName === formField.name) {

							let key: string = formField.name;
							let value: string = matchingField.value;
							let newObj = {
								[key]: value
							}
							await this.instance.setFormFieldValues(newObj)
								.then(() => {
									console.log("Form field value updated successfully!");
								})
								.catch((error: any) => {
									console.log("Error updating form field:", error);
								});

							await this.instance.update([
								formField.set("isEditable", false),
								formField.set("readOnly", true),
								// 	formField.set("defaultValue", matchingField.value),
								// 	formField.set("value", matchingField.value),
								//annotation.set("opacity", 0.5) 
							]);
						}
					}

					console.log("After setting:", formField);
				}
			}

			//await this.instance.setFormFieldValues(formFieldValues);
			// await this.instance.render(); 

			console.log('Form fields populated successfully!');
		} catch (error) {
			console.error('Error setting form field values:', error);
		}
	}

	downloadPDF() {
		let pdf = this.instance.exportPDF();
	}

	submitDocument() {

	}

	setSignFieldsBasedOnUser = async () => {
		let user = this.currUser;
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
						annotation.customData.signerID == user.id
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
		// User with role Editor can edit the document
		if (user.role == "Editor") {
			this.instance.setViewState((viewState: any) =>
				viewState.set("showToolbar", true)
			);
			//this.setIsVisible(true);
			this.onChangeReadyToSign(false, user, PSPDFKit);
		} else {
			this.instance.setViewState((viewState: any) =>
				viewState.set("showToolbar", false)
			);
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
				this.instance.setViewState((viewState: any) =>
					viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
				);
				this.setIsTextAnnotationMovable(false);
			} else {
				this.instance.setViewState((viewState: any) =>
					viewState.set(
						"interactionMode",
						PSPDFKit.InteractionMode.FORM_CREATOR
					)
				);
				this.setIsTextAnnotationMovable(true);
			}
		} else {
			this.instance.setViewState((viewState: any) =>
				viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
			);
			this.setIsTextAnnotationMovable(false);
		}
	};
	setIsVisible(value: boolean) {
		//this.isVisible = value;
	}
	setReadyToSign(value: boolean) {
		//this.readyToSign = value;
	}
	setIsTextAnnotationMovable(value: boolean) {
		this.isTextAnnotationMovable = value;
	}
}