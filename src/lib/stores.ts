export interface Store {
  id: string;
  /** Prefix for this store's dictionary keys, e.g. "st.1" → "st.1.name". */
  keyPrefix: string;
  phone: string;
  pinCoordinates: { x: number; y: number };
  features: string[];
}

export const stores: Store[] = [
  {
    id: "store-1",
    keyPrefix: "st.1",
    phone: "(555) 123-4567",
    pinCoordinates: { x: 32, y: 45 },
    features: ["driveThru", "patio", "wifi", "roasteryBar"],
  },
  {
    id: "store-2",
    keyPrefix: "st.2",
    phone: "(555) 234-5678",
    pinCoordinates: { x: 68, y: 35 },
    features: ["riverView", "petFriendly", "wifi", "bakery"],
  },
  {
    id: "store-3",
    keyPrefix: "st.3",
    phone: "(555) 345-6789",
    pinCoordinates: { x: 50, y: 70 },
    features: ["studyRooms", "lateNight", "wifi"],
  },
];

export const DEFAULT_STORE_ID = stores[0].id;
