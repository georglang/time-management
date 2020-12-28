import { ITabItem } from './ITabItem';

export const tabs: ITabItem[] = [
  {
    label: 'Stunden',
    icon: 'access_time',
    route: '/hours',
  },
  {
    label: 'Material',
    icon: 'material',
    route: '/material',
  },
  {
    label: 'Notes',
    icon: 'sticky_note_2',
    route: '/notes',
  },
];
