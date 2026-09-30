import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: string, dto: CreateBookingDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Fetch showtime & validate
        const showtime = await tx.showtime.findUnique({
          where: { id: dto.showtimeId },
          include: { studio: true },
        });

        if (!showtime) {
          throw new NotFoundException('Showtime not found');
        }

        // Validate seat numbers against studio capacity
        for (const seat of dto.seats) {
          if (seat.number > showtime.studio.totalCols) {
            throw new BadRequestException(
              `Seat ${seat.row}${seat.number} exceeds studio limit (${showtime.studio.totalCols})`,
            );
          }
        }

        // Calculate total price
        const totalAmount = showtime.price * dto.seats.length;

        // Create the Booking
        const booking = await tx.booking.create({
          data: {
            userId,
            showtimeId: dto.showtimeId,
            totalAmount,
            status: BookingStatus.PENDING,
          },
        });

        // Create BookedSeat records
        await tx.bookedSeat.createMany({
          data: dto.seats.map((seat) => ({
            showtimeId: dto.showtimeId,
            bookingId: booking.id,
            row: seat.row.toUpperCase(),
            number: seat.number,
          })),
        });

        return {
          message: 'Booking created successfully. Proceed to payment.',
          bookingId: booking.id,
          totalAmount,
          seats: dto.seats.map((s) => `${s.row.toUpperCase()}${s.number}`),
        };
      });
    } catch (error) {
      // Catch duplicate seat error from Postgres
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'One or more selected seats were just taken by another user!',
        );
      }
      throw error;
    }
  }

  // Fetch logged-in user's booking history
  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        showtime: {
          include: {
            movie: true,
            studio: true,
          },
        },
        bookedSeats: {
          select: {
            row: true,
            number: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Mock Payment Endpoint (PENDING -> PAID)
  async processPayment(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking transaction not found');
    }

    if (booking.status === BookingStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.PAID },
    });
  }
}