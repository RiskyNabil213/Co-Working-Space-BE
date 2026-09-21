const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/database.sqlite');

const initialSpaces = [
  {
    nama_space: "Personal Desk - Flexi 01",
    tipe: "desk",
    harga_per_jam: 20000,
    kapasitas: 1,
    deskripsi: "Individual acoustic partition booth designed for deep focus and sprint tasks with 100Mbps optical WiFi and power outlets.",
    foto: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    nama_space: "Meeting Room Alpha",
    tipe: "meeting_room",
    harga_per_jam: 100000,
    kapasitas: 8,
    deskripsi: "Sound-insulated glass suite configured for executive strategy sessions, 55 inch 4K Smart TV, and soundbar audio.",
    foto: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    nama_space: "Executive Private Office 02",
    tipe: "private_office",
    harga_per_jam: 150000,
    kapasitas: 6,
    deskripsi: "Architectural concrete suite with private lounge space, dedicated biometric smart door lock, and high-performance workstation array.",
    foto: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=85",
  },
  {
    nama_space: "The Ascent Boardroom Suite",
    tipe: "meeting_room",
    harga_per_jam: 250000,
    kapasitas: 14,
    deskripsi: "High-tier boardroom featuring panoramic skyline view, Italian leather seating, dual 75-inch UHD commercial displays, and Polycom system.",
    foto: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    nama_space: "Focus Station Dusk",
    tipe: "desk",
    harga_per_jam: 25000,
    kapasitas: 1,
    deskripsi: "Quiet alcove equipped with warm luminaire, Herman Miller calibrated ergonomics, and zero-distraction acoustic felt divider.",
    foto: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    nama_space: "Atrium Open Bench 06",
    tipe: "desk",
    harga_per_jam: 15000,
    kapasitas: 4,
    deskripsi: "Sunlit timber long table under natural atrium skylight, ideal for energetic creative co-working and casual pairing.",
    foto: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
  },
];

db.serialize(() => {
  console.log("Seeding 6 standard spaces into database...");

  // Delete existing spaces first to avoid duplicates
  db.run("DELETE FROM spaces", (err) => {
    if (err) console.error("Error clearing spaces:", err);
  });

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO spaces (maker_id, id_owner, nama_space, harga_per_jam, tipe, kapasitas, deskripsi, foto, created_at, updated_at)
    VALUES (1, 1, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  initialSpaces.forEach((s) => {
    stmt.run([s.nama_space, s.harga_per_jam, s.tipe, s.kapasitas, s.deskripsi, s.foto, now, now]);
  });

  stmt.finalize(() => {
    db.all("SELECT id, nama_space, tipe, harga_per_jam, kapasitas, foto FROM spaces WHERE maker_id = 1", (err, rows) => {
      if (err) console.error(err);
      console.log(`Successfully seeded ${rows.length} spaces:`);
      console.table(rows);
    });
  });
});
