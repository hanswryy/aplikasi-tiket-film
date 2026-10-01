import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, Prisma } from '@prisma/client';

import { ConfigService } from '@nestjs/config';
// midtrans-client does not currently provide TypeScript declarations.
// @ts-expect-error The package is consumed as an untyped JavaScript module.
import * as midtransClient from 'midtrans-client';

@Injectable()
export class BookingsService {
  private readonly snap: midtransClient.Snap;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.snap = new midtransClient.Snap({
      isProduction:
        this.configService.get('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.getOrThrow('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.getOrThrow('MIDTRANS_CLIENT_KEY'),
    });
  }

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

  // Creates the payment transaction; Midtrans changes the status via notification.
  async processPayment(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: {
        showtime: {
          include: { movie: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking transaction not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not pending payment');
    }

    const transaction = await this.snap.createTransaction({
      transaction_details: {
        order_id: booking.id,
        gross_amount: Math.round(booking.totalAmount),
      },
      item_details: [
        {
          id: booking.showtime.movieId,
          price: Math.round(booking.totalAmount),
          quantity: 1,
          name: booking.showtime.movie.title,
        },
      ],
    });

    return {
      success: true,
      bookingId: booking.id,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  }

  async handleMidtransNotification(payload: Record<string, unknown>) {
    const notification = (await this.snap.transaction.notification(
      payload,
    )) as {
      order_id: string;
      transaction_status: string;
      gross_amount: string;
    };

    const booking = await this.prisma.booking.findUnique({
      where: { id: notification.order_id },
    });

    if (!booking) {
      throw new NotFoundException('Booking transaction not found');
    }

    if (Number(notification.gross_amount) !== booking.totalAmount) {
      throw new BadRequestException('Payment amount does not match booking');
    }

    if (booking.status === BookingStatus.PAID) {
      return { received: true, status: booking.status };
    }

    const statusMap: Record<string, BookingStatus> = {
      settlement: BookingStatus.PAID,
      capture: BookingStatus.PAID,
      expire: BookingStatus.EXPIRED,
      cancel: BookingStatus.CANCELLED,
      deny: BookingStatus.CANCELLED,
      failure: BookingStatus.CANCELLED,
    };
    const nextStatus = statusMap[notification.transaction_status];

    if (nextStatus && nextStatus !== booking.status) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: nextStatus },
      });
    }

    return { received: true, status: nextStatus ?? booking.status };
  }
}