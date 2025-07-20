import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ClassicEditor,
  EditorConfig,
  Autoformat,
  Bold,
  Italic,
  Underline,
  BlockQuote,
  Base64UploadAdapter,
  CloudServices,
  Essentials,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
  Link,
  Paragraph,
  Code,
  Mention,
  Undo,
  List,
  IndentBlock,
  Indent,
  Font,
  Alignment,
} from 'ckeditor5';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import type { Writer } from '@ckeditor/ckeditor5-engine';

import {
  convertImgToPImage,
  convertPImageToFigureImg,
} from '../../../../../shared/utils/util-functions';

@Component({
  selector: 'update-material-rich-text',
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  templateUrl: './update-material-rich-text.component.html',
  styleUrl: './update-material-rich-text.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateMaterialRichTextComponent {
  editorValue = input.required<string>();
  invalid = input<boolean>();

  valueChange = output<string>();
  placeholder = input<string>('Nhập nội dung...');
  isAutoFocus = input<boolean>(false);
  isHeightTextBox = input<boolean>(false);

  editorContent = signal<string>('');

  editorInstance: any;
  editor = ClassicEditor;
  config!: EditorConfig;

  constructor() {
    effect(
      () => {
        const raw = this.editorValue();
        const parsed = raw ? convertPImageToFigureImg(raw) : '';
        this.editorContent.set(parsed);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.config = {
      licenseKey: 'GPL',
      placeholder: this.placeholder(),
      toolbar: [
        'undo',
        'redo',
        '|',
        'bold',
        'italic',
        'underline',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'blockQuote',
        'code',
        'uploadImage',
        'link',
        '|',
        'alignment',
        'fontSize',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
      ],
      plugins: [
        Autoformat,
        Alignment,
        BlockQuote,
        Bold,
        CloudServices,
        Essentials,
        Font,
        Image,
        ImageCaption,
        ImageResize,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        Base64UploadAdapter,
        Italic,
        Indent,
        IndentBlock,
        Link,
        List,
        Paragraph,
        PictureEditing,
        Underline,
        Undo,
        Code,
        Mention,
      ],
      image: {
        resizeOptions: [
          {
            name: 'resizeImage:original',
            label: 'Chiều rộng mặc định',
            value: null,
          },
          { name: 'resizeImage:35', label: '35% chiều rộng', value: '35' },
          { name: 'resizeImage:50', label: '50% chiều rộng', value: '50' },
          { name: 'resizeImage:75', label: '75% chiều rộng', value: '75' },
          { name: 'resizeImage:100', label: '100% chiều rộng', value: '100' },
        ],
        toolbar: ['imageTextAlternative', '|', 'resizeImage'],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
      },
    };
  }

  onEditorReady(editor: any) {
    this.editorInstance = editor;

    editor.model.document.on('change:data', () => {
      const rawHtml = editor.getData();
      const cleaned = convertImgToPImage(rawHtml);
      this.valueChange.emit(cleaned);
    });

    if (this.isAutoFocus()) {
      setTimeout(() => {
        editor.editing.view.focus();
        editor.model.change((writer: Writer) => {
          const root = editor.model.document.getRoot();
          if (root) {
            const end = editor.model.createPositionAt(root, 'end');
            writer.setSelection(end);
          }
        });
      }, 0);
    }
  }
}
