import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDocumentComponent } from './student-document.component';

describe('StudentDocumentComponent', () => {
  let component: StudentDocumentComponent;
  let fixture: ComponentFixture<StudentDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDocumentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
