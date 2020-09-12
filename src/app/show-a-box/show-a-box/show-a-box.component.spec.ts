import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowABoxComponent } from './show-a-box.component';

describe('ShowABoxComponent', () => {
  let component: ShowABoxComponent;
  let fixture: ComponentFixture<ShowABoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowABoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowABoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
