
// import PSPDFKit from "pspdfkit";

// export class CustomWidget {
//   private instance: PSPDFKit.instance;

//   constructor(instance: PSPDFKit.Instance) {
//     this.instance = instance;
//   }

//   createWidget(formFieldName: string, boundingBox: PSPDFKit.Geometry.Rect, initialValue: string) {
//     return new PSPDFKit.Annotations.WidgetAnnotation({
//       id: PSPDFKit.generateInstantId(),
//       pageIndex: 0, // This can be dynamically set based on where you drop the widget
//       formFieldName: formFieldName,
//       boundingBox: boundingBox
//     });
//   }

//   createFormField(formFieldName: string, annotationId: string, initialValue: string) {
//     return new PSPDFKit.FormFields.TextFormField({
//       name: formFieldName,
//       annotationIds: List([annotationId]), // Use Immutable List
//       value: initialValue
//     });
//   }
// }
