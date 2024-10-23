import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDocumentComponent } from './user-document.component';

describe('UserDocumentComponent', () => {
  let component: UserDocumentComponent;
  let fixture: ComponentFixture<UserDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDocumentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
