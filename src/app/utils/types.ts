
export enum AnnotationTypeEnum {
    NAME = "name",
    SIGNATURE = "signature",
    DATE = "date",
    INITIAL = "initial",
    DS = "ds"
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    color?: any;
    role: string;
  }
  
  export interface AIMessage {
    role: string;
    content: string;
  }