import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivarComponent } from './inactivar.component';

describe('InactivarComponent', () => {
  let component: InactivarComponent;
  let fixture: ComponentFixture<InactivarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InactivarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
