export const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "";
export const WS_URL = process.env.REACT_APP_WS_URL || "";
export const NODE_ENV = process.env.REACT_APP_NODE_ENV || "development";

/**
 * Local movie dataset to power rails until backend is wired up.
 * Images are representative placeholders using picsum/photos with seeds to keep variety.
 */
export const movies = [
  { id: 1, title: "Ocean's Depth", genre: "Trending", backdrop: "https://picsum.photos/seed/ocean1/1200/600" },
  { id: 2, title: "Amber Horizon", genre: "Trending", backdrop: "https://picsum.photos/seed/amber2/1200/600" },
  { id: 3, title: "Midnight Tides", genre: "Action", backdrop: "https://picsum.photos/seed/tides3/1200/600" },
  { id: 4, title: "Skyline Run", genre: "Action", backdrop: "https://picsum.photos/seed/skyline4/1200/600" },
  { id: 5, title: "Laughing Waves", genre: "Comedy", backdrop: "https://picsum.photos/seed/waves5/1200/600" },
  { id: 6, title: "Driftwood Tales", genre: "Comedy", backdrop: "https://picsum.photos/seed/drift6/1200/600" },
  { id: 7, title: "Deep Blue", genre: "Drama", backdrop: "https://picsum.photos/seed/blue7/1200/600" },
  { id: 8, title: "Silent Current", genre: "Drama", backdrop: "https://picsum.photos/seed/current8/1200/600" },
  { id: 9, title: "Tidal Fury", genre: "Action", backdrop: "https://picsum.photos/seed/tidal9/1200/600" },
  { id: 10, title: "Breezy Nights", genre: "Comedy", backdrop: "https://picsum.photos/seed/breeze10/1200/600" }
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
