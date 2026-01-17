const bcrypt = require('bcrypt');
const db = require('./config/db');

async function createUser() {
  const args = process.argv.slice(2);
  let [name, username, password, role, groupId] = args;

  if (args.length !== 5) {
    console.error('Error: Incorrect number of arguments.');
    console.log('Usage: node createUser.js "Full Name" "username" "password" "role" group_id');
    process.exit(1);
  }
  // Convert the string "null" from the command line to a real null value for the database
  if (groupId && groupId.toLowerCase() === 'null') {
    groupId = null;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const sql = 'INSERT INTO `users` (name, username, password_hash, role, group_id) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, username, passwordHash, role, groupId]);

    console.log('User created successfully!');
    console.log(`   ID: ${result.insertId}, Name: ${name}, Username: ${username}, Role: ${role}, Group: ${groupId}`);
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error(`Error: The username "${username}" already exists.`);
    } else {
      console.error('Database error:', error);
    }
  }
  
  await db.end();
}

createUser();