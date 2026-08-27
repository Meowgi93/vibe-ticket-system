const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const monthMap = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
};

function convertConcertDate(oldStr) {
  if (oldStr === 'Dec , 5-6, 2026') return '05-06/12/2026';
  
  // Sat, Jun 13, 2026
  const regex = /[A-Z][a-z]{2}, ([A-Z][a-z]{2}) (\d{1,2}), (\d{4})/;
  const match = oldStr.match(regex);
  if (match) {
    const month = monthMap[match[1]];
    const day = match[2].padStart(2, '0');
    const year = match[3];
    return `${day}/${month}/${year}`;
  }
  return oldStr;
}

function convertShowtimeDate(oldStr) {
  // Dec  5, 2026 (Day 1)
  let regex = /([A-Z][a-z]{2})\s+(\d{1,2}), (\d{4}) \((.*)\)/;
  let match = oldStr.match(regex);
  if (match) {
    const month = monthMap[match[1]];
    const day = match[2].padStart(2, '0');
    const year = match[3];
    return `${day}/${month}/${year} (${match[4]})`;
  }

  // Sat, Jun 13, 2026 (Day 1)
  regex = /[A-Z][a-z]{2}, ([A-Z][a-z]{2}) (\d{1,2}), (\d{4}) \((.*)\)/;
  match = oldStr.match(regex);
  if (match) {
    const month = monthMap[match[1]];
    const day = match[2].padStart(2, '0');
    const year = match[3];
    return `${day}/${month}/${year} (${match[4]})`;
  }

  return oldStr;
}

async function run() {
  const concerts = await prisma.concert.findMany();
  for (const c of concerts) {
    const newDate = convertConcertDate(c.date);
    if (newDate !== c.date) {
      await prisma.concert.update({ where: { id: c.id }, data: { date: newDate } });
      console.log(`Concert ${c.id}: ${c.date} -> ${newDate}`);
    }
  }

  const showtimes = await prisma.showtime.findMany();
  for (const s of showtimes) {
    const newDate = convertShowtimeDate(s.date);
    if (newDate !== s.date) {
      await prisma.showtime.update({ where: { id: s.id }, data: { date: newDate } });
      console.log(`Showtime ${s.id}: ${s.date} -> ${newDate}`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
