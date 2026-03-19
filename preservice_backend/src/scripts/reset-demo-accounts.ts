import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

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
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorTempSecret: { type: String, select: false },
    twoFactorEnabledAt: { type: Date },
  },
  { timestamps: true, collection: 'users' },
);

const serveurSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mot_passe: { type: String, required: true, select: false },
    years: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    status: { type: String, default: 'Disponible' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'serveurs' },
);

const refreshTokenSchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'refreshtokens' },
);
const blacklistedTokenSchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'blacklistedtokens' },
);
const adminAuditLogSchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'adminauditlogs' },
);

const User = mongoose.model('ResetUser', userSchema);
const Serveur = mongoose.model('ResetServeur', serveurSchema);
const RefreshToken = mongoose.model('ResetRefreshToken', refreshTokenSchema);
const BlacklistedToken = mongoose.model(
  'ResetBlacklistedToken',
  blacklistedTokenSchema,
);
const AdminAuditLog = mongoose.model(
  'ResetAdminAuditLog',
  adminAuditLogSchema,
);

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const passwordHash = await bcrypt.hash('Passw0rd!', 10);

  await Promise.all([
    User.deleteMany({}),
    Serveur.deleteMany({}),
    RefreshToken.deleteMany({}),
    BlacklistedToken.deleteMany({}),
    AdminAuditLog.deleteMany({}),
  ]);

  await User.create({
    nom: 'Farouk Admin Test',
    email: 'farouk.admin.test@nelagency.com',
    numero_tel: '+21620000001',
    adresse: 'Tunis',
    mot_passe: passwordHash,
    role: 'superadmin',
    isActive: true,
    twoFactorEnabled: false,
  });

  await Serveur.create({
    nom: 'Test',
    prenom: 'Farouk',
    phone: '+21620000002',
    email: 'farouk.user.test@nelagency.com',
    mot_passe: passwordHash,
    years: 1,
    skills: ['service de table'],
    status: 'Disponible',
    isActive: true,
  });

  console.log('Demo accounts reset complete');
  console.log('Admin:   farouk.admin.test@nelagency.com / Passw0rd!');
  console.log('Serveur: farouk.user.test@nelagency.com / Passw0rd!');

  await mongoose.disconnect();
}

run().catch((error) => {
  console.error('Reset demo accounts failed:', error);
  process.exit(1);
});
