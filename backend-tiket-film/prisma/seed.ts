import { PrismaClient, Role, SeatStatus, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.seat.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.showtime.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.create({
        data: {
            email: 'admin@cinema.com',
            name: 'Admin Cinema',
            password: hashedPassword,
            role: Role.ADMIN,
        }
    });

    const customerUser = await prisma.user.create({
        data: {
            email: 'john@example.com',
            name: 'John Doe',
            password: hashedPassword,
            role: Role.USER,
        }
    });

    console.log('Seeded users:', await prisma.user.findMany());

    const movies = await Promise.all([
        prisma.movie.create({
        data: {
            title: 'Dune: Part Two',
            description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
            posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLPoA6S3M329R2IOFm3B429L.jpg',
            durationMin: 166,
        },
        }),
        prisma.movie.create({
        data: {
            title: 'Spider-Man: Across the Spider-Verse',
            description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.',
            posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj7sMFF.jpg',
            durationMin: 140,
        },
        }),
        prisma.movie.create({
        data: {
            title: 'Oppenheimer',
            description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
            posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv3zR1n2ua.jpg',
            durationMin: 180,
        },
        }),
    ]);

    console.log('Seeded movies:', movies);

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']; // 10 Rows
    const seatPrice = 50000;
    const now = new Date();
    const createdShowtimes = [];

    for (const movie of movies) {
        // Create 2 showtimes for each movie
        const st1 = await prisma.showtime.create({
            data: {
                movieId: movie.id,
                price: seatPrice,
                startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // Today +3 hrs
            },
        });
        createdShowtimes.push(st1);

        const st2 = await prisma.showtime.create({
            data: {
                movieId: movie.id,
                price: seatPrice,
                startTime: new Date(now.getTime() + 27 * 60 * 60 * 1000), // Tomorrow +3 hrs
            },
        });
        createdShowtimes.push(st2);
    }

    // Populate 100 seats (10 rows x 10 numbers) for every showtime
    for (const showtime of createdShowtimes) {
        const seatsToCreate = [];
        for (const row of rows) {
        for (let number = 1; number <= 10; number++) {
            seatsToCreate.push({
            showtimeId: showtime.id,
            row,
            number,
            status: SeatStatus.AVAILABLE,
            });
        }
        }
        await prisma.seat.createMany({ data: seatsToCreate });
    }

    const sampleShowtime = createdShowtimes[0];

    const sampleSeats = await prisma.seat.findMany({
        where: {
            showtimeId: sampleShowtime.id,
            row: 'A',
            number: { in: [1, 2] },
        },
    });

    const sampleBooking = await prisma.booking.create({
        data: {
            userId: customerUser.id,
            showtimeId: sampleShowtime.id,
            totalAmount: seatPrice * 2,
            status: BookingStatus.PAID,
        },
    });

    // Link selected seats to the booking and update status to BOOKED
    await prisma.seat.updateMany({
        where: {
            id: { in: sampleSeats.map((s) => s.id) },
        },
        data: {
            status: SeatStatus.BOOKED,
            bookingId: sampleBooking.id,
        },
    });
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });