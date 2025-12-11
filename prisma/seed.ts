import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if demo user exists
  const existingUser = await prisma.users.findUnique({
    where: { email: 'panda@bandachao.com' },
  });

  if (existingUser) {
    console.log('✅ Demo user already exists');
    
    // Update user to ensure level and points are set
    await prisma.users.update({
      where: { email: 'panda@bandachao.com' },
      data: {
        level: 3,
        points: 1250,
      },
    });
    console.log('✅ Updated demo user (Level 3, 1250 points)');
  } else {
    // Create demo user
    const demoUser = await prisma.users.create({
      data: {
        email: 'panda@bandachao.com',
        name: 'Ahmed Panda',
        profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Panda',
        level: 3,
        points: 1250,
        role: 'BUYER',
        password: null, // No password for demo
      },
    });
    console.log('✅ Created demo user:', demoUser.email);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
