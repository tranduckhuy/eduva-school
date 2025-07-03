import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { base64Img } from '../../../../shared/constants/logoBase64.constant';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CreditTransactionDetail } from '../model/credit-transaction-detail';
import { SchoolSubscriptionDetail } from '../model/school-subscription-detail.model';

@Component({
  selector: 'app-export-invoice-pdf',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './export-invoice-pdf.component.html',
  styleUrls: ['./export-invoice-pdf.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportInvoicePdfComponent {
  private readonly datePipe = inject(DatePipe);

  readonly isCreditPack = input<boolean>(false);
  readonly creditTransactionDetail = input<CreditTransactionDetail | null>();
  readonly schoolSubscriptionDetail = input<SchoolSubscriptionDetail | null>();

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
    } catch {
      pdf.setFont('helvetica'); // Fallback font
    }

    // Logo

    pdf.addImage(base64Img, 'PNG', 10, 10, 10, 10);

    // Title
    pdf.setFontSize(16);
    pdf.setFont('Nunito', 'bold');
    pdf.text(
      `EDUVA Hóa Đơn: #${
        this.isCreditPack()
          ? this.creditTransactionDetail()?.id
          : this.schoolSubscriptionDetail()?.id
      }`,
      24,
      17
    );

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
    pdf.text(
      `${
        this.isCreditPack()
          ? this.creditTransactionDetail()?.user?.fullName
          : this.schoolSubscriptionDetail()?.user?.fullName
      }`,
      rightColX,
      36
    );
    pdf.setFont('Nunito', 'normal');
    pdf.text(
      `Số điện thoại: ${
        this.isCreditPack()
          ? this.creditTransactionDetail()?.user?.phoneNumber
          : this.schoolSubscriptionDetail()?.user?.phoneNumber
      }`,
      rightColX,
      42
    );
    pdf.text(
      `Email: ${
        this.isCreditPack()
          ? this.creditTransactionDetail()?.user?.email
          : this.schoolSubscriptionDetail()?.user?.email
      }`,
      rightColX,
      48
    );
    if (!this.isCreditPack()) {
      pdf.text(
        `Trường: ${this.schoolSubscriptionDetail()?.school?.name}`,
        rightColX,
        54
      );
    }
    // Invoice details row
    pdf.setFont('Nunito', 'normal');
    pdf.text('Mã hóa đơn:', 10, 70);
    pdf.text('Tổng tiền:', 10, 85);
    pdf.text('Ngày bắt đầu:', 110, 70);
    pdf.text('Ngày kết thúc:', 110, 85);

    pdf.text(
      `${
        this.isCreditPack()
          ? this.creditTransactionDetail()?.aiCreditPack?.id
          : this.schoolSubscriptionDetail()?.id
      }`,
      10,
      77
    );
    pdf.text(
      `${
        this.isCreditPack()
          ? this.creditTransactionDetail()?.aiCreditPack.price
          : this.schoolSubscriptionDetail()?.paymentTransaction.amount
      } ₫`,
      10,
      92
    );
    pdf.text(
      `${
        this.isCreditPack()
          ? this.datePipe.transform(
              this.creditTransactionDetail()?.createdAt,
              'medium'
            )
          : this.datePipe.transform(
              this.schoolSubscriptionDetail()?.startDate,
              'medium'
            )
      }`,
      110,
      77
    );
    pdf.text(
      `${
        this.isCreditPack()
          ? this.datePipe.transform(
              this.creditTransactionDetail()?.createdAt,
              'mediumDate'
            )
          : this.datePipe.transform(
              this.schoolSubscriptionDetail()?.endDate,
              'mediumDate'
            )
      }`,
      110,
      92
    );

    // Table
    autoTable(pdf, {
      startY: 105,
      margin: { left: 10 },
      head: [
        this.isCreditPack()
          ? ['STT', 'TÊN GÓI', 'SỐ LƯỢNG CREDITS', 'CREDITS TẶNG THÊM', 'GIÁ']
          : ['STT', 'TÊN GÓI', 'LƯU TRỮ', 'TÀI KHOẢN', 'LOẠI', 'GIÁ'],
      ],
      body: [
        this.isCreditPack()
          ? [
              '01',
              this.creditTransactionDetail()?.aiCreditPack.name ?? '',
              this.creditTransactionDetail()?.aiCreditPack.credits ?? 0,
              this.creditTransactionDetail()?.aiCreditPack.bonusCredits ?? 0,
              this.creditTransactionDetail()?.aiCreditPack.price ?? 0 + ' đ',
            ]
          : [
              '01',
              this.schoolSubscriptionDetail()?.plan.name ?? '',
              this.schoolSubscriptionDetail()?.plan.maxUsers ?? 0,
              this.schoolSubscriptionDetail()?.plan.storageLimitGB ?? 0,
              this.schoolSubscriptionDetail()?.billingCycle === 0
                ? 'Tháng'
                : 'Năm',
              this.schoolSubscriptionDetail()?.plan.price ?? 0 + ' đ',
            ],
      ],
      styles: {
        font: 'Nunito',
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fontStyle: 'bold',
      },
      foot: [
        this.isCreditPack()
          ? [
              '',
              '',
              '',
              'Tổng:',
              `${this.creditTransactionDetail()?.aiCreditPack.price} ₫`,
            ]
          : [
              '',
              '',
              '',
              '',
              'Tổng:',
              `${this.schoolSubscriptionDetail()?.paymentTransaction?.amount} ₫`,
            ],
      ],
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [34, 197, 94],
        fontStyle: 'bold',
      },
    });

    pdf.save(fileName);
  }
}
