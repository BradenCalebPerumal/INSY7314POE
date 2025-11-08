// src/scripts/seedstaff.js
import 'dotenv/config';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { User } from '../models/User.js';
import { encryptString } from '../crypto/encryptAtRest.js';

// helper: argon2 hash with secure defaults
const mkHash = (s) =>
  argon2.hash(s, {
    type: argon2.argon2id,
    timeCost: 2,
    memoryCost: 19456,
    parallelism: 1,
  });

// helper: append pepper if available
const withPepper = (s) => `${s}${process.env.PWD_PEPPER || ''}`;

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is missing');
    process.exit(1);
  }

  console.log('⏳ Connecting to MongoDB…');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ Connected. readyState =', mongoose.connection.readyState);

  const staff = [
    {
      username: 'staff.jane',
      fullName: 'Jane Staff',
      idNumber: '9001010000001',
      accountNumber: '00000000000000',
      role: 'staff',
      pwd: process.env.SEED_STAFF1_PWD,
      pin: process.env.SEED_STAFF1_PIN,
    },
    {
      username: 'admin.root',
      fullName: 'Root Admin',
      idNumber: '8001010000002',
      accountNumber: '00000000000000',
      role: 'admin',
      pwd: process.env.SEED_ADMIN_PWD,
      pin: process.env.SEED_ADMIN_PIN,
    },
    {
      username: 'caleb.perumal',
      fullName: 'Caleb Perumal',
      idNumber: '0000000000003',
      accountNumber: '00000000000000',
      role: 'staff',
      pwd: 'ChangeMe!', // or set SEED_CALED_PWD in .env for safety
      pin: '7777',
    },
  ];

  let created = 0, updated = 0, skipped = 0;

  for (const u of staff) {
    if (!u.pwd) {
      console.warn(`↷ Skipping ${u.username}: missing password`);
      skipped++;
      continue;
    }

    const passwordHash = await mkHash(withPepper(u.pwd));
    const approvalPinHash = u.pin ? await mkHash(withPepper(u.pin)) : null;
    const accountNumberEnc = encryptString(u.accountNumber);

    const res = await User.updateOne(
      { username: u.username },
      {
        $setOnInsert: {
          username: u.username,
          fullName: u.fullName,
          idNumber: u.idNumber,
          role: u.role,
          accountNumberEnc,
        },
        $set: { passwordHash, approvalPinHash },
      },
      { upsert: true }
    );

    if (res.upsertedCount === 1) {
      console.log(`➕ Created ${u.username}`);
      created++;
    } else if (res.matchedCount === 1 && res.modifiedCount >= 1) {
      console.log(`✎ Updated ${u.username}`);
      updated++;
    } else {
      console.log(`✓ No changes ${u.username}`);
      skipped++;
    }
  }

  console.log(`\n📊 Seed summary → created: ${created}, updated: ${updated}, no-change: ${skipped}`);
  await mongoose.disconnect();
  console.log('🔌 Disconnected. Done.');
}

main().catch((err) => {
  console.error('💥 Seed failed:', err);
  process.exit(1);
});
