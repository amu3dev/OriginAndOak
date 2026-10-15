export interface Reward {
  id: string;
  nameKey: string;
  points: number;
  discountValue: number;
  image?: string;
  emoji?: string;
}

export const rewards: Reward[] = [
  { id: "reward-1", nameKey: "rw.1.n", points: 50, discountValue: 1.0, image: "/images/espresso.jpg" },
  { id: "reward-2", nameKey: "rw.2.n", points: 100, discountValue: 3.5, image: "/images/croissant.jpg" },
  { id: "reward-3", nameKey: "rw.3.n", points: 200, discountValue: 6.5, image: "/images/lavender-latte.jpg" },
  { id: "reward-4", nameKey: "rw.4.n", points: 150, discountValue: 5.0, emoji: "🏷️" },
  { id: "reward-5", nameKey: "rw.5.n", points: 400, discountValue: 12.0, emoji: "🎒" },
];

/** Demo balance for a member who has never placed an order. */
export const STARTING_POINTS = 180;
/** Matches the "10 points per dollar" promise in the rewards copy. */
export const POINTS_PER_DOLLAR = 10;
/** Orders with a subtotal at or above this include a complimentary espresso shot. */
export const FREE_ESPRESSO_THRESHOLD = 15;
