import turmericImg from "@/assets/turmeric.jpg";
import chilliImg from "@/assets/chilli.jpg";
import cardamomImg from "@/assets/cardamom.jpg";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  category: "Turmeric" | "Chilli" | "Cardamom";
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  description: string;
  ingredients: string[];
  stock: number;
};

export const products: Product[] = [
  {
    id: "turmeric-classic",
    name: "Organic Turmeric Powder",
    tagline: "Sun-dried Erode roots",
    category: "Turmeric",
    price: 249,
    oldPrice: 299,
    rating: 4.9,
    reviews: 1284,
    image: turmericImg,
    badge: "Bestseller",
    description:
      "Stone-ground from sun-dried Erode turmeric roots, our golden powder carries 4.2% curcumin — earthy, warm, and luminous in every dish.",
    ingredients: ["100% Organic Turmeric (Curcuma longa)"],
    stock: 124,
  },
  {
    id: "chilli-kashmiri",
    name: "Kashmiri Chilli Powder",
    tagline: "Mild heat, vivid colour",
    category: "Chilli",
    price: 279,
    oldPrice: 329,
    rating: 4.8,
    reviews: 942,
    image: chilliImg,
    badge: "New",
    description:
      "Hand-picked Kashmiri chillies, slow sun-dried and finely milled. Deep crimson colour, gentle heat — perfect for curries, tandoor, and pickles.",
    ingredients: ["100% Organic Kashmiri Chillies"],
    stock: 86,
  },
  {
    id: "cardamom-green",
    name: "Green Cardamom Pods",
    tagline: "Idukki highland harvest",
    category: "Cardamom",
    price: 549,
    oldPrice: 649,
    rating: 4.95,
    reviews: 612,
    image: cardamomImg,
    badge: "Premium",
    description:
      "Bold 8mm pods from the misty hills of Idukki — intensely aromatic with sweet, floral notes. Hand-sorted for uniform size and colour.",
    ingredients: ["100% Organic Green Cardamom (Elettaria cardamomum)"],
    stock: 58,
  },
  {
    id: "turmeric-raw",
    name: "Raw Turmeric Fingers",
    tagline: "Whole dried rhizomes",
    category: "Turmeric",
    price: 329,
    rating: 4.7,
    reviews: 318,
    image: turmericImg,
    description: "Whole sun-dried turmeric fingers. Grind fresh at home for unmatched aroma.",
    ingredients: ["100% Organic Turmeric Rhizome"],
    stock: 47,
  },
  {
    id: "chilli-guntur",
    name: "Guntur Chilli Powder",
    tagline: "Bold Andhra heat",
    category: "Chilli",
    price: 229,
    rating: 4.6,
    reviews: 456,
    image: chilliImg,
    description: "Fiery, smoky Guntur Sannam chillies — the soul of Andhra cuisine.",
    ingredients: ["100% Organic Guntur Chillies"],
    stock: 92,
  },
  {
    id: "cardamom-powder",
    name: "Ground Cardamom",
    tagline: "Fresh-milled, aromatic",
    category: "Cardamom",
    price: 649,
    rating: 4.85,
    reviews: 204,
    image: cardamomImg,
    description: "Freshly milled green cardamom powder — perfect for chai, desserts, and bakes.",
    ingredients: ["100% Organic Green Cardamom"],
    stock: 31,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
