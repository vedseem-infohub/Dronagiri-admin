// Mock data for Dronagiri Farm Admin Panel

export const CATEGORIES = [
  "Spices",
  "Millets",
  "Pulses",
  "Rice",
  "Wheat & Grains",
  "Oils & Ghee",
  "Sweeteners",
  "Nuts & Seeds",
];

export const PRODUCTS = [
  {
    id: 1,
    name: "Haldi Powder",
    nameHindi: "हल्दी पाउडर",
    category: "Spices",
    description: "Pure turmeric powder with rich curcumin content. Anti-inflammatory & immunity boosting.",
    variants: [
      { size: "500g", price: 450 },
      { size: "200g", price: 200 },
      { size: "100g", price: 110 },
    ],
    stock: 42,
    active: true,
    sold: 128,
    image: "🌿",
  },
  {
    id: 2,
    name: "Ragi",
    nameHindi: "रागी",
    category: "Millets",
    description: "Finger millet rich in calcium, fiber, and iron. Great for bone health.",
    variants: [
      { size: "1kg", price: 250 },
      { size: "500g", price: 140 },
    ],
    stock: 60,
    active: true,
    sold: 95,
    image: "🌾",
  },
  {
    id: 3,
    name: "Lobia",
    nameHindi: "लोबिया",
    category: "Pulses",
    description: "Black-eyed peas packed with protein and fiber. Farm-fresh quality.",
    variants: [
      { size: "1kg", price: 235 },
      { size: "500g", price: 125 },
    ],
    stock: 8,
    active: true,
    sold: 74,
    image: "🫘",
  },
  {
    id: 4,
    name: "Shengdana",
    nameHindi: "शेंगदाणा",
    category: "Nuts & Seeds",
    description: "Fresh groundnuts high in protein and healthy fats. Great for snacking.",
    variants: [
      { size: "1kg", price: 305 },
      { size: "500g", price: 160 },
    ],
    stock: 30,
    active: true,
    sold: 110,
    image: "🥜",
  },
  {
    id: 5,
    name: "Basmati Rice",
    nameHindi: "बासमती चावल",
    category: "Rice",
    description: "Long-grain aromatic basmati rice directly from our fields.",
    variants: [
      { size: "5kg", price: 850 },
      { size: "2kg", price: 360 },
      { size: "1kg", price: 190 },
    ],
    stock: 55,
    active: true,
    sold: 200,
    image: "🍚",
  },
  {
    id: 6,
    name: "Khapli Wheat",
    nameHindi: "खापली गहू",
    category: "Wheat & Grains",
    description: "Ancient emmer wheat variety, low gluten, easy to digest.",
    variants: [
      { size: "5kg", price: 650 },
      { size: "2kg", price: 280 },
    ],
    stock: 40,
    active: true,
    sold: 88,
    image: "🌾",
  },
  {
    id: 7,
    name: "A2 Desi Ghee",
    nameHindi: "A2 देसी घी",
    category: "Oils & Ghee",
    description: "Pure A2 cow ghee made using the traditional Bilona method.",
    variants: [
      { size: "500ml", price: 900 },
      { size: "250ml", price: 475 },
    ],
    stock: 5,
    active: true,
    sold: 165,
    image: "🧈",
  },
  {
    id: 8,
    name: "Jaggery Powder",
    nameHindi: "गुळाची पूड",
    category: "Sweeteners",
    description: "Unrefined cane sugar with natural minerals intact.",
    variants: [
      { size: "1kg", price: 180 },
      { size: "500g", price: 100 },
    ],
    stock: 70,
    active: true,
    sold: 145,
    image: "🍯",
  },
  {
    id: 9,
    name: "Jowar",
    nameHindi: "ज्वार",
    category: "Millets",
    description: "Sorghum grain — gluten-free, high fiber, and very nutritious.",
    variants: [
      { size: "1kg", price: 120 },
      { size: "500g", price: 65 },
    ],
    stock: 3,
    active: true,
    sold: 56,
    image: "🌾",
  },
  {
    id: 10,
    name: "Groundnut Oil",
    nameHindi: "शेंगदाणा तेल",
    category: "Oils & Ghee",
    description: "Cold-pressed groundnut oil — rich flavour, high smoke point.",
    variants: [
      { size: "1L", price: 320 },
      { size: "500ml", price: 175 },
    ],
    stock: 20,
    active: false,
    sold: 48,
    image: "🫒",
  },
  {
    id: 11,
    name: "Red Chilli Powder",
    nameHindi: "लाल मिर्च पाउडर",
    category: "Spices",
    description: "Sun-dried red chillies ground fresh. Vibrant colour and bold heat.",
    variants: [
      { size: "500g", price: 280 },
      { size: "200g", price: 120 },
    ],
    stock: 35,
    active: true,
    sold: 92,
    image: "🌶️",
  },
  {
    id: 12,
    name: "Tur Dal",
    nameHindi: "तुर डाळ",
    category: "Pulses",
    description: "Split pigeon peas, essential for classic Indian dal dishes.",
    variants: [
      { size: "1kg", price: 185 },
      { size: "500g", price: 100 },
    ],
    stock: 50,
    active: true,
    sold: 180,
    image: "🫘",
  },
];

