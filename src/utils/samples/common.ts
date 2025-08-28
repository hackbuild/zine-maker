import type { ZineContent, TextProperties, ImageProperties } from '@/types';

export function text(id: string, x: number, y: number, w: number, h: number, value: string, size = 20, weight: 'normal'|'bold' = 'normal', color = '#111111'): ZineContent {
  const props: TextProperties = {
    text: value,
    fontSize: size,
    fontFamily: 'Arial',
    fontWeight: weight,
    fontStyle: 'normal',
    color,
    textAlign: 'left',
    lineHeight: 1.2,
    textDecoration: 'none',
    padding: 0
  };
  return { id, type: 'text', x, y, width: w, height: h, rotation: 0, zIndex: Date.now(), properties: props } as ZineContent;
}

export function textC(id: string, x: number, y: number, w: number, h: number, value: string, size = 20, weight: 'normal'|'bold' = 'normal', color = '#111111'): ZineContent {
  const props: TextProperties = {
    text: value,
    fontSize: size,
    fontFamily: 'Arial',
    fontWeight: weight,
    fontStyle: 'normal',
    color,
    textAlign: 'left',
    lineHeight: 1.25,
    textDecoration: 'none',
    padding: 0
  };
  return { id, type: 'text', x, y, width: w, height: h, rotation: 0, zIndex: Date.now(), properties: props } as ZineContent;
}

export function image(id: string, x: number, y: number, w: number, h: number, src: string, alt = ''): ZineContent {
  const props: ImageProperties = { src, alt, opacity: 1 };
  return { id, type: 'image', x, y, width: w, height: h, rotation: 0, zIndex: Date.now(), properties: props } as ZineContent;
}


