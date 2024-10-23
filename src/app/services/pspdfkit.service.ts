import { Injectable } from '@angular/core';
import PSPDFKit, { Interfaces } from 'pspdfkit';
import { environment } from '../../environments/environment';
import { AnnotationTypeEnum } from '../utils/types';

@Injectable({
  providedIn: 'root'
})
export class PspdfkitService {
  instance: any;
  renderConfigurations: any = {};
  mySignatureIdsRef : any =[];
  signatureAnnotationIds : any = [];
  async load(container: HTMLElement, pdfUrl: string): Promise<any> {
    let currentObject = this;
    try {
      const {
        UI: { createBlock, Recipes, Interfaces, Core },
      } = PSPDFKit;
      let isCreateInitial = false;
      this.instance = await PSPDFKit.load({
        container,
        document: pdfUrl,
        baseUrl: environment.PSPDFKitLibUrl,
        toolbarItems: this.getToolbarItems(),
        customRenderers: {
          Annotation:  ({ annotation }: any) =>{  
            return this.getAnnotationRenderers({annotation})
          }
        },
        styleSheets: ['/assets/viewer.css'],
      }).then(instance => {
        //this.instance = instance;
        let signIds = this.mySignatureIdsRef;
        let annotationIds = [this.signatureAnnotationIds];
        instance.addEventListener(
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
        instance.addEventListener(
          "annotations.create",
          async function (createdAnnotations: any) {
            const annotation = createdAnnotations.get(0);
        
            // Check if the created annotation is an InkAnnotation (signature annotation)
            if (annotation instanceof PSPDFKit.Annotations.InkAnnotation) {
              currentObject.handleAnnotatitonCreation(
                instance,
                annotation,
                signIds,
                annotationIds
              );
        
              // Implement logic to download the signature as an image
              const svgSelector = `[data-annotation-id="${annotation.id}"] svg`;
        
              // Ensure the targetNode is an Element and not null
              const targetNode = instance.contentDocument?.querySelector(".PSPDFKit-Page");
              if (!targetNode) {
                console.error('Target node ".PSPDFKit-Page" not found.');
                return;
              }
        
              // Observer to monitor changes and handle image download
              const config = { childList: true, subtree: true };
        
              const observer = new MutationObserver((mutationList) => {
                // Loop through the mutations and get the target element matching the signature SVG
                const target = mutationList
                  .map((mutation) => (mutation.target as Element).querySelector(svgSelector))
                  .find((el) => el !== null);  // Filter out null values and find the first match
        
                // If the target (SVG) is found
                if (target) {
                  console.log(target);
                  const gElement = target.querySelector("g");
                  if (gElement) {
                    gElement.style.fill = "transparent";
                  }
        
                  // Serialize the SVG to a string
                  const svg = new XMLSerializer().serializeToString(target);
                  const img = new Image();
                  img.src = `data:image/svg+xml; charset=utf-8, ${svg}`;
        
                  // Once the image is loaded, convert to canvas and download as PNG
                  img.onload = () => {
                    const canvas: HTMLCanvasElement = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const context = canvas.getContext("2d");
                    if (context) {
                      context.drawImage(img, 0, 0);
                    }
        
                    // Convert canvas to blob and trigger download
                    canvas.toBlob(async (blob) => {
                      if (blob) {
                        const link = document.createElement("a");
                        link.download = `${annotation.id}.png`;  // Set download name
                        link.href = canvas.toDataURL();           // Set image data URL
                        link.click();                             // Trigger download
                      }
                    }, "image/png");
        
                    // Disconnect the observer after processing
                    observer.disconnect();
                  };
                }
              });
        
              // Start observing for changes in the PDF page
              observer.observe(targetNode, config);
            }
          }
        );
        
        return instance;
        
      //  instance.addEventListener(
      //     "annotations.create",
      //     async function (createdAnnotations: any) {
      //       const annotation = createdAnnotations.get(0);
      //       currentObject.handleAnnotatitonCreation(
      //         instance,
      //         annotation,
      //         signIds,
      //         annotationIds
      //       );
      //     }
      //   );

      //   return instance;
      });
      return this.instance;
    } catch (error) {
      console.error('Error loading PSPDFKit:', error);
      throw error;
    }
  }
  // Example method to replace the array entirely
  setSignatureAnnotationIds(annotationIds: string[]) {
    this.signatureAnnotationIds = annotationIds;
  }
  unload(container: HTMLElement): void {
    if (this.instance) {
      PSPDFKit.unload(container);
    }
  }

  private getToolbarItems(): any[] {
    return [
      { type: 'pan' },
      { type: 'zoom-in' },
      { type: 'zoom-out' },
      { type: 'form-creator' }
      ,
      { type: 'content-editor' },
      
      // Add other toolbar items as needed
    ];
  }

  private getCustomRenderers(): any {
    return {
      Annotation: ({ annotation }: any) => {
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
  handleAnnotatitonCreation = async  (
    instance: any,
    annotation: any,
    mySignatureIdsRef: any,
    setSignatureAnnotationIds: any,
  )=>{
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
      setSignatureAnnotationIds = signatures;
      mySignatureIdsRef = signatures;
    }
  }
}
