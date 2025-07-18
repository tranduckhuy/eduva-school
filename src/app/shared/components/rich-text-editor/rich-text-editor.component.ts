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
        const parsed = raw ? this.convertPImageToFigureImg(raw) : '';
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
      const cleaned = this.convertImgToPImage(rawHtml);
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

  convertImgToPImage(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('figure.image').forEach(figure => {
      const img = figure.querySelector('img');
      if (!img) return;

      const figureWidth = (figure as HTMLElement).style.width ?? '';

      const pImage = document.createElement('p-image');
      pImage.setAttribute('src', img.getAttribute('src') ?? '');
      pImage.setAttribute('alt', img.getAttribute('alt') ?? '');
      pImage.setAttribute('width', figureWidth);
      pImage.setAttribute('preview', 'true');

      // ? Wrap p-image tag with p tag for DOM Sanitization
      const wrapperP = document.createElement('p');
      wrapperP.appendChild(pImage);

      figure.replaceWith(wrapperP);
    });

    return doc.body.innerHTML;
  }

  convertPImageToFigureImg(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    doc.querySelectorAll('p > p-image').forEach(pImage => {
      const p = pImage.parentElement;
      if (!p || !(pImage instanceof HTMLElement)) return;

      const src = pImage.getAttribute('src') || '';
      const alt = pImage.getAttribute('alt') || '';
      const width = pImage.getAttribute('width') || '';

      const figure = document.createElement('figure');
      figure.classList.add('image');

      const img = document.createElement('img');
      img.setAttribute('src', src);
      img.setAttribute('alt', alt);
      figure.style.width = width;

      figure.appendChild(img);
      p.replaceWith(figure);
    });

    return doc.body.innerHTML;
  }
}
