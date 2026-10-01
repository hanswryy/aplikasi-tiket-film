import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMovieDto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: createMovieDto,
    });
  }

  findAll(search?: string) {
    const normalizedSearch = search?.trim();

    return this.prisma.movie.findMany({
      where: normalizedSearch
        ? {
            title: {
              contains: normalizedSearch,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: {
        title: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      throw new Error(`Movie with ID ${id} not found`);
    }

    // also return its showtimes data
    const showtimes = await this.prisma.showtime.findMany({
      where: { movieId: id },
      include: {
        studio: true,
      },
    });

    return {
      ...movie,
      showtimes,
    };
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    await this.findOne(id);

    return this.prisma.movie.update({
      where: { id },
      data: updateMovieDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.movie.delete({
      where: { id },
    });
  }
}
