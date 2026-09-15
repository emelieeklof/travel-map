import type { Collection, Creator, Place } from './types'

/**
 * Hardcoded demo content for the Explore feed — @sarah/@alex/@lucas/@james
 * are not real accounts. They're merged in alongside your real (Supabase-backed)
 * collections/places purely for the mocked social UI; never written to the DB.
 */
const SEED_TIME = 1700000000000

export const MOCK_CREATORS: Creator[] = [
  { id: 'sarah', handle: 'sarah', name: 'Sarah', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=sarah', bio: 'Coffee lover, map maker, world explorer.', followerCount: 2100, followingCount: 1400 },
  { id: 'alex', handle: 'alex', name: 'Alex', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=alex', bio: 'Mid-century design hunter.', followerCount: 980, followingCount: 340 },
  { id: 'lucas', handle: 'lucas', name: 'Lucas', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=lucas', bio: 'Amalfi coast regular.', followerCount: 540, followingCount: 210 },
  { id: 'james', handle: 'james', name: 'James', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=james', bio: 'Bars and rooftops.', followerCount: 1250, followingCount: 890 },
  { id: 'erik', handle: 'erik.ateshere', name: 'Erik', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=erik', bio: 'Stockholm mid-range eats, no fuss.', followerCount: 760, followingCount: 220 },
  { id: 'maria', handle: 'maria.svensk', name: 'Maria', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=maria', bio: 'Traditional Swedish food, the real stuff.', followerCount: 1430, followingCount: 510 },
  { id: 'oskar', handle: 'oskar.trails', name: 'Oskar', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=oskar', bio: 'Hiking trails in and around Stockholm.', followerCount: 890, followingCount: 340 },
  { id: 'nina', handle: 'nina.wanders', name: 'Nina', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=nina', bio: 'Chasing the world\'s most iconic views.', followerCount: 3200, followingCount: 610 },
  { id: 'sofia', handle: 'sofia.desserts', name: 'Sofia', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=sofia', bio: 'Life is short, order dessert first.', followerCount: 2800, followingCount: 450 },
  { id: 'marcus', handle: 'marcus.builds', name: 'Marcus', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=marcus', bio: 'Modern architecture worth the detour.', followerCount: 1900, followingCount: 380 },
]

/** A handful of the most-followed mock creators — used to auto-follow a starter
 * set for brand-new accounts so the Home feed isn't empty on day one. */
export const DEFAULT_FOLLOW_IDS = ['nina', 'sofia', 'sarah', 'maria', 'marcus']

const sarahCoffeeId = 'mock-sarah-coffee'
const alexShoppingId = 'mock-alex-shopping'
const lucasAmalfiId = 'mock-lucas-amalfi'
const jamesBarsId = 'mock-james-bars'
const erikMidRangeId = 'mock-erik-midrange'
const mariaAuthenticId = 'mock-maria-authentic'
const oskarHikingId = 'mock-oskar-hiking'
const ninaViewsId = 'mock-nina-views'
const sofiaDessertsId = 'mock-sofia-desserts'
const marcusArchitectureId = 'mock-marcus-architecture'

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: sarahCoffeeId,
    name: "Tokyo's Coffee Scene",
    createdAt: SEED_TIME,
    creatorId: 'sarah',
    center: { lat: 35.6762, lng: 139.6503 },
    zoom: 12,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
    ],
  },
  {
    id: alexShoppingId,
    name: 'Mid-Century Shopping (LA)',
    createdAt: SEED_TIME,
    creatorId: 'alex',
    center: { lat: 34.0522, lng: -118.2437 },
    zoom: 11,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80',
    ],
  },
  {
    id: lucasAmalfiId,
    name: 'Amalfi Views & Sips',
    createdAt: SEED_TIME,
    creatorId: 'lucas',
    center: { lat: 40.634, lng: 14.6027 },
    zoom: 12,
    coverPhotoUrls: ['https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&q=80'],
  },
  {
    id: jamesBarsId,
    name: 'Rooftop Bars Worldwide',
    createdAt: SEED_TIME,
    creatorId: 'james',
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 11,
    coverPhotoUrls: ['https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80'],
  },
  {
    id: erikMidRangeId,
    name: 'Stockholm: Best Mid-Range Restaurants',
    description: 'Great food, fair prices — no tourist markups.',
    createdAt: SEED_TIME,
    creatorId: 'erik',
    center: { lat: 59.317, lng: 18.078 },
    zoom: 13,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    ],
  },
  {
    id: mariaAuthenticId,
    name: 'Authentic Stockholm Restaurants',
    description: 'Traditional husmanskost, run the same way for decades.',
    createdAt: SEED_TIME,
    creatorId: 'maria',
    center: { lat: 59.335, lng: 18.065 },
    zoom: 13,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80',
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80',
    ],
  },
  {
    id: oskarHikingId,
    name: 'Best Hiking Near Stockholm',
    description: 'Day trips out of the city, no car required for most.',
    createdAt: SEED_TIME,
    creatorId: 'oskar',
    center: { lat: 59.28, lng: 18.15 },
    zoom: 11,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    ],
  },
  {
    id: ninaViewsId,
    name: "World's Most Iconic Views",
    description: 'Bucket-list viewpoints, worth the early alarm.',
    createdAt: SEED_TIME,
    creatorId: 'nina',
    center: { lat: 20, lng: 30 },
    zoom: 2,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80',
    ],
  },
  {
    id: sofiaDessertsId,
    name: 'Best Desserts in the World',
    description: 'Worth the sugar crash.',
    createdAt: SEED_TIME,
    creatorId: 'sofia',
    center: { lat: 45, lng: -10 },
    zoom: 2,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80',
      'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80',
    ],
  },
  {
    id: marcusArchitectureId,
    name: 'Modern Architecture Worth the Detour',
    description: 'Buildings you plan a trip around.',
    createdAt: SEED_TIME,
    creatorId: 'marcus',
    center: { lat: 40, lng: 5 },
    zoom: 2,
    coverPhotoUrls: [
      'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600&q=80',
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80',
    ],
  },
]

