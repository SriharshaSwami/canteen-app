import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import User from "../models/userModel.js";
import Menu from "../models/menuModel.js";

const seedAll = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // ==================== SEED USERS ====================
    console.log("\n--- Seeding Users ---");
    const users = [
      {
        name: "Canteen Admin",
        email: "admin@canteen.com",
        password: "admin123",
        role: "admin",
        creditBalance: 1000
      },
      {
        name: "Test User",
        email: "user@canteen.com",
        password: "user123",
        role: "user",
        creditBalance: 500
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists - skipping`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`Created ${userData.role}: ${userData.email}`);
    }

    // ==================== SEED MENU ITEMS ====================
    console.log("\n--- Seeding Menu Items ---");
    const menuItems = [
      // Breakfast
      {
        mealName: "Idli Sambar",
        description: "Soft steamed rice cakes served with lentil sambar and coconut chutney",
        price: 40,
        category: "breakfast",
        available: true,
        stock: 50,
        dailyLimit: 50
      },
      {
        mealName: "Masala Dosa",
        description: "Crispy rice crepe filled with spiced potato masala",
        price: 60,
        category: "breakfast",
        available: true,
        stock: 40,
        dailyLimit: 40
      },
      {
        mealName: "Poha",
        description: "Flattened rice with peanuts, onions, and spices",
        price: 35,
        category: "breakfast",
        available: true,
        stock: 30,
        dailyLimit: 30
      },
      {
        mealName: "Upma",
        description: "Savory semolina porridge with vegetables",
        price: 35,
        category: "breakfast",
        available: true,
        stock: 30,
        dailyLimit: 30
      },

      // Lunch
      {
        mealName: "Chicken Biryani",
        description: "Classic Hyderabadi Dum biryani with tender chicken",
        price: 120,
        category: "lunch",
        available: true,
        stock: 100,
        dailyLimit: 100
      },
      {
        mealName: "Veg Thali",
        description: "Complete meal with dal, sabzi, roti, rice, and salad",
        price: 80,
        category: "lunch",
        available: true,
        stock: 60,
        dailyLimit: 60
      },
      {
        mealName: "Paneer Butter Masala",
        description: "Cottage cheese cubes in rich tomato gravy with rice",
        price: 100,
        category: "lunch",
        available: true,
        stock: 40,
        dailyLimit: 40
      },
      {
        mealName: "Chole Bhature",
        description: "Spiced chickpea curry with fluffy fried bread",
        price: 70,
        category: "lunch",
        available: true,
        stock: 50,
        dailyLimit: 50
      },

      // Dinner
      {
        mealName: "Butter Chicken",
        description: "Tender chicken in creamy tomato-based curry with naan",
        price: 150,
        category: "dinner",
        available: true,
        stock: 40,
        dailyLimit: 40
      },
      {
        mealName: "Dal Makhani",
        description: "Creamy black lentils slow-cooked with butter and cream",
        price: 90,
        category: "dinner",
        available: true,
        stock: 50,
        dailyLimit: 50
      },
      {
        mealName: "Veg Pulao",
        description: "Fragrant rice cooked with mixed vegetables and spices",
        price: 70,
        category: "dinner",
        available: true,
        stock: 45,
        dailyLimit: 45
      },

      // Snacks
      {
        mealName: "Samosa",
        description: "Crispy pastry filled with spiced potatoes and peas",
        price: 20,
        category: "snacks",
        available: true,
        stock: 100,
        dailyLimit: 100
      },
      {
        mealName: "Vada Pav",
        description: "Mumbai style spiced potato fritter in a bun",
        price: 25,
        category: "snacks",
        available: true,
        stock: 80,
        dailyLimit: 80
      },
      {
        mealName: "Pav Bhaji",
        description: "Spiced vegetable mash served with buttered bread rolls",
        price: 50,
        category: "snacks",
        available: true,
        stock: 40,
        dailyLimit: 40
      },
      {
        mealName: "Tea/Coffee",
        description: "Hot beverage of your choice",
        price: 15,
        category: "snacks",
        available: true,
        stock: 200,
        dailyLimit: 200
      },
      {
        mealName: "Cold Drink",
        description: "Chilled soft drink",
        price: 30,
        category: "snacks",
        available: true,
        stock: 100,
        dailyLimit: 100
      }
    ];

    for (const menuData of menuItems) {
      const existingMenu = await Menu.findOne({ mealName: menuData.mealName });
      if (existingMenu) {
        console.log(`Menu item "${menuData.mealName}" already exists - skipping`);
        continue;
      }

      await Menu.create(menuData);
      console.log(`Created menu item: ${menuData.mealName} (${menuData.category})`);
    }

    console.log("\n=== Seeding Complete ===");
    console.log("Collections created: users, menus");
    console.log("\nLogin credentials:");
    console.log("  Admin: admin@canteen.com / admin123");
    console.log("  User:  user@canteen.com / user123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedAll();
