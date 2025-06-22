// src/data/mockUnreal.ts

export interface UnrealStringEntry {
  key: string;
  status: 'translated' | 'review' | 'untranslated';
  source: string;
  translation: string;
  description?: string;
  location?: string;
}

export interface UnrealNamespace {
  name: string;
  entries: UnrealStringEntry[];
}

export const mockUnrealData: UnrealNamespace[] = [
  {
    name: 'UI.MainMenu',
    entries: [
      {
        key: 'start_button_text',
        status: 'translated',
        source: 'Start Game',
        translation: 'Bắt Đầu',
        description: 'Văn bản hiển thị trên nút bắt đầu trong menu.',
        location: '/Game/UI/Widgets/WBP_MainMenu.uasset',
      },
      {
        key: 'quit_button_text',
        status: 'review',
        source: 'Quit Game',
        translation: 'Thoát',
        description: 'Văn bản hiển thị trên nút thoát game.',
        location: '/Game/UI/Widgets/WBP_MainMenu.uasset',
      },
    ],
  },
  {
    name: 'All',
    entries: [], // sẽ được tự tính toán từ tất cả namespace khác
  },
];
