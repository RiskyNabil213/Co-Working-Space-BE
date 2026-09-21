const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/database.sqlite');

db.serialize(() => {
  console.log('Starting Clean Reset...');

  // 1. Delete all reservations
  db.run('DELETE FROM reservasis', (err) => {
    if (err) console.error('Error clearing reservasis:', err);
    else console.log('Cleared all reservasis.');
  });

  // 2. Delete all spaces
  db.run('DELETE FROM spaces', (err) => {
    if (err) console.error('Error clearing spaces:', err);
    else console.log('Cleared all spaces.');
  });

  // 3. Delete all members
  db.run('DELETE FROM members', (err) => {
    if (err) console.error('Error clearing members:', err);
    else console.log('Cleared all members.');
  });

  // 4. Delete member users and test admin users, keep primary admin (id = 1)
  db.run('DELETE FROM users WHERE id != 1', (err) => {
    if (err) console.error('Error clearing non-primary users:', err);
    else console.log('Cleared non-primary users (kept admin_space1).');
  });

  // 5. Keep primary space_owner (id = 1)
  db.run('DELETE FROM space_owners WHERE id != 1', (err) => {
    if (err) console.error('Error clearing non-primary space_owners:', err);
    else console.log('Cleared non-primary space owners (kept Ahmad Bidin).');
  });

  // 6. Keep maker 1
  db.run('DELETE FROM makers WHERE id != 1', (err) => {
    if (err) console.error('Error clearing non-primary makers:', err);
    else console.log('Cleared non-primary makers.');
  });

  // 7. Verify final counts
  db.all('SELECT count(*) as count FROM users', (e, r) => console.log('Users remaining:', r));
  db.all('SELECT count(*) as count FROM space_owners', (e, r) => console.log('Space Owners remaining:', r));
  db.all('SELECT count(*) as count FROM members', (e, r) => console.log('Members remaining:', r));
  db.all('SELECT count(*) as count FROM spaces', (e, r) => console.log('Spaces remaining:', r));
  db.all('SELECT count(*) as count FROM reservasis', (e, r) => console.log('Reservations remaining:', r));
});
