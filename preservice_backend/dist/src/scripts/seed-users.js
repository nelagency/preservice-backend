"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    numero_tel: { type: String, required: true, trim: true },
    adresse: { type: String, trim: true },
    mot_passe: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
}, { timestamps: true });
const User = mongoose_1.default.model('User', userSchema);
async function run() {
    const uri = process.env.MONGO_URI;
    await mongoose_1.default.connect(uri);
    console.log('✅ Connected to Mongo');
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash('Passw0rd!', salt);
    const docs = [
        { nom: 'Ali Ben Salem', email: 'ali.bensalem@example.com', numero_tel: '+21620000001', adresse: 'Tunis', mot_passe: pwd, role: 'superadmin' },
        { nom: 'Ines Trabelsi', email: 'ines.trabelsi@example.com', numero_tel: '+21620000002', adresse: 'Sfax', mot_passe: pwd, role: 'admin' },
        { nom: 'Karim Gharbi', email: 'karim.gharbi@example.com', numero_tel: '+21620000003', adresse: 'Sousse', mot_passe: pwd, role: 'admin' },
        { nom: 'Syrine Ben Ali', email: 'syrine.benali@example.com', numero_tel: '+21620000004', adresse: 'Nabeul', mot_passe: pwd, role: 'user' },
        { nom: 'Omar Haddad', email: 'omar.haddad@example.com', numero_tel: '+21620000005', adresse: 'Monastir', mot_passe: pwd, role: 'user' },
    ];
    for (const d of docs) {
        await User.updateOne({ email: d.email }, { $set: d }, { upsert: true });
    }
    const count = await User.countDocuments({ email: { $in: docs.map(d => d.email) } });
    console.log(`✅ Seed users done (${count})`);
    await mongoose_1.default.disconnect();
}
run().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-users.js.map