import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentInfoGridComponent } from './student-info-grid.component';

describe('StudentInfoGridComponent', () => {
  let component: StudentInfoGridComponent;
  let fixture: ComponentFixture<StudentInfoGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentInfoGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentInfoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