export const CUSTOMERS = [
  { id: 1, name: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43210", orders: 8, totalSpent: 4200, joined: "2025-11-10", city: "Pune" },
  { id: 2, name: "Rahul Patil", email: "rahul@example.com", phone: "+91 87654 32109", orders: 12, totalSpent: 7800, joined: "2025-10-05", city: "Mumbai" },
  { id: 3, name: "Sunita Desai", email: "sunita@example.com", phone: "+91 76543 21098", orders: 4, totalSpent: 1900, joined: "2025-12-20", city: "Nashik" },
  { id: 4, name: "Amit Kulkarni", email: "amit@example.com", phone: "+91 65432 10987", orders: 20, totalSpent: 15600, joined: "2025-09-15", city: "Aurangabad" },
  { id: 5, name: "Meera Joshi", email: "meera@example.com", phone: "+91 54321 09876", orders: 3, totalSpent: 1200, joined: "2026-01-03", city: "Nagpur" },
  { id: 6, name: "Vikas Nair", email: "vikas@example.com", phone: "+91 43210 98765", orders: 7, totalSpent: 5400, joined: "2025-11-28", city: "Bengaluru" },
  { id: 7, name: "Kavita Rao", email: "kavita@example.com", phone: "+91 32109 87654", orders: 15, totalSpent: 11200, joined: "2025-08-01", city: "Hyderabad" },
  { id: 8, name: "Sanjay Mehta", email: "sanjay@example.com", phone: "+91 21098 76543", orders: 2, totalSpent: 680, joined: "2026-02-14", city: "Delhi" },
];

const statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export const ORDERS = [
  { id: "ORD-1001", customer: "Priya Sharma", phone: "+91 98765 43210", items: [{ name: "Haldi Powder", variant: "500g", qty: 2, price: 450 }, { name: "A2 Desi Ghee", variant: "500ml", qty: 1, price: 900 }], total: 1800, status: "Delivered", date: "2026-05-28", address: "12 MG Road, Pune - 411001", payment: "UPI" },
  { id: "ORD-1002", customer: "Rahul Patil", phone: "+91 87654 32109", items: [{ name: "Basmati Rice", variant: "5kg", qty: 1, price: 850 }], total: 850, status: "Shipped", date: "2026-05-30", address: "5 Bandra West, Mumbai - 400050", payment: "COD" },
  { id: "ORD-1003", customer: "Amit Kulkarni", phone: "+91 65432 10987", items: [{ name: "A2 Desi Ghee", variant: "500ml", qty: 2, price: 900 }, { name: "Jaggery Powder", variant: "1kg", qty: 2, price: 180 }], total: 2160, status: "Confirmed", date: "2026-05-31", address: "8 Jalgaon Rd, Aurangabad - 431001", payment: "UPI" },
  { id: "ORD-1004", customer: "Meera Joshi", phone: "+91 54321 09876", items: [{ name: "Tur Dal", variant: "1kg", qty: 3, price: 185 }], total: 555, status: "Pending", date: "2026-06-01", address: "3 Civil Lines, Nagpur - 440001", payment: "COD" },
  { id: "ORD-1005", customer: "Kavita Rao", phone: "+91 32109 87654", items: [{ name: "Khapli Wheat", variant: "5kg", qty: 1, price: 650 }, { name: "Ragi", variant: "1kg", qty: 2, price: 250 }], total: 1150, status: "Delivered", date: "2026-05-25", address: "22 Jubilee Hills, Hyderabad - 500033", payment: "UPI" },
  { id: "ORD-1006", customer: "Vikas Nair", phone: "+91 43210 98765", items: [{ name: "Red Chilli Powder", variant: "500g", qty: 1, price: 280 }, { name: "Shengdana", variant: "1kg", qty: 1, price: 305 }], total: 585, status: "Cancelled", date: "2026-05-29", address: "15 Koramangala, Bengaluru - 560034", payment: "UPI" },
  { id: "ORD-1007", customer: "Sunita Desai", phone: "+91 76543 21098", items: [{ name: "Jaggery Powder", variant: "1kg", qty: 1, price: 180 }, { name: "Groundnut Oil", variant: "1L", qty: 1, price: 320 }], total: 500, status: "Shipped", date: "2026-05-31", address: "7 Gangapur Rd, Nashik - 422005", payment: "COD" },
  { id: "ORD-1008", customer: "Sanjay Mehta", phone: "+91 21098 76543", items: [{ name: "Basmati Rice", variant: "2kg", qty: 2, price: 360 }], total: 720, status: "Pending", date: "2026-06-01", address: "10 Connaught Place, Delhi - 110001", payment: "UPI" },
  { id: "ORD-1009", customer: "Priya Sharma", phone: "+91 98765 43210", items: [{ name: "Lobia", variant: "1kg", qty: 2, price: 235 }], total: 470, status: "Delivered", date: "2026-05-20", address: "12 MG Road, Pune - 411001", payment: "UPI" },
  { id: "ORD-1010", customer: "Rahul Patil", phone: "+91 87654 32109", items: [{ name: "Jowar", variant: "1kg", qty: 3, price: 120 }, { name: "Ragi", variant: "500g", qty: 2, price: 140 }], total: 640, status: "Delivered", date: "2026-05-22", address: "5 Bandra West, Mumbai - 400050", payment: "COD" },
];

// Sales data — last 7 days
export const DAILY_SALES = [
  { label: "Mon", revenue: 3200, orders: 6 },
  { label: "Tue", revenue: 4800, orders: 9 },
  { label: "Wed", revenue: 2900, orders: 5 },
  { label: "Thu", revenue: 6100, orders: 12 },
  { label: "Fri", revenue: 5400, orders: 10 },
  { label: "Sat", revenue: 8700, orders: 17 },
  { label: "Sun", revenue: 7200, orders: 14 },
];

// Monthly
export const MONTHLY_SALES = [
  { label: "Jan", revenue: 62000, orders: 120 },
  { label: "Feb", revenue: 71000, orders: 138 },
  { label: "Mar", revenue: 85000, orders: 165 },
  { label: "Apr", revenue: 78000, orders: 152 },
  { label: "May", revenue: 95000, orders: 185 },
  { label: "Jun", revenue: 38400, orders: 73 },
];

// Category revenue split
export const CATEGORY_SALES = [
  { category: "Oils & Ghee",     revenue: 52000, pct: 28 },
  { category: "Rice",            revenue: 38000, pct: 20 },
  { category: "Spices",          revenue: 28000, pct: 15 },
  { category: "Pulses",          revenue: 22000, pct: 12 },
  { category: "Wheat & Grains",  revenue: 18000, pct: 10 },
  { category: "Millets",         revenue: 14000, pct: 7  },
  { category: "Sweeteners",      revenue: 10000, pct: 5  },
  { category: "Nuts & Seeds",    revenue: 5800,  pct: 3  },
];
