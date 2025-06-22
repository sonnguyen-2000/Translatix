// src/data/mockChapter.ts
import { Chapter } from '@/components/editors/ComicEditorView';

export const mockChapter: Chapter = {
  pages: [
    { id: 'p1', url: 'https://placehold.co/800x1200/000000/FFF?text=Trang+1' },
    { id: 'p2', url: 'https://placehold.co/800x1200/111111/FFF?text=Trang+2' },
  ],
  bubbles: {
    p1: [
      { id: 'b1_1', text: 'Where am I...?', translation: 'Đây là đâu...?' },
      { id: 'b1_2', text: 'Who are you?', translation: 'Ngươi là ai?' },
    ],
    p2: [
      { id: 'b2_1', text: 'This is my ultimate power!', translation: 'Đây là sức mạnh tối thượng của ta!' },
    ],
  },
};