export const MOCK_PLACES: Place[] = [
  { id: 'mock-p1', collectionId: sarahCoffeeId, name: 'Cafe Du Jour', category: 'eating', lat: 48.8566, lng: 2.3522, address: 'Paris', notes: 'Vibess loved this photo from mind the silence.', photoUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-p2', collectionId: sarahCoffeeId, name: 'Blue Bottle Aoyama', category: 'eating', lat: 35.669, lng: 139.7157, notes: 'Minimalist pour-over spot.', photoUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-p3', collectionId: alexShoppingId, name: 'Modernica Showroom', category: 'shopping', lat: 34.043, lng: -118.2364, notes: 'Original Case Study furniture reproductions.', photoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-p4', collectionId: lucasAmalfiId, name: 'Cafe Du Jour', category: 'eating', lat: 40.6333, lng: 14.6029, address: 'Paris • similar spot', notes: '@lucas: Descriptions about postedonexts from...', photoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', createdAt: SEED_TIME },

  // Erik — Stockholm mid-range restaurants
  { id: 'mock-erik-1', collectionId: erikMidRangeId, name: 'Pelikan', category: 'eating', lat: 59.3117, lng: 18.0784, address: 'Blekingegatan 40, Södermalm', notes: 'Classic Swedish husmanskost — try the meatballs.', photoUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-erik-2', collectionId: erikMidRangeId, name: 'Meatballs for the People', category: 'eating', lat: 59.3125, lng: 18.0819, address: 'Nytorgsgatan 30, Södermalm', notes: 'A dozen meatball variations, all solid.', photoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-erik-3', collectionId: erikMidRangeId, name: 'Nytorget Urban Deli', category: 'eating', lat: 59.3129, lng: 18.0812, address: 'Nytorget 4, Södermalm', notes: 'Reliable brunch and dinner, good wine list.', createdAt: SEED_TIME },
  { id: 'mock-erik-4', collectionId: erikMidRangeId, name: 'Kagges', category: 'eating', lat: 59.3097, lng: 18.0733, address: 'Ringvägen 47, Södermalm', notes: 'Neighborhood favorite, always busy on weekends.', createdAt: SEED_TIME },

  // Maria — authentic Stockholm restaurants
  { id: 'mock-maria-1', collectionId: mariaAuthenticId, name: "Rolfs Kök", category: 'eating', lat: 59.3423, lng: 18.0575, address: 'Tegnérgatan 41, Vasastan', notes: 'Open kitchen, seasonal Swedish menu since the 80s.', photoUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-maria-2', collectionId: mariaAuthenticId, name: 'Tennstopet', category: 'eating', lat: 59.3452, lng: 18.0483, address: 'Dalagatan 50', notes: 'Old-school tavern feel, unchanged for decades.', photoUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-maria-3', collectionId: mariaAuthenticId, name: 'Sturehof', category: 'eating', lat: 59.3364, lng: 18.0757, address: 'Stureplan 2', notes: 'Seafood institution right on Stureplan.', createdAt: SEED_TIME },
  { id: 'mock-maria-4', collectionId: mariaAuthenticId, name: 'Kajsas Fisk', category: 'eating', lat: 59.3336, lng: 18.0616, address: 'Hötorgshallen', notes: 'Fish soup counter inside the food hall — go early.', createdAt: SEED_TIME },

  // Oskar — best hiking near Stockholm
  { id: 'mock-oskar-1', collectionId: oskarHikingId, name: 'Nackareservatet', category: 'activities', lat: 59.3057, lng: 18.1281, address: 'Nacka', notes: 'Rocky trails and lake views, 20 min from the city.', photoUrl: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-oskar-2', collectionId: oskarHikingId, name: 'Hellasgården', category: 'activities', lat: 59.2807, lng: 18.1489, address: 'Nacka', notes: 'Sauna + cold lake dip after the trail — bring a towel.', photoUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-oskar-3', collectionId: oskarHikingId, name: 'Tyresta National Park', category: 'activities', lat: 59.1917, lng: 18.2361, address: 'Tyresta', notes: 'Old-growth forest, full-day loop trail.', createdAt: SEED_TIME },
  { id: 'mock-oskar-4', collectionId: oskarHikingId, name: 'Djurgården trail', category: 'activities', lat: 59.3251, lng: 18.1039, address: 'Djurgården', notes: 'Easy, scenic, and inside the city — good for a short walk.', createdAt: SEED_TIME },

  // Nina — iconic views worldwide
  { id: 'mock-nina-1', collectionId: ninaViewsId, name: 'Oia Caldera View', category: 'sightseeing', lat: 36.4618, lng: 25.3753, address: 'Santorini, Greece', notes: 'Get there an hour before sunset for a spot on the wall.', photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-nina-2', collectionId: ninaViewsId, name: 'Tegallalang Rice Terraces', category: 'sightseeing', lat: -8.4312, lng: 115.2777, address: 'Ubud, Bali', notes: 'Early morning light, fewer tour groups.', photoUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-nina-3', collectionId: ninaViewsId, name: 'Göreme Balloon Viewpoint', category: 'sightseeing', lat: 38.6431, lng: 34.8289, address: 'Cappadocia, Turkey', notes: 'Sunrise balloon launch — book the week before, not the day before.', createdAt: SEED_TIME },
  { id: 'mock-nina-4', collectionId: ninaViewsId, name: 'Mont Saint-Michel', category: 'sightseeing', lat: 48.6361, lng: -1.5115, address: 'Normandy, France', notes: 'Check tide times — the causeway floods.', createdAt: SEED_TIME },

  // Sofia — best desserts in the world
  { id: 'mock-sofia-1', collectionId: sofiaDessertsId, name: 'Cédric Grolet Opéra', category: 'eating', lat: 48.8709, lng: 2.3316, address: 'Paris', notes: 'The trompe-l\'œil fruit pastries — arrive when it opens.', photoUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-sofia-2', collectionId: sofiaDessertsId, name: 'Levain Bakery', category: 'eating', lat: 40.7794, lng: -73.98, address: 'Upper West Side, NYC', notes: 'The 6oz chocolate chip walnut cookie is the move.', photoUrl: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-sofia-3', collectionId: sofiaDessertsId, name: 'Pierre Hermé', category: 'eating', lat: 48.8517, lng: 2.3324, address: 'Rue Bonaparte, Paris', notes: 'Ispahan macaron — rose, lychee, raspberry.', createdAt: SEED_TIME },

  // Marcus — modern architecture worth the detour
  { id: 'mock-marcus-1', collectionId: marcusArchitectureId, name: 'Sagrada Família', category: 'sightseeing', lat: 41.4036, lng: 2.1744, address: 'Barcelona', notes: 'Book the tower-access ticket in advance, sells out.', photoUrl: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-marcus-2', collectionId: marcusArchitectureId, name: 'Bosco Verticale', category: 'sightseeing', lat: 45.4859, lng: 9.1907, address: 'Milan', notes: 'Vertical forest towers — best viewed from Piazza Gae Aulenti.', photoUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80', createdAt: SEED_TIME },
  { id: 'mock-marcus-3', collectionId: marcusArchitectureId, name: 'Guggenheim Bilbao', category: 'sightseeing', lat: 43.2686, lng: -2.934, address: 'Bilbao', notes: 'The titanium curves look different every hour of the day.', createdAt: SEED_TIME },
]

