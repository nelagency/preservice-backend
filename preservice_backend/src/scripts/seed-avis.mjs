const API = process.env.API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ali.bensalem@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Passw0rd!';

// Tes 3 clients (peuvent être surchargés via env CLIENT_IDS="id1,id2,id3")
const DEFAULT_CLIENT_IDS = [
    '68c65ce528243d21854b3818',
    '68c6553aeec38562bd6d55cc',
    '68c6553aeec38562bd6d55cb',
];
const CLIENT_IDS = (process.env.CLIENT_IDS || '').split(',').filter(Boolean).length
    ? process.env.CLIENT_IDS.split(',').map(s => s.trim())
    : DEFAULT_CLIENT_IDS;

// Option : limiter les events utilisés (env EVENTS="id1,id2,...")
// sinon on fetch /events
const EVENTS_FROM_ENV = (process.env.EVENTS || '').split(',').map(s => s.trim()).filter(Boolean);

const COMMENTS = [
    "Service impeccable, merci à toute l’équipe.",
    "Très bien organisé, je recommande.",
    "Bonne coordination, quelques lenteurs au service.",
    "Excellente presta, personnels souriants.",
    "Tout était parfait, bravo !",
    "Professionnels et réactifs, merci.",
    "Petits retards, mais globalement satisfaits.",
    "Ambiance top et service nickel.",
    "Très bon rapport qualité/prix.",
    "Nous referons appel à vous sans hésiter.",
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

async function login() {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, mot_passe: ADMIN_PASSWORD }),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Login failed (${res.status}). Payload: ${txt.slice(0, 300)}`);
    }
    const data = await res.json();
    return data.access_token;
}

async function listEvents(token) {
    if (EVENTS_FROM_ENV.length) return EVENTS_FROM_ENV;
    const res = await fetch(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`GET /events failed (${res.status}). ${txt.slice(0, 300)}`);
    }
    const arr = await res.json();
    // On accepte _id ou id
    const ids = arr.map(e => e._id || e.id).filter(Boolean);
    if (!ids.length) throw new Error('Aucun évènement disponible. Crée au moins un évènement avant de seed des avis.');
    return ids;
}

async function createReview(token, payload) {
    const res = await fetch(`${API}/avis`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`POST /avis failed (${res.status}). ${txt.slice(0, 300)}`);
    }
    return res.json();
}

async function main() {
    console.log('➡️  Login admin…');
    const token = await login();
    console.log('✅ Login OK');

    console.log('➡️  Récupération des événements…');
    const eventIds = await listEvents(token);
    console.log(`✅ ${eventIds.length} évènement(s) disponibles`);

    const N = parseInt(process.env.N || '10', 10);
    console.log(`➡️  Création de ${N} avis…`);

    const results = [];
    for (let i = 0; i < N; i++) {
        const payload = {
            note: randInt(4, 5),                         // 4~5 pour rester “positif”
            commentaire: pick(COMMENTS),
            client: pick(CLIENT_IDS),                    // l’un de tes 3 users
            event: pick(eventIds),                       // un évènement au hasard
            etat: true,                                  // affiché par défaut
        };

        try {
            const created = await createReview(token, payload);
            results.push({ ok: true, id: created._id, client: payload.client, event: payload.event });
            console.log(`  ➕ Avis créé: ${created._id}`);
        } catch (e) {
            // On continue même si un avis (client,event) existe déjà (si tu actives l'unicité)
            console.warn(`  ⚠️  Échec création avis #${i + 1}: ${(e && e.message) || e}`);
            results.push({ ok: false, error: String(e) });
        }
    }

    const ok = results.filter(r => r.ok).length;
    const ko = results.length - ok;
    console.log(`\n✅ Terminé. Créés: ${ok} / erreurs: ${ko}`);
}

main().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});