import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

// Définition minimaliste pour le seed (évite les imports relatifs)
const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    numero_tel: { type: String, required: true, trim: true },
    adresse: { type: String, trim: true },
    mot_passe: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

async function run() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri!);
  console.log('✅ Connected to Mongo');

  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('Passw0rd!', salt);

  const docs = [
    {
      nom: 'Ali Ben Salem',
      email: 'ali.bensalem@example.com',
      numero_tel: '+21620000001',
      adresse: 'Tunis',
      mot_passe: pwd,
      role: 'superadmin',
    },
    {
      nom: 'Ines Trabelsi',
      email: 'ines.trabelsi@example.com',
      numero_tel: '+21620000002',
      adresse: 'Sfax',
      mot_passe: pwd,
      role: 'admin',
    },
    {
      nom: 'Karim Gharbi',
      email: 'karim.gharbi@example.com',
      numero_tel: '+21620000003',
      adresse: 'Sousse',
      mot_passe: pwd,
      role: 'admin',
    },
    {
      nom: 'Syrine Ben Ali',
      email: 'syrine.benali@example.com',
      numero_tel: '+21620000004',
      adresse: 'Nabeul',
      mot_passe: pwd,
      role: 'user',
    },
    {
      nom: 'Omar Haddad',
      email: 'omar.haddad@example.com',
      numero_tel: '+21620000005',
      adresse: 'Monastir',
      mot_passe: pwd,
      role: 'user',
    },
  ];

  // upsert par email
  for (const d of docs) {
    await User.updateOne({ email: d.email }, { $set: d }, { upsert: true });
  }

  const count = await User.countDocuments({
    email: { $in: docs.map((d) => d.email) },
  });
  console.log(`✅ Seed users done (${count})`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
