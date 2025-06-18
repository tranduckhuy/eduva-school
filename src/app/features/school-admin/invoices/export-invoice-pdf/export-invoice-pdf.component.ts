import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { base64Img } from '../../../../shared/constants/logoBase64.constant';

@Component({
  selector: 'app-export-invoice-pdf',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './export-invoice-pdf.component.html',
  styleUrls: ['./export-invoice-pdf.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportInvoicePdfComponent {
  async exportToPdf() {
    await this.createFormattedPdf({}, 'Hóa_đơn_EDUVA.pdf');
  }

  private async createFormattedPdf(
    data: any,
    fileName: string = 'document.pdf'
  ) {
    const pdf = new jsPDF();

    // Helper function to convert ArrayBuffer to base64 safely
    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }

    // Load and register Vietnamese font
    try {
      const fontName = 'Nunito';
      // Load Regular font
      const regularFontPath = 'assets/fonts/Nunito/Nunito-Regular.ttf';
      const regularFontData = await fetch(regularFontPath).then(res =>
        res.arrayBuffer()
      );
      const regularBase64 = arrayBufferToBase64(regularFontData);
      pdf.addFileToVFS('Nunito-Regular.ttf', regularBase64);
      pdf.addFont('Nunito-Regular.ttf', fontName, 'normal');

      // Load Bold font
      const boldFontPath = 'assets/fonts/Nunito/Nunito-Bold.ttf';
      const boldFontData = await fetch(boldFontPath).then(res =>
        res.arrayBuffer()
      );
      const boldBase64 = arrayBufferToBase64(boldFontData);
      pdf.addFileToVFS('Nunito-Bold.ttf', boldBase64);
      pdf.addFont('Nunito-Bold.ttf', fontName, 'bold');

      // Set default font
      pdf.setFont(fontName, 'normal');
    } catch (error) {
      console.warn(
        'Failed to load Vietnamese font, falling back to default',
        error
      );
      pdf.setFont('helvetica'); // Fallback font
    }

    // Logo

    pdf.addImage(base64Img, 'PNG', 10, 10, 10, 10);

    // Title
    pdf.setFontSize(16);
    pdf.setFont('Nunito', 'bold');
    pdf.text('EDUVA Hóa Đơn: #1', 24, 17);

    // Invoice From
    pdf.setFontSize(12);
    pdf.setFont('Nunito', 'normal');
    pdf.text('Hóa đơn từ:', 10, 30);

    pdf.setFont('Nunito', 'bold');
    pdf.text('EDUVA', 10, 36);
    pdf.setFont('Nunito', 'normal');
    pdf.text('Địa chỉ: thành phố Quy Nhơn, tỉnh Bình Định', 10, 42);
    pdf.text('Số điện thoại: 01234543234', 10, 48);
    pdf.text('Email: eduva@gmail.com', 10, 54);

    // Invoice To
    const rightColX = 110;
    pdf.setFontSize(12);
    pdf.setFont('Nunito', 'normal');
    pdf.text('Hóa đơn đến:', rightColX, 30);
    pdf.setFont('Nunito', 'bold');
    pdf.text('Nguyễn Văn An', rightColX, 36);
    pdf.setFont('Nunito', 'normal');
    pdf.text('Số điện thoại: +84901234567', rightColX, 42);
    pdf.text('Email: an.nguyen@example.com', rightColX, 48);
    pdf.text('Trường: Trường THPT Nguyễn Trãi', rightColX, 54);

    // Invoice details row
    pdf.setFont('Nunito', 'normal');
    pdf.text('Mã hóa đơn:', 10, 70);
    pdf.text('Ngày bắt đầu:', 50, 70);
    pdf.text('Ngày kết thúc:', 110, 70);
    pdf.text('Tổng tiền:', 160, 70);

    pdf.text('#1', 10, 77);
    pdf.text('07:00:00, 1 thg 1, 2024', 50, 77);
    pdf.text('31 thg 1, 2024', 110, 77);
    pdf.text('1.700.000 ₫', 160, 77);

    // Table
    autoTable(pdf, {
      startY: 85,
      margin: { left: 10 },
      head: [
        ['STT', 'TÊN GÓI', 'LƯU TRỮ', 'TÀI KHOẢN', 'CREDIT', 'LOẠI', 'GIÁ'],
      ],
      body: [['01', 'Gói Cơ Bản', '10', '5', '100', 'Tháng', '1.500.000 ₫']],
      styles: {
        font: 'Nunito',
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fontStyle: 'bold',
      },
      foot: [['', '', '', '', '', 'Tổng:', '1.500.000 ₫']],
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [34, 197, 94],
        fontStyle: 'bold',
      },
    });

    pdf.save(fileName);
  }
}
