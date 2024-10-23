import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDocumentComponent } from './assign-document.component';

describe('AssignDocumentComponent', () => {
  let component: AssignDocumentComponent;
  let fixture: ComponentFixture<AssignDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignDocumentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
