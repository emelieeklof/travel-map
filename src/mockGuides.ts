import type { CategoryId } from './categories'

export type GuideSpot = {
  name: string
  category: CategoryId
  lat: number
  lng: number
  address?: string
  notes?: string
  photoUrl?: string
}

export type GuideGroup = {
  name: string
  spots: GuideSpot[]
}

/** Canned "AI generated" response — this pass always returns the Athens example,
 * regardless of what's typed, to validate the chat → generated guide → save UX. */
export const ATHENS_GUIDE: GuideGroup[] = [
  {
    name: 'Athens: Sightseeing',
    spots: [
      { name: 'Acropolis', category: 'sightseeing', lat: 37.9715, lng: 23.7257, notes: 'Go right at opening to beat the heat and the crowds.', photoUrl: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&q=80' },
      { name: 'Ancient Agora', category: 'sightseeing', lat: 37.9752, lng: 23.7229, notes: 'Quieter than the Acropolis, same ticket if you get the combo pass.' },
      { name: 'Panathenaic Stadium', category: 'sightseeing', lat: 37.9685, lng: 23.7414, notes: 'Site of the first modern Olympics in 1896.' },
      { name: 'Temple of Olympian Zeus', category: 'sightseeing', lat: 37.9694, lng: 23.7332, notes: 'A few massive columns left, worth a quick stop.' },
    ],
  },
  {
    name: 'Athens: Restaurants',
    spots: [
      { name: 'Diporto Agoras', category: 'eating', lat: 37.9778, lng: 23.7263, address: 'Central Market', notes: 'No sign, no menu — classic taverna, cash only.', photoUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80' },
      { name: 'O Thanasis', category: 'eating', lat: 37.9762, lng: 23.7264, address: 'Monastiraki', notes: 'Souvlaki institution near Monastiraki square.' },
      { name: 'Karamanlidika tou Fani', category: 'eating', lat: 37.9776, lng: 23.7268, address: 'Varvakios area', notes: 'Cured meats and small plates, great for sharing.' },
    ],
  },
  {
    name: 'Athens: Cafés',
    spots: [
      { name: 'Little Kook', category: 'eating', lat: 37.9765, lng: 23.7284, address: 'Psyrri', notes: 'Over-the-top decorated café, changes theme seasonally.', photoUrl: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&q=80' },
      { name: 'Klepsydra', category: 'eating', lat: 37.9724, lng: 23.7258, address: 'Near the Acropolis', notes: 'Tucked in the Anafiotika alleys, good frappé.' },
      { name: 'Tailor Made', category: 'eating', lat: 37.9759, lng: 23.7267, address: 'Monastiraki', notes: 'Solid espresso, good people-watching spot.' },
    ],
  },
]