/** Fake "recent activity" for the Home feed — which mock places to show as newly
 * added, and how long ago (computed relative to now so it always looks fresh). */
export const MOCK_FEED_ITEMS: { placeId: string; addedAt: number }[] = [
  { placeId: 'mock-nina-1', addedAt: Date.now() - 1000 * 60 * 20 }, // 20 min ago
  { placeId: 'mock-erik-2', addedAt: Date.now() - 1000 * 60 * 45 }, // 45 min ago
  { placeId: 'mock-sofia-1', addedAt: Date.now() - 1000 * 60 * 60 * 2 }, // 2h ago
  { placeId: 'mock-maria-1', addedAt: Date.now() - 1000 * 60 * 60 * 3 }, // 3h ago
  { placeId: 'mock-marcus-1', addedAt: Date.now() - 1000 * 60 * 60 * 8 }, // 8h ago
  { placeId: 'mock-oskar-1', addedAt: Date.now() - 1000 * 60 * 60 * 20 }, // 20h ago
  { placeId: 'mock-p1', addedAt: Date.now() - 1000 * 60 * 60 * 30 }, // 30h ago
  { placeId: 'mock-nina-2', addedAt: Date.now() - 1000 * 60 * 60 * 24 }, // 1d ago
  { placeId: 'mock-p3', addedAt: Date.now() - 1000 * 60 * 60 * 24 * 2 }, // 2d ago
  { placeId: 'mock-sofia-2', addedAt: Date.now() - 1000 * 60 * 60 * 24 * 2.5 }, // 2.5d ago
  { placeId: 'mock-oskar-2', addedAt: Date.now() - 1000 * 60 * 60 * 24 * 3 }, // 3d ago
  { placeId: 'mock-marcus-2', addedAt: Date.now() - 1000 * 60 * 60 * 24 * 3.5 }, // 3.5d ago
  { placeId: 'mock-maria-2', addedAt: Date.now() - 1000 * 60 * 60 * 24 * 4 }, // 4d ago
]

