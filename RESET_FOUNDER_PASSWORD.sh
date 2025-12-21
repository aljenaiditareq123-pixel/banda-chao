#!/bin/bash
# One-line command to reset founder password
# Run this in Render Shell: cd src/server && node -e "$(cat <<'EOF'
# const { PrismaClient } = require('@prisma/client');
# const bcrypt = require('bcryptjs');
# const prisma = new PrismaClient();
# (async () => {
#   try {
#     const email = 'aljenaiditareq123@gmail.com';
#     const newPassword = 'Admin123';
#     const hash = await bcrypt.hash(newPassword, 10);
#     await prisma.\$executeRaw\`UPDATE users SET password = \${hash} WHERE email = \${email}\`;
#     console.log('✅ SUCCESS: Password updated to Admin123');
#     console.log('Email:', email);
#   } catch(e) {
#     console.error('❌ ERROR:', e.message);
#   } finally {
#     await prisma.\$disconnect();
#   }
# })();
# EOF
# )"

cd src/server && node -e "const { PrismaClient } = require('@prisma/client'); const bcrypt = require('bcryptjs'); const prisma = new PrismaClient(); (async () => { try { const email = 'aljenaiditareq123@gmail.com'; const newPassword = 'Admin123'; const hash = await bcrypt.hash(newPassword, 10); await prisma.\$executeRaw\`UPDATE users SET password = \${hash} WHERE email = \${email}\`; console.log('✅ SUCCESS: Password updated to Admin123'); console.log('Email:', email); } catch(e) { console.error('❌ ERROR:', e.message); console.error('Stack:', e.stack); } finally { await prisma.\$disconnect(); } })();"
