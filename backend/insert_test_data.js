const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('focusflow.db');

// Get today's date
const today = new Date();
const dates = [];
for (let i = 0; i < 7; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  dates.push(d.toISOString().split('T')[0]);
}

console.log('Inserting test records for dates:', dates);

let inserted = 0;
dates.forEach((date, idx) => {
  const duration = 20 + (idx * 15);
  const startHour = String(9 + idx).padStart(2, '0');
  const endHour = String(10 + idx).padStart(2, '0');
  
  db.run(
    'INSERT INTO history (action, details, duration, startTime, endTime, date) VALUES (?, ?, ?, ?, ?, ?)',
    ['focus_session', 'Test session', duration, startHour + ':00', endHour + ':00', date],
    function(err) {
      if (err) console.error('Error inserting', date, err);
      else {
        inserted++;
        console.log(`Inserted record for ${date}: ${duration} minutes`);
      }
      if (inserted === dates.length) {
        db.all('SELECT DISTINCT date, SUM(duration) as total_duration FROM history GROUP BY date ORDER BY date DESC', (err, rows) => {
          console.log('\nHistory summary:');
          rows.forEach(r => console.log(`  ${r.date}: ${r.total_duration} minutes`));
          db.close();
        });
      }
    }
  );
});
