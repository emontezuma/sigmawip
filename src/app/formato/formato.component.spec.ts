import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatoComponent } from './formato.component';

describe('FormatoComponent', () => {
  let component: FormatoComponent;
  let fixture: ComponentFixture<FormatoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormatoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
