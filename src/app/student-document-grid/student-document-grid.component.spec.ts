import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDocumentGridComponent } from './student-document-grid.component';

describe('StudentDocumentGridComponent', () => {
  let component: StudentDocumentGridComponent;
  let fixture: ComponentFixture<StudentDocumentGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDocumentGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDocumentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
