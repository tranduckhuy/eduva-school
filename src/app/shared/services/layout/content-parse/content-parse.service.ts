import { Injectable } from '@angular/core';

export type RenderBlock =
  | { type: 'html'; html: string }
  | { type: 'image'; src: string; alt?: string; width?: string };

@Injectable({
  providedIn: 'root',
})
export class ContentParserService {
  convertHtmlToBlocks(html: string): RenderBlock[] {
    const blocks: RenderBlock[] = [];
    const doc = new DOMParser().parseFromString(html, 'text/html');

    Array.from(doc.body.childNodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;

        // If HTML is <p-image> tag
        if (el.tagName.toLowerCase() === 'p-image') {
          blocks.push({
            type: 'image',
            src: el.getAttribute('src') ?? '',
            alt: el.getAttribute('alt') ?? '',
            width: el.getAttribute('width') ?? '',
          });
        }

        // If HTML is a <p> tag have a <p-image> child tag
        else if (
          el.tagName.toLowerCase() === 'p' &&
          el.querySelector('p-image')
        ) {
          const pImage = el.querySelector('p-image') as HTMLElement;
          blocks.push({
            type: 'image',
            src: pImage.getAttribute('src') ?? '',
            alt: pImage.getAttribute('alt') ?? '',
            width: pImage.getAttribute('width') ?? '',
          });
        }

        // Others HTML handle normal like static HTML
        else {
          blocks.push({
            type: 'html',
            html: el.outerHTML,
          });
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        blocks.push({
          type: 'html',
          html: node.textContent,
        });
      }
    });

    return blocks;
  }
}
