import { Injectable } from '@nestjs/common';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShowtimesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createShowtimeDto: CreateShowtimeDto) {
    return 'This action adds a new showtime';
  }

  findAll() {
    // also get total number of available seats for each showtime
    return this.prisma.showtime.findMany({
      include: {
        movie: true,
        studio: true,
      },
    });
  }

  async findOne(id: string) {
    const showtime = await this.prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: true,
        studio: true,
      },
    });
    if (!showtime) {
      throw new Error('Showtime not found');
    }
    // also get all bookedseats for this showtime
    const bookedSeats = await this.prisma.booking.findMany({
      where: { showtimeId: id },
      select: {
        bookedSeats: true,
      },
    });

    return {
      ...showtime,
      bookedSeats: bookedSeats.flatMap((booking) => booking.bookedSeats),
    };
    
  }

  update(id: string, updateShowtimeDto: UpdateShowtimeDto) {
    return `This action updates a #${id} showtime`;
  }

  remove(id: string) {
    return `This action removes a #${id} showtime`;
  }
}