/** Starter content given to every brand-new signed-in user (written for real into Supabase on first login). */
export function starterLisbonSeed(ownerId: string) {
  const lisbon: Omit<Collection, 'id'> = {
    name: 'Lisbon',
    description: 'Long weekend — October 2026',
    center: { lat: 38.7223, lng: -9.1393 },
    zoom: 13,
    createdAt: Date.now(),
    creatorId: ownerId,
  }
  const places: Omit<Place, 'id' | 'collectionId' | 'createdAt'>[] = [
    { name: 'Time Out Market', category: 'eating', lat: 38.7066, lng: -9.1459, address: 'Av. 24 de Julho 49', notes: 'Bifanas at the Henrique Sá Pessoa stall.', photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
    { name: 'Pastéis de Belém', category: 'eating', lat: 38.6975, lng: -9.2032, address: 'R. de Belém 84-92', notes: 'Worth the queue. Warm, dusted with cinnamon.', photoUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80' },
    { name: 'Jerónimos Monastery', category: 'sightseeing', lat: 38.6979, lng: -9.2068, notes: 'Book online to skip the line.', photoUrl: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&q=80' },
    { name: 'Miradouro da Senhora do Monte', category: 'sightseeing', lat: 38.717, lng: -9.1335, notes: 'Best sunset view in the city.' },
    { name: 'LX Factory', category: 'shopping', lat: 38.7028, lng: -9.1771, notes: 'Independent boutiques, bookshops, food.' },
    { name: 'Pensão Amor', category: 'bars', lat: 38.7079, lng: -9.1456, notes: 'Bordello-themed cocktail bar in Cais do Sodré.' },
    { name: 'Tram 28 ride', category: 'activities', lat: 38.711, lng: -9.133, notes: 'Go early to get a window seat.' },
  ]
  return { lisbon, places }
}
