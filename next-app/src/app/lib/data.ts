// next-app/src/lib/data.ts - FULLY TYPED MYSTIC VERSION

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  ingredients?: string[];
}

export interface Promo {
  id: string;
  title: string;
  discount: number;
}

// MOCK DATA - Replace with Supabase later
export const getActivePromo = async (): Promise<Promo | null> => {
  return {
    id: "glow-sale",
    title: "MYSTIC Glow 20% Off",
    discount: 0.2
  };
};

export const getCategories = async (): Promise<string[]> => {
  return ["Serums", "Mists", "Creams", "Masks"];
};

export const getActiveProducts = async (): Promise<Product[]> => {
  return [
    {
      id: "glow-serum",
      name: "MYSTIC Glow Serum",
      description: "K-Beauty transcendence. Illuminates + hydrates for eternal radiance.",
      price: 89,
      image: "/assets/products/glow-serum.jpg",
      category: "Serums",
      ingredients: ["Niacinamide", "Hyaluronic Acid", "Vitamin C"]
    },
    {
      id: "hydration-mist",
      name: "MYSTIC Hydration Mist",
      description: "Instant refresh. Transcends ordinary hydration.",
      price: 45,
      image: "/assets/products/hydration-mist.jpg",
      category: "Mists"
    }
  ].sort((a, b) => b.price - a.price); // Most expensive first
};

export const getIngredients = async (): Promise<string[][]> => {
  return [
    ["Niacinamide", "Hyaluronic Acid", "Vitamin C"],
    ["Centella Asiatica", "Panthenol", "Ceramides"]
  ];
};
