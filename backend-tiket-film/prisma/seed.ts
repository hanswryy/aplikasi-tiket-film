import { PrismaClient, Role, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning existing database records...');
  // Menghapus data berurutan sesuai relasi Foreign Key
  await prisma.bookedSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.studio.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users');
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@cinema.com',
      name: 'Admin XXI',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: Role.USER,
    },
  });

  console.log('Seeding studios');
  const studio1 = await prisma.studio.create({
    data: {
      name: 'Studio 1 XXI',
      capacity: 100,
      totalRows: 10,
      totalCols: 10,
    },
  });

  const studio2 = await prisma.studio.create({
    data: {
      name: 'Studio 2 XXI',
      capacity: 100,
      totalRows: 10,
      totalCols: 10,
    },
  });

  const studioImax = await prisma.studio.create({
    data: {
      name: 'IMAX 3D',
      capacity: 120,
      totalRows: 10,
      totalCols: 12,
    },
  });

  console.log('Seeding movies');
  const movie1 = await prisma.movie.create({
    data: {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      durationMin: 166,
      posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLPoA6S3M329R2IOFm3B429L.jpg',
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'Spider-Man: Across the Spider-Verse',
      description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.',
      durationMin: 140,
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sMFF.jpg',
    },
  });

  const movie3 = await prisma.movie.create({
    data: {
      title: 'Oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
      durationMin: 180,
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv3zR1n2ua.jpg',
    },
  });

  console.log('Seeding showtimes');
  const now = new Date();

  // Showtime 1: Dune di Studio 1 (Hari ini + 3 jam)
  const startTime1 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const endTime1 = new Date(startTime1.getTime() + movie1.durationMin * 60 * 1000);

  const showtime1 = await prisma.showtime.create({
    data: {
      movieId: movie1.id,
      studioId: studio1.id,
      price: 50000,
      startTime: startTime1,
      endTime: endTime1,
    },
  });

  // Showtime 2: Spider-Man di IMAX (Besok)
  const startTime2 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const endTime2 = new Date(startTime2.getTime() + movie2.durationMin * 60 * 1000);

  await prisma.showtime.create({
    data: {
      movieId: movie2.id,
      studioId: studioImax.id,
      price: 75000,
      startTime: startTime2,
      endTime: endTime2,
    },
  });

  // Showtime 3: Oppenheimer di Studio 2 (Hari ini + 2 jam)
  const startTime3 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const endTime3 = new Date(startTime3.getTime() + movie3.durationMin * 60 * 1000);

  await prisma.showtime.create({
    data: {
      movieId: movie3.id,
      studioId: studio2.id,
      price: 50000,
      startTime: startTime3,
      endTime: endTime3,
    },
  });

  console.log('Seeding sample booking & booked seats');
  const sampleBooking = await prisma.booking.create({
    data: {
      userId: customerUser.id,
      showtimeId: showtime1.id,
      totalAmount: 50000 * 2,
      status: BookingStatus.PAID,
    },
  });

  // Insert kursi yang di-book (A1 dan A2)
  await prisma.bookedSeat.createMany({
    data: [
      {
        showtimeId: showtime1.id,
        bookingId: sampleBooking.id,
        row: 'A',
        number: 1,
      },
      {
        showtimeId: showtime1.id,
        bookingId: sampleBooking.id,
        row: 'A',
        number: 2,
      },
    ],
  });
  
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });