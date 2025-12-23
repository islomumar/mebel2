import productAcrylic from "@/assets/product-acrylic.jpg";
import productSpray from "@/assets/product-spray.jpg";
import productVarnish from "@/assets/product-varnish.jpg";
import productPrimer from "@/assets/product-primer.jpg";
import productPutty from "@/assets/product-putty.jpg";
import productRoller from "@/assets/product-roller.jpg";
import productFacade from "@/assets/product-facade.jpg";
import productEnamel from "@/assets/product-enamel.jpg";

import categoryKiraska from "@/assets/category-kiraska.jpg";
import categoryLak from "@/assets/category-lak.jpg";
import categoryEmal from "@/assets/category-emal.jpg";
import categoryGruntovka from "@/assets/category-gruntovka.jpg";
import categoryShpaklyovka from "@/assets/category-shpaklyovka.jpg";
import categoryRang from "@/assets/category-rang.jpg";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  volume: string;
  description: string;
  image: string;
  colors?: string[];
  isBestseller?: boolean;
  isNew?: boolean;
}

export const categories = [
  { name: "Ichki bo'yoqlar", slug: "ichki", icon: "🏠", count: 45 },
  { name: "Tashqi bo'yoqlar", slug: "tashqi", icon: "🏗️", count: 32 },
  { name: "Yog'och uchun", slug: "yogoch", icon: "🪵", count: 28 },
  { name: "Metall uchun", slug: "metall", icon: "🔩", count: 24 },
  { name: "Aerozol bo'yoqlar", slug: "aerozol", icon: "🎨", count: 18 },
  { name: "Bo'yoq asboblari", slug: "asbob", icon: "🖌️", count: 56 },
];

export const mainCategories = [
  { name: "Kiraska", slug: "kiraska", description: "Ichki va tashqi bo'yoqlar", image: categoryKiraska },
  { name: "Lak", slug: "lak", description: "Yog'och va metall uchun", image: categoryLak },
  { name: "Emal", slug: "emal", description: "Yuqori sifatli emallar", image: categoryEmal },
  { name: "Gruntovka", slug: "gruntovka", description: "Asos qoplamalar", image: categoryGruntovka },
  { name: "Shpaklyovka", slug: "shpaklyovka", description: "Tekislash uchun", image: categoryShpaklyovka },
  { name: "Rang aralashmalari", slug: "rang", description: "Rang berish", image: categoryRang },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Akrilik Bo'yoq",
    brand: "ColorMaster",
    category: "Ichki bo'yoqlar",
    categorySlug: "ichki",
    price: 185000,
    originalPrice: 220000,
    volume: "3L",
    description: "Yuqori sifatli akrilik bo'yoq, ichki devorlar uchun. Tez quriydi, hidsiz, ekologik toza.",
    image: productAcrylic,
    colors: ["Oq", "Krem", "Kulrang"],
    isBestseller: true,
  },
  {
    id: "2",
    name: "Aerozol Bo'yoq Spray",
    brand: "SprayMaster",
    category: "Aerozol bo'yoqlar",
    categorySlug: "aerozol",
    price: 45000,
    volume: "400ml",
    description: "Universal aerozol bo'yoq spraylari. Tez qurish, yuqori qoplamlilik, turli ranglar.",
    image: productSpray,
    colors: ["Qora", "Ko'k", "Qizil", "Yashil"],
    isNew: true,
  },
  {
    id: "3",
    name: "Yog'och Laki Premium",
    brand: "WoodCare",
    category: "Yog'och uchun",
    categorySlug: "yogoch",
    price: 125000,
    volume: "1L",
    description: "Yog'och yuzalar uchun maxsus lak. Suvga chidamli, UV himoya, tabiiy ko'rinish.",
    image: productVarnish,
    isBestseller: true,
  },
  {
    id: "4",
    name: "Metall Gruntovkasi",
    brand: "MetalShield",
    category: "Metall uchun",
    categorySlug: "metall",
    price: 95000,
    originalPrice: 110000,
    volume: "1L",
    description: "Zanglanishga qarshi gruntovka. Metall yuzalarni himoya qiladi va bo'yoq yaxshi yopishadi.",
    image: productPrimer,
  },
  {
    id: "5",
    name: "Devor Shpaklyovkasi",
    brand: "DecorPro",
    category: "Ichki bo'yoqlar",
    categorySlug: "ichki",
    price: 78000,
    volume: "5kg",
    description: "Devor tekislash uchun shpaklyovka. Oson surtiladi, tez quriydi, silliq yuzalar.",
    image: productPutty,
    isNew: true,
  },
  {
    id: "6",
    name: "Professional Valik To'plami",
    brand: "PaintTools",
    category: "Bo'yoq asboblari",
    categorySlug: "asbob",
    price: 35000,
    volume: "6 dona",
    description: "Turli o'lchamdagi valiklar to'plami. Yuqori sifatli material, uzoq xizmat muddati.",
    image: productRoller,
    isBestseller: true,
  },
  {
    id: "7",
    name: "Ko'k Emal Bo'yoq",
    brand: "EmalPro",
    category: "Metall uchun",
    categorySlug: "metall",
    price: 89000,
    volume: "1L",
    description: "Metall yuzalar uchun yuqori sifatli emal. Yorqin rang, uzoq muddatli himoya.",
    image: productEnamel,
    colors: ["Ko'k", "Oq", "Qora"],
  },
  {
    id: "8",
    name: "Fasad Bo'yoqi Premium",
    brand: "ColorMaster",
    category: "Tashqi bo'yoqlar",
    categorySlug: "tashqi",
    price: 320000,
    originalPrice: 380000,
    volume: "10L",
    description: "Tashqi devorlar uchun yuqori sifatli bo'yoq. Ob-havoga chidamli, 10+ yil xizmat.",
    image: productFacade,
    isBestseller: true,
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
};
