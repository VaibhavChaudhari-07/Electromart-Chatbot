// server/utils/seedProducts.js
require("dotenv").config();
const { connectDB } = require("../config/db");
const Product = require("../models/Product");

const categories = {
  laptops: [
    "HP Pavilion 14",
    "Dell Inspiron 15",
    "Lenovo IdeaPad Slim 3",
    "Asus VivoBook 15",
    "Acer Aspire 7",
    "MSI Modern 14",
  ],
  smartphones: [
    "Samsung Galaxy M34",
    "Redmi Note 12 Pro",
    "iPhone 12",
    "OnePlus Nord CE 3",
    "Realme 11 Pro",
    "Vivo V29",
  ],
  watches: [
    "Apple Watch SE",
    "Boat Xtend Pro",
    "Noise ColorFit Ultra",
    "Amazfit Bip 3",
    "FireBoltt Ninja",
    "Samsung Galaxy Watch 4",
  ],
  tv: [
    "Samsung Crystal 4K",
    "Sony Bravia 43Inch",
    "LG Smart LED 43Inch",
    "Mi 4K Smart TV",
    "OnePlus TV Y1S",
    "TCL 4K TV",
  ],
  accessories: [
    "Boat Airdopes 141",
    "Sony WH-CH710",
    "Logitech MK270 Keyboard",
    "Sandisk 128GB Pendrive",
    "Zebronics Gaming Mouse",
    "JBL Go 3 Speaker",
  ],
};

// Random description & features generator
function randomDescription(title, category) {
  return `${title} is a high-quality ${category} designed for performance and durability. Perfect for daily use, work, entertainment, and productivity.`;
}

function randomFeatures() {
  const feats = [
    "Fast performance",
    "Long battery life",
    "High durability",
    "Premium design",
    "Lightweight",
    "Smart connectivity",
    "Affordable price range",
    "High-resolution display",
  ];
  return feats.sort(() => 0.5 - Math.random()).slice(0, 4);
}

function randomImages(title) {
  return [
    `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(title)}`,
  ];
}

function randomPrice(category) {
  const priceRanges = {
    laptops: [35000, 90000],
    smartphones: [9000, 60000],
    watches: [1500, 30000],
    tv: [12000, 120000],
    accessories: [500, 8000],
  };

  const [min, max] = priceRanges[category];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRating() {
  return (Math.random() * (5 - 3) + 3).toFixed(1); // between 3.0 and 5.0
}

async function seed() {
  try {
    console.log("⏳ Connecting to DB...");
    await connectDB();

    console.log("🗑 Clearing old products...");
    await Product.deleteMany({});

    const finalProducts = [];

    console.log("✨ Generating 100 products...");

    for (const category of Object.keys(categories)) {
      const names = categories[category];

      // Create around 16–20 products per category
      for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < 3; j++) {
          const title = `${names[i]} Variant ${j + 1}`;

          finalProducts.push({
            title,
            category,
            brand: names[i].split(" ")[0], // First word as brand
            description: randomDescription(title, category),
            features: randomFeatures(),
            images: randomImages(title),
            price: randomPrice(category),
            rating: randomRating(),
          });
        }
      }
    }

    console.log("📝 Inserting products...");
    await Product.insertMany(finalProducts);

    console.log(`✅ Successfully added ${finalProducts.length} products.`);
    console.log("🌟 All done! You can now run embedProducts.js to generate embeddings.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
