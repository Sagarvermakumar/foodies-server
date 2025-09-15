import { faker } from "@faker-js/faker";
import Address from "../Models/Address.model.js";
import Category from "../models/Category.model.js";
import { default as Item, default as MenuItem } from "../Models/Item.model.js";
import Order from "../Models/Order.model.js";
import Outlet from "../Models/Outlet.model.js";
import User from "../Models/User.model.js";

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const lastMonth = currentMonth === 0 ? 11 : currentMonth + 4;
const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

const fromDate = new Date(lastMonthYear, lastMonth, 1);
const toDate = new Date(lastMonthYear, lastMonth + 1, 0);

// ✅ Correct usage with from & to
const createdAt = faker.date.between({ from: fromDate, to: toDate });

const getFakeUserData = () => {
  return {
    avatar: {
      public_id: faker.image.avatar(),
      url: faker.image.url({ width: "120px", height: "120px" }),
    },
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: "password123", // Will be hashed by pre-save hook
    phone: faker.helpers.fromRegExp("+91[6-9][0-9]{9}"),
    referralCode: faker.string.alphanumeric(8),
    referredBy: faker.helpers.maybe(() => faker.string.alphanumeric(8), {
      probability: 0.3,
    }),
    walletBalance: faker.finance.amount(0, 500, 0),
    role: faker.helpers.arrayElement([
      "SUPER_ADMIN",
      "MANAGER",
      "STAFF",
      "DELIVERY",
      "CUSTOMER",
    ]),
    status: faker.helpers.arrayElement(["active", "blocked"]),
    isVerified: faker.datatype.boolean(),
    createdAt,
  };
};

export const saveInDbFakeUsers = async (count = 5) => {
  try {
    const users = [];

    for (let i = 0; i < count; i++) {
      const fakeUser = new User(getFakeUserData());
      await fakeUser.save(); // Save to hash password and generate timestamps
      users.push(fakeUser);
    }

    console.log(`✅ Seeded ${users.length} users`);
    process.exit();
  } catch (err) {
    console.error("❌ Failed to seed users:", err);
    process.exit(1);
  }
};

export const generateRandomOrderData = async (count = 8) => {
  const users = await User.find({});
  const menuItems = await MenuItem.find({});

  if (!users.length || !menuItems.length) {
    console.log("Add some users and menu items before seeding orders.");
    return;
  }

  let fakeOrders = [];

  for (let i = 0; i < count; i++) {
    //  Select a random user
    const user = faker.helpers.arrayElement(users);

    //  Check if user has at least one address
    const address = await Address.findOne({ user: user._id });
    if (!address) {
      console.log(`⛔ Skipping user ${user.name} (No address found)`);
      continue;
    }

    // Create fake order for this user
    const fakeOrder = new Order({
      userID: user._id,
      items: Array.from({
        length: faker.helpers.rangeToNumber({ min: 1, max: 3 }),
      }).map(() => ({
        item: faker.helpers.arrayElement(menuItems)._id,
        quantity: faker.helpers.rangeToNumber({ min: 1, max: 3 }),
      })),
      totalPrice: faker.finance.amount(100, 1000, 2),

      referralDiscountApplied: faker.datatype.boolean(),
      paymentMethod: faker.helpers.arrayElement(["COD", "Online"]),
      status: faker.helpers.arrayElement([
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ]),
      deliveryTime: faker.date.soon({ days: 1 }),
      walletUsed: 15,
      cancelledAt: faker.date.recent({ days: 1 }),
      deliveredAt: faker.date.future({ days: 1 }),
      deliveryAddressID: address._id,
      createdAt,
    });

    fakeOrders.push(fakeOrder);
  }

  // Insert all valid fake orders
  if (fakeOrders.length) {
    await Order.insertMany(fakeOrders);
    console.log(`${fakeOrders.length} fake orders created ✅`);
  } else {
    console.log("No valid users with addresses found ❌");
  }
};

export const generateMenuItems = async (count = 5) => {
  try {

    const category = await Category.find({}).select("_id");
    const outletID = await Outlet.find({}).select("_id");
    console.log("category: ", category)
    console.log("outletID : ", outletID)
    for (let i = 0; i < count; i++) {

      const menuItem = new Item({
        name: faker.food.dish(),
        category: faker.helpers.arrayElement(category),
        createdBy: "689d3f5a0e91c6f107fa5279",
        slug: faker.helpers.slugify(faker.lorem.word()),
        description: faker.food.description(),
        image: faker.image.urlLoremFlickr({ category: "food" }),
        price: faker.number.float({ min: 50, max: 500, precision: 1 }),
        // variations:[],
        // addons:[],
        discount: faker.number.int(100) ,
        isVegetarian: faker.datatype.boolean(),
        isAvailable: faker.datatype.boolean(),
        outlet:faker.helpers.arrayElement(outletID),
        
        createdAt,
      });
      console.log("ITEMS : ", menuItem)

      await menuItem.save();
      console.log(`🍽️ Menu item added `);
    }

    console.log("✅ Menu items seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ MenuItem seeding error:", err.message);
    process.exit(1);
  }
};

const getFakeAddressData = (id, lat, long) => ({
  user: id,

  label: faker.helpers.arrayElement(["Home", "Work", "Other"]),
  addressLine: faker.location.streetAddress(),
  coordinates: [lat, long],
  isDefaultAddress: faker.datatype.boolean(),
});
// set address of all users
export const setRandomGeneratedAddressInEachUser = async () => {
  const userIds = await User.find({}).select("_id");
  let lat = faker.location.latitude();
  let long = faker.location.longitude();
  for (let i = 0; i < userIds.length; i++) {
    const address = getFakeAddressData(userIds[i]._id, lat, long);

    await Address.create(address);

    console.log("Address Created");
  }
};







//clear database
export const clearDb = async () => {
  await User.deleteMany();
  console.log("user Cleared");

  await Address.deleteMany();
  console.log("Address Cleared");

  await MenuItem.deleteMany();
  console.log("Menu Cleared");

  await Order.deleteMany();
  console.log("Order Cleared");
};


export const createCategorySeed = async (count = 15) => {
  try {
    // await MenuItem.deleteMany(); // Optional: clean slate

    for (let i = 0; i < count; i++) {

      const cat = new Category({
        name: faker.food.dish(),
        createdBy: "689d3f5a0e91c6f107fa5279",
        description: faker.food.description(),
        image:{
          public_id: faker.helpers.replaceCreditCardSymbols(),
          url:faker.image.urlLoremFlickr({ category: "food" }),
        },
        createdAt,
      });
      console.log("ITEMS : ", cat)

      await cat.save();
      console.log(`Category Added `);
    }

    console.log("✅ Category seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ MenuItem seeding error:", err.message);
    process.exit(1);
  }
};