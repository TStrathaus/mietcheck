// reset-password.js
// Nutze: node reset-password.js deine@email.ch NeuesPasswort123

const bcrypt = require('bcryptjs');

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node reset-password.js email@example.com NewPassword123');
  process.exit(1);
}

const hash = bcrypt.hashSync(newPassword, 10);

console.log('\n========================================');
console.log('Password Reset - SQL Query');
console.log('========================================\n');
console.log('Fuehre diesen SQL-Befehl in Neon aus:\n');
console.log(`UPDATE users`);
console.log(`SET password_hash = '${hash}'`);
console.log(`WHERE email = '${email}';\n`);
console.log('========================================');
console.log(`Email: ${email}`);
console.log(`Neues Passwort: ${newPassword}`);
console.log('========================================\n');
