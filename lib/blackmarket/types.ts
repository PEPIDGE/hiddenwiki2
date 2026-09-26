export interface MarketMessage {
  id: string;
  from: "player" | "operator";
  text: string;
  at: number;
  artifact?: {
    title: string;
    columns: string[];
    rows: string[][];
    route: string;
    suspicious?: boolean;
  };
}
export interface MarketOrder {
  service: string;
  paid: number;
  purchasedAt: number;
  readAt: number;
  messages: MarketMessage[];
  fulfilled: string[];
}
export interface MarketState {
  revision: number;
  orders: MarketOrder[];
  patches: string[];
  installed: string[];
  membership: boolean;
  resetCount: number;
}
export const emptyMarket = (): MarketState => ({
  revision: 0,
  orders: [],
  patches: [],
  installed: [],
  membership: false,
  resetCount: 0,
});
