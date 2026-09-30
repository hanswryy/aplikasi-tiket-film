import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('bookings')
@UseGuards(AuthGuard('jwt'))
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  create(
    @GetUser('userId') userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(userId, createBookingDto);
  }

  @Get('my-bookings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  findMyBookings(@GetUser('userId') userId: string) {
    return this.bookingsService.getUserBookings(userId);
  }

  @Post(':id/pay')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER)
  pay(@GetUser('userId') userId: string, @Param('id') bookingId: string) {
    return this.bookingsService.processPayment(userId, bookingId);
  }
}