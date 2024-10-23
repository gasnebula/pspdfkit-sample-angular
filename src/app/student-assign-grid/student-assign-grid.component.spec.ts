import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAssignGridComponent } from './student-assign-grid.component';

describe('StudentAssignGridComponent', () => {
  let component: StudentAssignGridComponent;
  let fixture: ComponentFixture<StudentAssignGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAssignGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAssignGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
