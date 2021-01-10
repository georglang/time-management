import { ITabItem } from './ITabItem';

export const tabs: ITabItem[] = [
  {
    feature: 'workingHours',
    label: 'Stunden',
    icon: 'access_time',
    route: '/hours',
  },
  {
    feature: 'materials',
    label: 'Material',
    icon: 'material',
    route: '/material',
  },
  {
    feature: 'notes',
    label: 'Notizen',
    icon: 'sticky_note_2',
    route: '/notes',
  },
];
