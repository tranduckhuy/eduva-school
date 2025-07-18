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
    await this.createFormattedPdf('Hóa_đơn_EDUVA.pdf');
  }

  private async createFormattedPdf(fileName: string = 'document.pdf') {
    const pdf = new jsPDF();
    const isCredit = this.isCreditPack();

    const creditDetail = this.creditTransactionDetail?.();
    const subscriptionDetail = this.schoolSubscriptionDetail?.();
    const user = isCredit ? creditDetail?.user : subscriptionDetail?.user;
    const transaction = isCredit
      ? creditDetail
      : subscriptionDetail?.paymentTransaction;
    const plan = subscriptionDetail?.plan;
    const amount = transaction?.amount;
    const planPrice = plan?.price;
    const deductedAmount = amount && planPrice ? amount - planPrice : 0;

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }
      return window.btoa(binary);
    };

    try {
      const fontName = 'Nunito';
      const regular = await fetch(
        'assets/fonts/Nunito/Nunito-Regular.ttf'
      ).then(res => res.arrayBuffer());
      const bold = await fetch('assets/fonts/Nunito/Nunito-Bold.ttf').then(
        res => res.arrayBuffer()
      );
      pdf.addFileToVFS('Nunito-Regular.ttf', arrayBufferToBase64(regular));
      pdf.addFileToVFS('Nunito-Bold.ttf', arrayBufferToBase64(bold));
      pdf.addFont('Nunito-Regular.ttf', fontName, 'normal');
      pdf.addFont('Nunito-Bold.ttf', fontName, 'bold');
      pdf.setFont(fontName, 'normal');
    } catch {
      pdf.setFont('helvetica');
    }

    pdf.addImage(base64Img, 'PNG', 10, 10, 10, 10);
    pdf.setFontSize(16).setFont('Nunito', 'bold');
    pdf.text(`EDUVA Hóa Đơn: #${transaction?.transactionCode ?? ''}`, 24, 17);

    pdf.setFontSize(12).setFont('Nunito', 'normal');
    pdf.text('Hóa đơn từ:', 10, 30);
    pdf.setFont('Nunito', 'bold').text('EDUVA', 10, 36);
    pdf.setFont('Nunito', 'normal');
    pdf.text('Địa chỉ: Đại học FPT Quy Nhơn, Tỉnh Gia Lai', 10, 42);
    pdf.text('Số điện thoại: 01234543234', 10, 48);
    pdf.text('Email: eduva@contact.com', 10, 54);

    const rightColX = 110;
    pdf.setFontSize(12).setFont('Nunito', 'normal');
    pdf.text('Hóa đơn đến:', rightColX, 30);
    pdf.setFont('Nunito', 'bold').text(user?.fullName ?? '', rightColX, 36);
    pdf.setFont('Nunito', 'normal');
    pdf.text(`Số điện thoại: ${user?.phoneNumber ?? ''}`, rightColX, 42);
    pdf.text(`Email: ${user?.email ?? ''}`, rightColX, 48, { maxWidth: 80 });
    if (!isCredit)
      pdf.text(
        `Trường: ${subscriptionDetail?.school?.name ?? ''}`,
        rightColX,
        54,
        { maxWidth: 80 }
      );

    pdf.setFont('Nunito', 'normal');
    pdf.text('Mã hóa đơn:', 10, 70);
    pdf.text(transaction?.transactionCode ?? '', 10, 77);
    pdf.text('Tổng tiền:', 10, 85);
    pdf.text(
      `${isCredit ? creditDetail?.aiCreditPack.price : transaction?.amount} ₫`,
      10,
      92
    );

    pdf.text('Ngày bắt đầu:', rightColX, 70);
    pdf.text(
      this.datePipe.transform(
        isCredit ? creditDetail?.createdAt : subscriptionDetail?.startDate,
        'medium'
      ) ?? '',
      rightColX,
      77
    );
    pdf.text('Ngày kết thúc:', rightColX, 85);
    pdf.text(
      this.datePipe.transform(
        isCredit ? creditDetail?.createdAt : subscriptionDetail?.endDate,
        'mediumDate'
      ) ?? '',
      rightColX,
      92
    );

    autoTable(pdf, {
      startY: 105,
      margin: { left: 10 },
      head: [
        isCredit
          ? ['STT', 'TÊN GÓI', 'SỐ LƯỢNG CREDITS', 'CREDITS TẶNG THÊM', 'GIÁ']
          : [
              'STT',
              'TÊN GÓI',
              'DUNG LƯỢNG LƯU TRỮ',
              'SỐ LƯỢNG TÀI KHOẢN',
              'LOẠI GÓI',
              'GIÁ',
            ],
      ],
      body: [
        isCredit
          ? [
              '01',
              creditDetail?.aiCreditPack.name ?? '',
              creditDetail?.aiCreditPack.credits ?? 0,
              creditDetail?.aiCreditPack.bonusCredits ?? 0,
              `${creditDetail?.aiCreditPack.price ?? 0} đ`,
            ]
          : [
              '01',
              plan?.name ?? '',
              plan?.maxUsers ?? 0,
              plan?.storageLimitGB ?? 0,
              subscriptionDetail?.billingCycle === 0 ? 'Tháng' : 'Năm',
              `${plan?.price ?? 0} đ`,
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
      foot: isCredit
        ? [['', '', '', 'Tổng:', `${creditDetail?.aiCreditPack.price ?? 0} ₫`]]
        : [
            ['', '', '', '', 'Giảm giá:', `${deductedAmount} ₫`],
            ['', '', '', '', 'Tổng:', `${transaction?.amount ?? 0} ₫`],
          ],
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [32, 147, 231],
        fontStyle: 'bold',
      },
    });

    pdf.save(fileName);
  }
}
