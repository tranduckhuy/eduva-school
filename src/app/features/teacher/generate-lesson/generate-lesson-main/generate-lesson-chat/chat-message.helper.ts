export function renderFailureMessage(reason: string): string {
  return `
    <div class="text-red-500 font-medium">
      <p>😢 <strong>Rất tiếc!</strong> Quá trình tạo nội dung không thành công.</p>
      <p>Lý do: <em>${reason}</em></p>
      <p>Bạn có thể <strong>nhập yêu cầu khác</strong> và thử lại để tạo nội dung mới.</p>
      <p class="mt-2 text-sm text-primary">
        💡 <em>Gợi ý: Hãy thử thay đổi cách mô tả chủ đề hoặc kiểm tra lại tài liệu đã upload.</em>
      </p>
    </div>
  `;
}

export function renderSuccessMessage(
  previewContent?: string,
  audioCost?: number,
  videoCost?: number,
  estimatedDurationMinutes?: number,
  formatEstimatedDuration?: (minutes: number) => string
): string {
  const previewBlock = previewContent
    ? `
      <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3">
        ${previewContent}...
      </div>
    `
    : '';

  return `
    <div class="mb-3">
      <h4 class="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">
        🎓 Nội dung bài giảng đã sẵn sàng!
      </h4>

      <p class="mb-2 text-gray-700 dark:text-gray-300">
        Đây là <strong>bản nháp gợi ý</strong> dựa trên chủ đề bạn đã cung cấp. Bạn có thể chỉnh sửa, bổ sung hoặc phát triển thêm để tạo nên một bài giảng hấp dẫn và truyền cảm hứng cho người học.
      </p>
      <p class="mb-2 text-gray-700 dark:text-gray-300">
        Sau khi bạn tạo nội dung chính thức, phần bản nháp này sẽ <strong>không được lưu trữ</strong>. Nội dung hoàn tất sẽ được lưu trữ trong hệ thống để bạn có thể thao tác với nội dung đã tạo ra.
      </p>

      ${previewBlock}

      <div class="mb-2 text-sm text-gray-600 dark:text-gray-400 italic">
        <p>🎧 Tạo bản ghi âm (audio): <strong>${audioCost}</strong> Ecoin</p>
        <p>🎞️ Tạo video minh hoạ (có giọng đọc + hình ảnh): <strong>${videoCost}</strong> Ecoin</p>
        ${estimatedDurationMinutes && formatEstimatedDuration ? `<p>⏱️ Thời lượng dự kiến của nội dung: <strong>${formatEstimatedDuration(estimatedDurationMinutes)}</strong></p>` : ''}
      </div>

      <p class="mb-2 text-gray-700 dark:text-gray-300">
        Nếu bạn đồng ý với chi phí hiển thị ở trên, hãy tiếp tục bằng cách nhấn nút <strong>"Tạo nội dung"</strong> ở phần bên phải để bắt đầu tạo nội dung chính thức.
      </p>

      <p class="mb-2 text-gray-700 dark:text-gray-300">
        <strong>EDUVA</strong> xin chân thành cảm ơn bạn đã tin tưởng sử dụng hệ thống!
      </p>

      <p class="mt-3 text-xs text-primary">
        * Lưu ý: Chi phí chỉ được tính khi bạn thực hiện tạo sản phẩm chính thức.
      </p>
    </div>
  `;
}

export function renderReadOnlySuccessMessage(): string {
  return `
    <div class="mb-3">
      <h4 class="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">
        ✅ Nội dung bài giảng đã được tạo thành công!
      </h4>

      <p class="mb-2 text-gray-700 dark:text-gray-300">
        Bạn có thể <strong>xem trước hoặc tải xuống</strong> nội dung này ở phần bên phải.
      </p>

      <p class="mb-2 text-gray-700 dark:text-gray-300">
        Nếu bạn muốn tạo nội dung mới, vui lòng quay lại trang quản lý và bắt đầu lại với một yêu cầu khác.
      </p>

      <p class="mt-3 text-xs text-primary">
        * Lưu ý: Bạn không thể chỉnh sửa hoặc tạo lại nội dung này tại bước này.
      </p>
    </div>
  `;
}

export function renderProvidedInformationError(): string {
  return `
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
      <div class="flex items-center space-x-2">
        <div class="flex-shrink-0">
          <span class="pi pi-exclamation-circle text-red-500 text-lg"></span>
        </div>
        <div class="flex-1">
          <p class="text-red-500 font-medium">
            Yêu cầu quá dài, vui lòng chỉnh sửa và thử lại.
          </p>
        </div>
      </div>
    </div>
  `;
}
