export interface UnityComponent {
  name: string;
  type: string;
  properties: Record<string, string>;
}

export interface UnityStringEntry {
  key: string;
  status: 'translated' | 'untranslated' | 'review';
  en: string;
  vi: string;
}

export interface UnityFile {
  id: string;
  type: 'scene' | 'table' | 'folder';
  name: string;
  components: UnityComponent[];
  strings: UnityStringEntry[];
}

export interface UnityProject {
  files: UnityFile[];
}

export const mockUnityProject: UnityProject = {
  files: [
    {
      id: 'main_menu',
      type: 'scene',
      name: 'MainMenu.unity',
      components: [
        { name: 'TitleText', type: 'Text (TMP)', properties: { Text: 'My Awesome Game', Font: 'Arial' } },
        { name: 'PlayButton', type: 'Button', properties: { Interactable: 'True' } },
        { name: 'PlayButtonText', type: 'Text (TMP)', properties: { Text: 'Play', Font: 'Arial' } },
      ],
      strings: [
        { key: 'menu.title', status: 'translated', en: 'My Awesome Game', vi: 'Game Siêu Cấp Của Tôi' },
        { key: 'menu.play', status: 'translated', en: 'Play', vi: 'Chơi' },
        { key: 'menu.settings', status: 'untranslated', en: 'Settings', vi: '' },
        { key: 'menu.quit', status: 'review', en: 'Quit', vi: 'Thoát' },
      ]
    },
    {
      id: 'localization_data',
      type: 'table',
      name: 'Localization.asset',
      components: [
        { name: 'StringTable', type: 'Localization Table', properties: { Locale: 'English (en)', Entries: '5' } }
      ],
      strings: [
        { key: 'dialogue.npc1.greeting', status: 'translated', en: 'Hello, traveler! What brings you here?', vi: 'Xin chào, lữ khách! Điều gì mang bạn đến đây?' },
        { key: 'dialogue.npc1.quest', status: 'review', en: 'Could you help me find 5 magic herbs?', vi: 'Bạn giúp tôi tìm 5 cây thảo dược thần kỳ được không?' },
        { key: 'item.potion.name', status: 'translated', en: 'Health Potion', vi: 'Bình Máu' },
        { key: 'item.potion.desc', status: 'untranslated', en: 'Restores 50 health points.', vi: '' },
        { key: 'objective.main.1', status: 'untranslated', en: 'Defeat the Slime King', vi: '' }
      ]
    },
    {
      id: 'scripts',
      type: 'folder',
      name: 'Scripts',
      components: [],
      strings: []
    }
  ]
};
