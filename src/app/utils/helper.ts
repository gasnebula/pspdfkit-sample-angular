import { Injectable } from '@angular/core';
import { AnnotationTypeEnum } from './types';

@Injectable({
  providedIn: 'root',
})
export class AnnotationService {
  private renderConfigurations: any = {};

  getToolbarItems() {
    return [
      { type: 'sidebar-thumbnails' },
      { type: 'sidebar-document-outline' },
      { type: 'sidebar-annotations' },
      { type: 'sidebar-signatures' },
      { type: 'pager' },
      { type: 'layout-config' },
      { type: 'pan' },
      { type: 'zoom-out' },
      { type: 'zoom-in' },
      { type: 'search' },
      { type: 'spacer' },
      { type: 'print' },
      { type: 'export-pdf' },
    ];
  }

  createCustomSignatureNode(annotation: any, type: AnnotationTypeEnum): HTMLElement {
    const container = document.createElement('div');

    if (type === AnnotationTypeEnum.SIGNATURE) {
      container.innerHTML = `<div class="custom-annotation-wrapper custom-signature-wrapper" style="background-color: rgb(${annotation.customData?.signerColor.r},${annotation.customData?.signerColor.g},${annotation.customData?.signerColor.b})">
          <div class="custom-signature">
            <div class="custom-signature-label">
               Sign
            </div>
            <svg fill="#000000" width="1.5625rem" height="1.25rem" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 16q0-3.232 1.28-6.208t3.392-5.12 5.12-3.392 6.208-1.28q3.264 0 6.24 1.28t5.088 3.392 3.392 5.12 1.28 6.208q0 3.264-1.28 6.208t-3.392 5.12-5.12 3.424-6.208 1.248-6.208-1.248-5.12-3.424-3.392-5.12-1.28-6.208zM4 16q0 3.264 1.6 6.048t4.384 4.352 6.016 1.6 6.016-1.6 4.384-4.352 1.6-6.048-1.6-6.016-4.384-4.352-6.016-1.632-6.016 1.632-4.384 4.352-1.6 6.016z"></path>
            </svg>
          </div>
        </div>`;
    }
    // Repeat similar blocks for other annotation types (e.g., INITIAL, DS)

    return container;
  }

  getAnnotationRenderers(annotation: any) {
    if (annotation.isSignature && annotation.customData?.type !== AnnotationTypeEnum.DS) {
      const box = document.createElement('div');
      box.className = 'signature-box-demo';
      box.innerHTML = `<span class="signature-label-demo">By PSPDFKit</span><span class="signature-id-demo">${annotation.id.substring(0, 15) + (annotation.id.length > 15 ? '...' : '')}</span>`;
      box.style.height = `${annotation.boundingBox.height / 16}rem`;
      box.style.width = `${annotation.boundingBox.width / 16}rem`;
      box.id = annotation.id;
      return { node: box, append: true };
    }

    if (annotation.name) {
      if (this.renderConfigurations[annotation.id]) {
        return this.renderConfigurations[annotation.id];
      }

      this.renderConfigurations[annotation.id] = {
        node: this.createCustomSignatureNode(annotation, annotation.customData?.type),
        append: true,
      };

      return this.renderConfigurations[annotation.id];
    }

    return null;
  }

  handleAnnotationCreation(instance: any, annotation: any, mySignatureIdsRef: any, setSignatureAnnotationIds: any, myEmail: string) {
    if (annotation.isSignature) {
      instance.totalPageCount().then((pageCount: number) => {
        for (let i = 0; i < pageCount; i++) {
          instance.getAnnotations(i).then((annotations: any) => {
            annotations.forEach((maybeCorrectAnnotation: any) => {
              if (annotation.boundingBox.isRectOverlapping(maybeCorrectAnnotation.boundingBox)) {
                const newAnnotation = this.getAnnotationRenderers(maybeCorrectAnnotation);
                if (newAnnotation?.node) {
                  newAnnotation.node.className = 'signed';
                }
              }
            });
          });
        }
      });

      const signatures = [...mySignatureIdsRef.current, annotation.id];
      setSignatureAnnotationIds(signatures);
      mySignatureIdsRef.current = signatures;
    }
  }

  handleAnnotationDelete(instance: any, annotation: any, myEmail: string) {
    if (annotation.isSignature) {
      instance.totalPageCount().then((pageCount: number) => {
        for (let i = 0; i < pageCount; i++) {
          instance.getAnnotations(i).then((annotations: any) => {
            annotations.forEach((maybeCorrectAnnotation: any) => {
              if (annotation.boundingBox.isRectOverlapping(maybeCorrectAnnotation.boundingBox)) {
                const newAnnotation = this.getAnnotationRenderers(maybeCorrectAnnotation);
                if (newAnnotation?.node) {
                  newAnnotation.node.className = '';
                }
              }
            });
          });
        }
      });
    }
  }
}
