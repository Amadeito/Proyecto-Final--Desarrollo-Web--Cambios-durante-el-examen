const bcrypt = require('bcrypt');
const pwd = process.argv[2] || 'Demo1234!';
(async()=>{ const h = await bcrypt.hash(pwd, 10); console.log(h); })();
