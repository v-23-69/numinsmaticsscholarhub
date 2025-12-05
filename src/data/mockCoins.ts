import coinMughalFront from "@/assets/coin-mughal-front.jpg";
import coinBritishFront from "@/assets/coin-british-front.jpg";
import coinSultanateFront from "@/assets/coin-sultanate-front.jpg";
import coinAncientFront from "@/assets/coin-ancient-front.jpg";

export interface Coin {
  id: string;
  title: string;
  era: string;
  price: number;
  frontImage: string;
  backImage: string;
  sellerName: string;
  sellerTrustScore: number;
  isVerified: boolean;
  views?: number;
}

export const featuredCoins: Coin[] = [
  {
    id: "1",
    title: "Mughal Empire Gold Mohur - Shah Jahan Period 1628",
    era: "Mughal India",
    price: 285000,
    frontImage: coinMughalFront,
    backImage: coinBritishFront,
    sellerName: "Heritage Coins",
    sellerTrustScore: 4.9,
    isVerified: true,
    views: 1234,
  },
  {
    id: "2",
    title: "British India One Rupee - Victoria Queen 1862",
    era: "British India",
    price: 45000,
    frontImage: coinBritishFront,
    backImage: coinMughalFront,
    sellerName: "Royal Numismatics",
    sellerTrustScore: 4.7,
    isVerified: true,
    views: 892,
  },
  {
    id: "3",
    title: "Delhi Sultanate Silver Tanka - 14th Century",
    era: "Sultanates",
    price: 78000,
    frontImage: coinSultanateFront,
    backImage: coinAncientFront,
    sellerName: "Medieval Coins India",
    sellerTrustScore: 4.8,
    isVerified: true,
    views: 723,
  },
  {
    id: "4",
    title: "Gupta Dynasty Gold Dinar - 4th Century AD",
    era: "Ancient India",
    price: 450000,
    frontImage: coinAncientFront,
    backImage: coinSultanateFront,
    sellerName: "Ancient Heritage",
    sellerTrustScore: 5.0,
    isVerified: true,
    views: 2341,
  },
];

export const marketplaceCoins: Coin[] = [
  ...featuredCoins,
  {
    id: "5",
    title: "Akbar Period Silver Rupee - Agra Mint 1580",
    era: "Mughal India",
    price: 125000,
    frontImage: coinMughalFront,
    backImage: coinBritishFront,
    sellerName: "Mughal Treasures",
    sellerTrustScore: 4.9,
    isVerified: true,
    views: 1567,
  },
  {
    id: "6",
    title: "George V King Emperor - Half Rupee 1936",
    era: "British India",
    price: 22000,
    frontImage: coinBritishFront,
    backImage: coinMughalFront,
    sellerName: "Colonial Coins",
    sellerTrustScore: 4.4,
    isVerified: true,
    views: 678,
  },
  {
    id: "7",
    title: "East India Company Half Anna - 1835 Madras",
    era: "East India Company",
    price: 12500,
    frontImage: coinSultanateFront,
    backImage: coinBritishFront,
    sellerName: "Antique Treasures",
    sellerTrustScore: 4.5,
    isVerified: false,
    views: 456,
  },
  {
    id: "8",
    title: "Republic India 10 Rupees - 1970 FAO",
    era: "Modern India",
    price: 8500,
    frontImage: coinBritishFront,
    backImage: coinAncientFront,
    sellerName: "Modern Collector",
    sellerTrustScore: 4.6,
    isVerified: false,
    views: 312,
  },
];

export const coinCategories = [
  {
    id: "mughal",
    name: "Mughal India",
    description: "Gold Mohurs, Silver Rupees",
    count: "2,450+",
    image: coinMughalFront,
  },
  {
    id: "british",
    name: "British India",
    description: "Victoria Era Coins",
    count: "3,120+",
    image: coinBritishFront,
  },
  {
    id: "sultanate",
    name: "Sultanates",
    description: "Delhi & Regional",
    count: "1,850+",
    image: coinSultanateFront,
  },
  {
    id: "ancient",
    name: "Ancient India",
    description: "Gupta, Maurya & More",
    count: "980+",
    image: coinAncientFront,
  },
  {
    id: "eic",
    name: "East India Co.",
    description: "Presidency Coinage",
    count: "1,540+",
    image: coinBritishFront,
  },
  {
    id: "modern",
    name: "Modern India",
    description: "Republic Era",
    count: "4,200+",
    image: coinMughalFront,
  },
];
