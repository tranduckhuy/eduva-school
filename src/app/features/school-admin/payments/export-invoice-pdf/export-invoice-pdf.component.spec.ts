import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportInvoicePdfComponent } from './export-invoice-pdf.component';

describe('ExportInvoicePdfComponent', () => {
  let component: ExportInvoicePdfComponent;
  let fixture: ComponentFixture<ExportInvoicePdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportInvoicePdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportInvoicePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
