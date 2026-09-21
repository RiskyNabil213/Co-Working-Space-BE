const http = require('http');
const app = require('./src/app');
const { initDatabase, query } = require('./src/config/database');

let server;
const PORT = 3001;
const BASE = `http://localhost:${PORT}`;

async function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting Automated Test of 50 API Endpoints ---');
    await initDatabase();

    server = app.listen(PORT, () => {
        console.log(`Test server running on port ${PORT}`);
    });

    let passed = 0;
    let failed = 0;

    function assert(name, condition, extra = '') {
        if (condition) {
            console.log(` [PASS] ${name}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} ${extra}`);
            failed++;
        }
    }

    try {
        // 1. Root & Health
        const r1 = await request('GET', '/');
        assert('GET / (Root status)', r1.statusCode === 200 && r1.body.status === true);

        const r2 = await request('GET', '/health');
        assert('GET /health (Health check)', r2.statusCode === 200 && r2.body.data.status === 'ok');

        // 2. Multi-Tenancy Maker
        const r3 = await request('POST', '/api/maker/register', {
            name: 'Test Siswa',
            username: 'testsiswa' + Date.now(),
            email: 'test' + Date.now() + '@smk.sch.id',
            password: 'Password123!'
        });
        assert('POST /api/maker/register', r3.statusCode === 201 && r3.body.data.app_key);
        const testAppKey = r3.body.data.app_key;
        const makerToken = r3.body.data.access_token;

        const r4 = await request('POST', '/api/maker/login', {
            usernameOrEmail: r3.body.data.username,
            password: 'Password123!'
        });
        assert('POST /api/maker/login', r4.statusCode === 200 && r4.body.data.access_token);

        const r5 = await request('GET', '/api/maker/me', null, { 'Authorization': `Bearer ${makerToken}` });
        assert('GET /api/maker/me', r5.statusCode === 200 && r5.body.data.app_key === testAppKey);

        const r6 = await request('GET', '/api/maker/stats', null, { 'x-maker-key': testAppKey });
        assert('GET /api/maker/stats', r6.statusCode === 200 && typeof r6.body.data.total_spaces === 'number');

        const r7 = await request('GET', '/api/maker/list');
        assert('GET /api/maker/list', r7.statusCode === 200 && Array.isArray(r7.body.data));

        // 3. Auth Member & Admin Space
        const r8 = await request('POST', '/api/auth/register/member', {
            username: 'membertest' + Date.now(),
            password: 'Secret123!',
            nama_member: 'Member Testing',
            instansi: 'SMK Telkom',
            alamat: 'Malang',
            telp: '08123456789'
        }, { 'x-maker-key': testAppKey });
        assert('POST /api/auth/register/member', r8.statusCode === 201 && r8.body.data.role === 'member');
        const memberToken = r8.body.data.access_token;
        const memberId = r8.body.data.member.id;

        const r9 = await request('POST', '/api/auth/register/admin-space', {
            username: 'admintest' + Date.now(),
            password: 'Admin123!',
            nama_coworking: 'Test Coworking Hub',
            nama_pemilik: 'Owner Test',
            telp: '08987654321'
        }, { 'x-maker-key': testAppKey });
        assert('POST /api/auth/register/admin-space', r9.statusCode === 201 && r9.body.data.role === 'admin_space');
        const adminToken = r9.body.data.access_token;

        const r10 = await request('POST', '/api/auth/login', {
            username: r8.body.data.username,
            password: 'Secret123!'
        }, { 'x-maker-key': testAppKey });
        assert('POST /api/auth/login', r10.statusCode === 200 && r10.body.data.role === 'member');

        const r11 = await request('GET', '/api/auth/profile', null, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/auth/profile', r11.statusCode === 200 && r11.body.data.role === 'member');

        // 4. Spaces Catalog & Availability
        const r12 = await request('GET', '/api/spaces/types');
        assert('GET /api/spaces/types', r12.statusCode === 200 && r12.body.data.length === 3);

        const r14 = await request('GET', '/api/spaces', null, { 'x-maker-key': testAppKey });
        assert('GET /api/spaces', r14.statusCode === 200 && r14.body.data.length > 0);
        const spaceId = r14.body.data[0].id;

        const r13 = await request('GET', `/api/spaces/availability?id_space=${spaceId}&tanggal=2026-08-30&jam_mulai=09:00&durasi_jam=3`, null, { 'x-maker-key': testAppKey });
        assert('GET /api/spaces/availability', r13.statusCode === 200 && r13.body.data.available === true);

        const r15 = await request('GET', `/api/spaces/${spaceId}`, null, { 'x-maker-key': testAppKey });
        assert('GET /api/spaces/:id', r15.statusCode === 200 && r15.body.data.id === spaceId);

        // 5. Diskon & Promo
        const r16 = await request('GET', '/api/diskon/active', null, { 'x-maker-key': testAppKey });
        assert('GET /api/diskon/active', r16.statusCode === 200);

        const r17 = await request('POST', '/api/diskon/check', { nama_diskon: 'DISKONHEMAT20' }, { 'x-maker-key': testAppKey });
        assert('POST /api/diskon/check', r17.statusCode === 200 && r17.body.data.is_active === true);
        const diskonId = r17.body.data.id;

        const r18 = await request('GET', `/api/diskon/${diskonId}`, null, { 'x-maker-key': testAppKey });
        assert('GET /api/diskon/:id', r18.statusCode === 200 && r18.body.data.id === diskonId);

        // 6. Member Reservation Flow
        const r19 = await request('POST', '/api/reservasi', {
            id_space: spaceId,
            tanggal_reservasi: '2026-08-30',
            jam_mulai: '09:00',
            durasi_jam: 3,
            id_diskon: diskonId
        }, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        assert('POST /api/reservasi', r19.statusCode === 201 && r19.body.data.total_bayar > 0);
        const reservasiId = r19.body.data.id;

        const r20 = await request('GET', '/api/reservasi/my', null, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/reservasi/my', r20.statusCode === 200 && r20.body.data.length > 0);

        const r21 = await request('GET', '/api/reservasi/my/history?month=8&year=2026', null, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/reservasi/my/history', r21.statusCode === 200 && r21.body.data.total_reservasi > 0);

        const r22 = await request('GET', `/api/reservasi/${reservasiId}/e-ticket`, null, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/reservasi/:id/e-ticket', r22.statusCode === 200 && r22.body.data.qr_code_payload.includes('VERIFY'));

        const r23 = await request('GET', `/api/reservasi/${reservasiId}`, null, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/reservasi/:id', r23.statusCode === 200 && r23.body.data.id === reservasiId);

        // 7. Admin Space Profile & CRUD Member
        const r25 = await request('GET', '/api/admin/profile', null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/profile', r25.statusCode === 200 && r25.body.data.nama_coworking);

        const r26 = await request('PUT', '/api/admin/profile', {
            nama_coworking: 'Moklet Hub Coworking Space (Updated)',
            nama_pemilik: 'Ahmad Bidin, S.Kom',
            telp: '081298765432'
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('PUT /api/admin/profile', r26.statusCode === 200 && r26.body.data.nama_coworking.includes('Updated'));

        const r27 = await request('GET', '/api/admin/members', null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/members', r27.statusCode === 200 && Array.isArray(r27.body.data));

        const r28 = await request('POST', '/api/admin/members', {
            username: 'user_budi' + Date.now(),
            password: 'Secret123!',
            nama_member: 'Budi Raharjo',
            instansi: 'SMK Telkom Malang',
            alamat: 'Jl. Danau Ranau No. 1, Sawojajar, Malang',
            telp: '085712345678',
            foto: 'budi.jpg'
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('POST /api/admin/members', r28.statusCode === 201 && r28.body.data.id);
        const adminCreatedMemberId = r28.body.data.id;

        const r29 = await request('GET', `/api/admin/members/${adminCreatedMemberId}`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/members/:id', r29.statusCode === 200 && r29.body.data.id === adminCreatedMemberId);

        const r30 = await request('PUT', `/api/admin/members/${adminCreatedMemberId}`, {
            nama_member: 'Budi Raharjo, S.T.'
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('PUT /api/admin/members/:id', r30.statusCode === 200 && r30.body.data.nama_member === 'Budi Raharjo, S.T.');

        const r31 = await request('DELETE', `/api/admin/members/${adminCreatedMemberId}`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('DELETE /api/admin/members/:id', r31.statusCode === 200 && r31.body.data.deleted === true);

        // 8. Admin Space CRUD
        const r32 = await request('GET', '/api/admin/spaces', null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/spaces', r32.statusCode === 200 && Array.isArray(r32.body.data));

        const r33 = await request('POST', '/api/admin/spaces', {
            nama_space: 'Personal Desk Alpha 01',
            harga_per_jam: 25000,
            tipe: 'desk',
            kapasitas: 1,
            deskripsi: 'Dilengkapi colokan listrik, WiFi 100Mbps, monitor 24 inch, dan free flow kopi/teh.',
            foto: 'desk_alpha_01.jpg'
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('POST /api/admin/spaces', r33.statusCode === 201 && r33.body.data.id);
        const adminCreatedSpaceId = r33.body.data.id;

        const r34 = await request('GET', `/api/admin/spaces/${adminCreatedSpaceId}`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/spaces/:id', r34.statusCode === 200 && r34.body.data.id === adminCreatedSpaceId);

        const r35 = await request('PUT', `/api/admin/spaces/${adminCreatedSpaceId}`, {
            nama_space: 'Personal Desk Alpha 01 (Updated)',
            harga_per_jam: 30000
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('PUT /api/admin/spaces/:id', r35.statusCode === 200 && r35.body.data.harga_per_jam === 30000);

        const r36 = await request('DELETE', `/api/admin/spaces/${adminCreatedSpaceId}`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('DELETE /api/admin/spaces/:id', r36.statusCode === 200 && r36.body.data.deleted === true);

        // 9. Admin Diskon CRUD
        const r37 = await request('GET', '/api/admin/diskon', null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/diskon', r37.statusCode === 200 && Array.isArray(r37.body.data));

        const r38 = await request('POST', '/api/admin/diskon', {
            nama_diskon: 'PROMOAGUSTUS',
            persentase_diskon: 20,
            tanggal_awal: '2026-08-01T00:00:00Z',
            tanggal_akhir: '2026-08-31T23:59:59Z'
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('POST /api/admin/diskon', r38.statusCode === 201 && r38.body.data.id);
        const adminCreatedDiskonId = r38.body.data.id;

        const r39 = await request('GET', `/api/admin/diskon/${adminCreatedDiskonId}`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/diskon/:id', r39.statusCode === 200 && r39.body.data.id === adminCreatedDiskonId);

        const r40 = await request('PUT', `/api/admin/diskon/${adminCreatedDiskonId}`, {
            nama_diskon: 'PROMOAGUSTUS2026',
            persentase_diskon: 25
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('PUT /api/admin/diskon/:id', r40.statusCode === 200 && r40.body.data.persentase_diskon === 25);

        const r41 = await request('DELETE', `/api/admin/diskon/${adminCreatedDiskonId}`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('DELETE /api/admin/diskon/:id', r41.statusCode === 200 && r41.body.data.deleted === true);

        // 10. Admin Operational & Reports
        const r42 = await request('GET', '/api/admin/reservasi?month=8&year=2026', null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/reservasi', r42.statusCode === 200 && Array.isArray(r42.body.data));

        const r43 = await request('PATCH', `/api/admin/reservasi/${reservasiId}/status`, {
            status: 'disetujui'
        }, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('PATCH /api/admin/reservasi/:id/status', r43.statusCode === 200 && r43.body.data.status === 'disetujui');

        const r44 = await request('POST', `/api/admin/reservasi/${reservasiId}/check-in`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('POST /api/admin/reservasi/:id/check-in', r44.statusCode === 200 && r44.body.data.status === 'aktif');

        const r45 = await request('POST', `/api/admin/reservasi/${reservasiId}/check-out`, null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('POST /api/admin/reservasi/:id/check-out', r45.statusCode === 200 && r45.body.data.status === 'selesai');

        const r46 = await request('GET', '/api/admin/reports/monthly?month=8&year=2026', null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/reports/monthly', r46.statusCode === 200 && r46.body.data.rincian_per_tipe_space.length === 3);

        const r47 = await request('GET', '/api/admin/reports/income?month=8&year=2026', null, {
            'Authorization': `Bearer ${adminToken}`,
            'x-maker-key': testAppKey
        });
        assert('GET /api/admin/reports/income', r47.statusCode === 200 && typeof r47.body.data.realisasi_pendapatan_bersih === 'number');

        // Cancel test with another reservation
        const r_new = await request('POST', '/api/reservasi', {
            id_space: spaceId,
            tanggal_reservasi: '2026-08-31',
            jam_mulai: '13:00',
            durasi_jam: 2
        }, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        const cancelResId = r_new.body.data.id;

        const r24 = await request('PATCH', `/api/reservasi/${cancelResId}/cancel`, null, {
            'Authorization': `Bearer ${memberToken}`,
            'x-maker-key': testAppKey
        });
        assert('PATCH /api/reservasi/:id/cancel', r24.statusCode === 200 && r24.body.data.status === 'dibatalkan');

        console.log(`\n================================`);
        console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
        console.log(`================================\n`);
    } catch (err) {
        console.error('Test Execution Error:', err);
    } finally {
        server.close();
        process.exit(failed > 0 ? 1 : 0);
    }
}

runTests();
