export interface RpgFileData {
  name: string;
  progress: string;
  selected: boolean;
  checked: boolean;
}

export const mockRpgFiles: RpgFileData[] = [
  { name: 'Actors.json', progress: '66%', selected: true, checked: true },
  { name: 'Items.json', progress: '100%', selected: false, checked: true },
  { name: 'Skills.json', progress: '15%', selected: false, checked: false },
];
