export interface SearchResult {
  id: string;
  name: string;
  price: string;
  image_url: string;
  description: string;
  brand: string;
  condition: string;
  category: string;
  seller_name: string;
  lastSoldDate: string;
  competition: number;
  sold?: number;
  other?: string;
} 