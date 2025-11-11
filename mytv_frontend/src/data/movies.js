export const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "";
export const WS_URL = process.env.REACT_APP_WS_URL || "";
export const NODE_ENV = process.env.REACT_APP_NODE_ENV || "development";

/**
 * Local movie dataset to power rails until backend is wired up.
 * Images are representative placeholders using picsum/photos with seeds to keep variety.
 */
export const movies = [
  {
    id: 1,
    title: "Ocean's Depth",
    genre: "Trending",
    year: 2023,
    rating: 8.4,
    backdrop: "https://picsum.photos/seed/ocean1/1200/600",
    description: "A daring expedition dives into uncharted waters, uncovering secrets buried in the abyss."
  },
  {
    id: 2,
    title: "Amber Horizon",
    genre: "Trending",
    year: 2024,
    rating: 7.9,
    backdrop: "https://picsum.photos/seed/amber2/1200/600",
    description: "At dusk, a small town faces a choice that could change their lives forever."
  },
  {
    id: 3,
    title: "Midnight Tides",
    genre: "Action",
    year: 2022,
    rating: 8.1,
    backdrop: "https://picsum.photos/seed/tides3/1200/600",
    description: "When the tide turns, a covert team races against time across stormy seas."
  },
  {
    id: 4,
    title: "Skyline Run",
    genre: "Action",
    year: 2021,
    rating: 7.7,
    backdrop: "https://picsum.photos/seed/skyline4/1200/600",
    description: "High above the city, a courier must make the ultimate delivery to save a friend."
  },
  {
    id: 5,
    title: "Laughing Waves",
    genre: "Comedy",
    year: 2020,
    rating: 7.2,
    backdrop: "https://picsum.photos/seed/waves5/1200/600",
    description: "A seaside town rallies to stage the most ridiculous surf competition ever."
  },
  {
    id: 6,
    title: "Driftwood Tales",
    genre: "Comedy",
    year: 2019,
    rating: 7.5,
    backdrop: "https://picsum.photos/seed/drift6/1200/600",
    description: "Strangers stranded on a boardwalk learn they have more in common than they think."
  },
  {
    id: 7,
    title: "Deep Blue",
    genre: "Drama",
    year: 2018,
    rating: 8.0,
    backdrop: "https://picsum.photos/seed/blue7/1200/600",
    description: "A marine biologist struggles to balance family and a breakthrough that could save reefs."
  },
  {
    id: 8,
    title: "Silent Current",
    genre: "Drama",
    year: 2023,
    rating: 7.8,
    backdrop: "https://picsum.photos/seed/current8/1200/600",
    description: "Two siblings reconnect during a silent retreat by the ocean, where truths surface."
  },
  {
    id: 9,
    title: "Tidal Fury",
    genre: "Action",
    year: 2024,
    rating: 8.3,
    backdrop: "https://picsum.photos/seed/tidal9/1200/600",
    description: "A rogue wave hits a coastal city; heroes rise amid chaos to turn the tide."
  },
  {
    id: 10,
    title: "Breezy Nights",
    genre: "Comedy",
    year: 2022,
    rating: 7.1,
    backdrop: "https://picsum.photos/seed/breeze10/1200/600",
    description: "An overnight festival spirals into a string of hilarious, heartfelt misadventures."
  }
];

/**
 * Group movies by genre.
 */
export function groupByGenre(list) {
  return list.reduce((acc, m) => {
    acc[m.genre] = acc[m.genre] || [];
    acc[m.genre].push(m);
    return acc;
  }, {});
}
