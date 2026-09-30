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
        tickets: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    });
  }

  findOne(id: string) {
    const showtime = this.prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: true,
        studio: true,
      },
    });
    if (!showtime) {
      throw new Error('Showtime not found');
    }
    return showtime;
  }

  update(id: string, updateShowtimeDto: UpdateShowtimeDto) {
    return `This action updates a #${id} showtime`;
  }

  remove(id: string) {
    return `This action removes a #${id} showtime`;
  }
}
