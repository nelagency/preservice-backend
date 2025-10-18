// seed-demandes.mjs
// Node >= 18 requis (fetch natif)

const API = process.env.API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Tes clients (par défaut ceux fournis dans le message)
// Tu peux surcharger via: CLIENT_IDS="id1,id2,id3" node seed-demandes.mjs
const DEFAULT_CLIENT_IDS = [
    '68c65ce528243d21854b3818',
    '68c6553aeec38562bd6d55cc',
    '68c6553aeec38562bd6d55cb',
];
const CLIENT_IDS = (process.env.CLIENT_IDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
const CLIENTS = CLIENT_IDS.length ? CLIENT_IDS : DEFAULT_CLIENT_IDS;

// Types valides côté back (EventTypeEnum)
const EVENT_TYPES = ['Mariages', 'Buffets', 'Baptêmes', 'Anniversaires', 'Entreprise'];

// Status valides côté back (DemandeStatusEnum) — on laisse "en_attente" par défaut
const STATUS = ['en_attente', 'confirme', 'rejete'];

// N = nombre de demandes à créer (défaut 10)
const N = parseInt(process.env.N || '10', 10);

// Helpers
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function futureISO(daysMin = 1, daysMax = 90) {
    const days = randInt(daysMin, daysMax);
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return d.toISOString();
}

async function createDemande(payload) {
    const res = await fetch(`${API}/demandes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`POST /demandes failed (${res.status}). ${txt.slice(0, 300)}`);
    }
    return res.json();
}

async function main() {
    console.log(`➡️  API: ${API}`);
    console.log(`➡️  Clients: ${CLIENTS.join(', ')}`);
    console.log(`➡️  Seed de ${N} demandes…`);

    const results = [];
    for (let i = 0; i < N; i++) {
        const payload = {
            client: pick(CLIENTS),
            type: pick(EVENT_TYPES),                    // EventTypeEnum
            date_proposee: futureISO(3, 120),          // dans les 4 mois
            nb_serveurs: randInt(1, 10),
            status: 'en_attente',                      // ou pick(STATUS) si tu veux varier
        };

        try {
            const created = await createDemande(payload);
            results.push({ ok: true, id: created._id, ...payload });
            console.log(`  ➕ Demande créée: ${created._id} (${payload.type}, ${payload.nb_serveurs} serveurs)`);
        } catch (e) {
            console.warn(`  ⚠️  Échec création #${i + 1}: ${e.message}`);
            results.push({ ok: false, error: String(e) });
        }
    }

    const ok = results.filter(r => r.ok).length;
    const ko = results.length - ok;
    console.log(`\n✅ Terminé. Créées: ${ok} / erreurs: ${ko}`);
}

main().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});