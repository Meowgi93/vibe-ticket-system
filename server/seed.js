import { PrismaClient } from '@prisma/client';
import concertsData from '../src/data/concerts.js';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  // Clear existing
  await prisma.bookedSeat.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.user.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.concert.deleteMany();

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      fullName: 'VIBE Admin',
      email: 'admin@vibe.com',
      phone: '0800000000',
      password: adminPassword,
      role: 'admin'
    }
  });
  console.log('Created admin user: admin@vibe.com / admin123');
  
  let i = 0;
  for (const concert of concertsData) {
    const isFeatured = i < 4; // Make first 4 featured
    
    // Set the first concert to start selling in 2 minutes for testing
    let saleStartAt = null;
    if (i === 0) {
      saleStartAt = new Date(Date.now() + 2 * 60000);
    }

    // Generate 2 showtimes based on the concert date
    let day1Date = concert.date;
    let day2Date = concert.date;

    const matchRange = concert.date.match(/^(\d{2})-(\d{2})\/(\d{2})\/(\d{4})$/);
    const matchSingle = concert.date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (matchRange) {
      day1Date = `${matchRange[1]}/${matchRange[3]}/${matchRange[4]}`;
      day2Date = `${matchRange[2]}/${matchRange[3]}/${matchRange[4]}`;
    } else if (matchSingle) {
      day1Date = concert.date;
      const d = new Date(`${matchSingle[3]}-${matchSingle[2]}-${matchSingle[1]}T12:00:00Z`);
      d.setDate(d.getDate() + 1);
      const day2 = String(d.getDate()).padStart(2, '0');
      const month2 = String(d.getMonth() + 1).padStart(2, '0');
      const year2 = d.getFullYear();
      day2Date = `${day2}/${month2}/${year2}`;
    }

    const showtimes = [
      { date: day1Date + ' (Day 1)', time: concert.time },
      { date: day2Date + ' (Day 2)', time: concert.time }
    ];

    const createdConcert = await prisma.concert.create({
      data: {
        title: concert.title,
        artist: concert.artist,
        date: concert.date,
        time: concert.time,
        venue: concert.venue,
        location: concert.location,
        image: concert.image,
        status: concert.status,
        priceRange: concert.priceRange,
        genre: concert.genre,
        tags: concert.tags.join(','),
        description: concert.description,
        isFeatured,
        saleStartAt,
        showtimes: {
          create: showtimes
        },
        zones: {
          create: concert.zones.map(z => ({
            zoneId: z.id,
            name: z.name,
            price: z.price,
            color: z.color,
            rows: z.rows,
            cols: z.cols
          }))
        }
      }
    });
    console.log(`Created concert: ${createdConcert.title}`);
    i++;
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
