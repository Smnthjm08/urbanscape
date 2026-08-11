import "dotenv/config";
import bcrypt from "bcrypt";

import prisma from "../lib/prisma.js";

/**
 * Development seed data.
 *
 *   node prisma/seed.js
 *
 * Rerunnable: users are upserted by username, and their listings are wiped
 * and recreated so the data set stays predictable. It only touches records
 * owned by the seeded accounts.
 */

const PASSWORD = "password123";

const USERS = [
  { username: "smnthjm", email: "smnthjm@example.com", avatar: null },
  {
    username: "priya",
    email: "priya@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    username: "arjun",
    email: "arjun@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const img = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

/** owner = index into USERS */
const POSTS = [
  {
    owner: 0,
    title: "Sunlit 2BHK with balcony in Indiranagar",
    price: 4500000,
    address: "12 Vittal Mallya Road",
    city: "Bengaluru",
    bedroom: 2,
    bathroom: 2,
    latitude: "12.9716",
    longitude: "77.5946",
    type: "buy",
    property: "apartment",
    status: "active",
    isFeatured: true,
    images: [img("indiranagar1"), img("indiranagar2")],
    detail: {
      desc: "Corner unit with a wide balcony overlooking the park. Recently repainted, covered parking included.",
      utilities: "Included in maintenance",
      pet: "Allowed",
      income: "3x monthly rent",
      size: 1250,
      school: 400,
      bus: 150,
      restaurant: 80,
    },
  },
  {
    owner: 0,
    title: "Compact studio near Koramangala 5th Block",
    price: 22000,
    address: "80 Feet Road, Koramangala",
    city: "Bengaluru",
    bedroom: 1,
    bathroom: 1,
    latitude: "12.9352",
    longitude: "77.6245",
    type: "rent",
    property: "apartment",
    status: "active",
    isFeatured: false,
    images: [img("koramangala1")],
    detail: {
      desc: "Furnished studio a short walk from the startup district. Ideal for a single occupant.",
      utilities: "Tenant pays",
      pet: "Not allowed",
      income: null,
      size: 480,
      school: 900,
      bus: 120,
      restaurant: 50,
    },
  },
  {
    owner: 1,
    title: "Four bedroom villa with garden in Whitefield",
    price: 18500000,
    address: "Palm Meadows, Whitefield",
    city: "Bengaluru",
    bedroom: 4,
    bathroom: 4,
    latitude: "12.9698",
    longitude: "77.7500",
    type: "buy",
    property: "house",
    status: "active",
    isFeatured: true,
    images: [img("whitefield1"), img("whitefield2"), img("whitefield3")],
    detail: {
      desc: "Gated community villa with a private garden, solar water heating, and a double garage.",
      utilities: "Tenant pays",
      pet: "Allowed",
      income: null,
      size: 3400,
      school: 600,
      bus: 800,
      restaurant: 450,
    },
  },
  {
    owner: 1,
    title: "Sea-facing 3BHK in Bandra West",
    price: 145000,
    address: "Carter Road, Bandra West",
    city: "Mumbai",
    bedroom: 3,
    bathroom: 3,
    latitude: "19.0596",
    longitude: "72.8295",
    type: "rent",
    property: "condo",
    status: "active",
    isFeatured: true,
    images: [img("bandra1"), img("bandra2")],
    detail: {
      desc: "High floor with uninterrupted sea views. Building has a gym, pool, and 24x7 security.",
      utilities: "Included",
      pet: "Allowed",
      income: "4x monthly rent",
      size: 1850,
      school: 300,
      bus: 200,
      restaurant: 60,
    },
  },
  {
    owner: 2,
    title: "Quiet 2BHK near Hauz Khas metro",
    price: 55000,
    address: "Aurobindo Marg, Hauz Khas",
    city: "Delhi",
    bedroom: 2,
    bathroom: 2,
    latitude: "28.5494",
    longitude: "77.2001",
    type: "rent",
    property: "apartment",
    status: "active",
    isFeatured: false,
    images: [img("hauzkhas1")],
    detail: {
      desc: "Second floor of a quiet residential block, two minutes from the metro entrance.",
      utilities: "Tenant pays",
      pet: "Not allowed",
      income: null,
      size: 1100,
      school: 500,
      bus: 100,
      restaurant: 200,
    },
  },
  {
    owner: 2,
    title: "Residential plot in Sarjapur",
    price: 9500000,
    address: "Sarjapur Main Road",
    city: "Bengaluru",
    bedroom: 0,
    bathroom: 0,
    latitude: "12.8600",
    longitude: "77.7860",
    type: "buy",
    property: "land",
    status: "active",
    isFeatured: false,
    images: [img("sarjapur1")],
    detail: {
      desc: "East-facing corner plot, clear title, approved layout with water and power connections at the boundary.",
      utilities: null,
      pet: null,
      income: null,
      size: 2400,
      school: 1500,
      bus: 700,
      restaurant: 1200,
    },
  },
  {
    owner: 0,
    title: "Renovated 3BHK in Jayanagar",
    price: 7200000,
    address: "11th Main, Jayanagar 4th Block",
    city: "Bengaluru",
    bedroom: 3,
    bathroom: 2,
    latitude: "12.9250",
    longitude: "77.5938",
    type: "buy",
    property: "apartment",
    status: "active",
    isFeatured: false,
    images: [img("jayanagar1"), img("jayanagar2")],
    detail: {
      desc: "Fully renovated in 2025 with new wiring, modular kitchen, and vitrified flooring throughout.",
      utilities: "Included in maintenance",
      pet: "Allowed",
      income: null,
      size: 1600,
      school: 250,
      bus: 300,
      restaurant: 150,
    },
  },
  {
    owner: 1,
    title: "Penthouse in Powai (sold)",
    price: 32000000,
    address: "Hiranandani Gardens, Powai",
    city: "Mumbai",
    bedroom: 5,
    bathroom: 5,
    latitude: "19.1197",
    longitude: "72.9050",
    type: "buy",
    property: "condo",
    // Non-active on purpose: public listing results must exclude this.
    status: "sold",
    isFeatured: false,
    images: [img("powai1")],
    detail: {
      desc: "Duplex penthouse with a private terrace. Sale completed, kept for reference.",
      utilities: "Included",
      pet: "Allowed",
      income: null,
      size: 4800,
      school: 400,
      bus: 350,
      restaurant: 120,
    },
  },
  {
    owner: 2,
    title: "1BHK in Andheri East (rented)",
    price: 38000,
    address: "Chakala, Andheri East",
    city: "Mumbai",
    bedroom: 1,
    bathroom: 1,
    latitude: "19.1136",
    longitude: "72.8697",
    type: "rent",
    property: "apartment",
    // Non-active on purpose.
    status: "rented",
    isFeatured: false,
    images: [img("andheri1")],
    detail: {
      desc: "Currently occupied. Listing retained to track the tenancy.",
      utilities: "Tenant pays",
      pet: "Not allowed",
      income: null,
      size: 620,
      school: 800,
      bus: 90,
      restaurant: 110,
    },
  },
];

async function main() {
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const users = [];
  for (const user of USERS) {
    users.push(
      await prisma.user.upsert({
        where: { username: user.username },
        update: { email: user.email, avatar: user.avatar },
        create: { ...user, password: hashed },
      }),
    );
  }
  console.log(`users ready: ${users.map((u) => u.username).join(", ")}`);

  // Wipe only what this script owns, so reruns stay predictable.
  const ownerIds = users.map((u) => u.id);
  const removed = await prisma.post.deleteMany({
    where: { userId: { in: ownerIds } },
  });
  if (removed.count) console.log(`removed ${removed.count} existing listings`);

  const created = [];
  for (const { owner, detail, ...post } of POSTS) {
    created.push(
      await prisma.post.create({
        data: {
          ...post,
          userId: users[owner].id,
          postDetail: { create: detail },
        },
      }),
    );
  }
  console.log(`created ${created.length} listings`);

  // A couple of saved posts so the profile and isSaved flag have data.
  const saves = [
    { userId: users[0].id, postId: created[3].id },
    { userId: users[0].id, postId: created[4].id },
    { userId: users[1].id, postId: created[0].id },
  ];

  for (const save of saves) {
    await prisma.savedPost.upsert({
      where: { userId_postId: save },
      update: {},
      create: save,
    });
  }
  console.log(`saved posts: ${saves.length}`);

  const active = created.filter((p) => p.status === "active").length;
  console.log(
    `\ndone — ${active} active, ${created.length - active} non-active (excluded from public listings)`,
  );
  console.log(`sign in with any username above / password: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error("seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
