export interface SeatingPreset {
  id: string;
  label: string;
  type: string;
  description: string;
  url: string;
}

export const SEATING_PRESETS: SeatingPreset[] = [
  {
    id: 'stadium-arena',
    label: 'Stadion Megah (Stadium 360°)',
    type: 'Stadium & Arena',
    description: 'Panggung utama stadion dengan VIP Pit depan, Festival Standing, dan tribun bertingkat (CAT 1, 2, 3)',
    url: '/seating/stadium-arena.svg',
  },
  {
    id: 'festival-open-air',
    label: 'Festival Lapangan Terbuka',
    type: 'Open Air Festival',
    description: 'Panggung lebar outdoor, VIP Left/Right, General Admission luas, booth F&B, dan gerbang masuk',
    url: '/seating/festival-open-air.svg',
  },
  {
    id: 'theater-hall',
    label: 'Gedung Teater & Auditorium',
    type: 'Auditorium Proscenium',
    description: 'Panggung teater, orchestra pit, VIP Diamond Stalls bernomor, Royal Box samping, dan Upper Balcony',
    url: '/seating/theater-hall.svg',
  },
  {
    id: 'indoor-center-stage',
    label: 'Arena Panggung Tengah (360°)',
    type: 'Center Stage Arena',
    description: 'Panggung melingkar di tengah arena dengan VIP Ringside 360°, lower ring, dan tribun 4 penjuru',
    url: '/seating/indoor-center-stage.svg',
  },
];
