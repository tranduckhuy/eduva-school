import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
} from 'ckeditor5';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import type { Writer } from '@ckeditor/ckeditor5-engine';

import {
  convertImgToPImage,
  convertPImageToFigureImg,
} from '../../utils/util-functions';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [FormsModule, CommonModule, CKEditorModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorComponent {
  editorValue = input.required<string>();
  placeholder = input<string>('Nhập nội dung...');
  invalid = input<boolean>(false);
  isAutoFocus = input<boolean>(false);
  isHeightTextBox = input<boolean>(false);

  valueChange = output<string>();

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
        'bold',
        'italic',
        'underline',
        'blockQuote',
        'code',
        'uploadImage',
        'link',
      ],
      plugins: [
        Autoformat,
        BlockQuote,
        Bold,
        CloudServices,
        Essentials,
        Image,
        ImageCaption,
        ImageResize,
        ImageStyle,
        ImageToolbar,
        ImageUpload,
        Base64UploadAdapter,
        Italic,
        Link,
        Paragraph,
        PictureEditing,
        Underline,
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
