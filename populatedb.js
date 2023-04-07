#! /usr/bin/env node

console.log(
  'This script populates some test categories and items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");

const items = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function categoryCreate(name, description) {
  const category = new Category({ name: name, description: description });
  await category.save();
  categories.push(category);
  console.log(`Added category: ${name} ${description}`);
}

async function itemCreate(name, description, category, price, numberInStock, properties) {
  itemdetail = { name: name, description: description, category: category, price: price, numberInStock: numberInStock, properties: properties };

  const item = new Item(itemdetail);

  await item.save();
  items.push(item);
  console.log(`Added item: ${name} ${description} ${category} ${price} ${numberInStock} ${properties}`);
}


async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate("Weapons", "Weapons are a type of equipment. Weapons are prevalent and varied throughout Night City, ranging from firearms to melee and cyberweapons."),
    categoryCreate("Clothing", "Clothing is a type of equipment. Every piece of equipped gear increases armor and other stats, while also representing an Edgerunner's style."),
    categoryCreate("Cyberware", "Cyberware is any cybernetic technology permanently installed into the body, especially technology that interfaces with the central nervous system. All Cyberware is artificial."),
  ]);
}

async function createItems() {
  console.log("Adding items");
  await Promise.all([
    itemCreate("Katana", "The Katana is a Bladed Melee Weapon manufactured by Arasaka.", categories[0], 2000, 4, { attacksPerSecond: 2.34, weight: 4.5 }),
    itemCreate("Skippy", "Skippy is an Iconic variant of the Arasaka HJKE-11 Yukimura.", categories[0], 50000, 1, { attacksPerSecond: 4.55, clipSize: 30, weight: 4.3 }),
    itemCreate("Militech M251s Ajax", "The M251s Ajax is a Power Assault Rifle manufactured by Militech.", categories[0], 2700, 58, { attacksPerSecond: 4.89, clipSize: 30, weight: 7.2 }),
    itemCreate("Johnny Silverand's Aviators", "Johnny Silverhand's Aviators is an Iconic piece of Face equipment.", categories[1], 99999.99, 1, { style: 'KITSCH', weight: 0.1, bonus: 'Very Cool' }),
    itemCreate("Blue Mirror dual-shield crystaljock bomber", "Blue Mirror dual-shield crystaljock bomber is a piece of Outer Torso equipment.", categories[1], 6000, 1, { style: 'NEOKITSCH', weight: 3.0 }),
    itemCreate("QianT Sandevistan Mk.4", "The QianT Sandevistan Mk.4 is an Operating System Cyberware implant manufactured by QianT.", categories[2], 28000, 15, { minReflex: 15, effect: 'Slows time to 25% for 12 sec. Cooldown 15 sec.' }),
    itemCreate("Mantis Blades", "The Mantis Blades are a pair of Arms Cyberware in the Daikon Nt series manufactured by Arasaka.", categories[2], 12850, 28, { effect: 'Mantis Blades allow you to slice and dice your enemies with swift, deadly slashes.' }),
  ]);
}