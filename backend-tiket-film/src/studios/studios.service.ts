import { Injectable } from '@nestjs/common';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudiosService {
  constructor(private readonly prisma: PrismaService) {}

  create(createStudioDto: CreateStudioDto) {
    return this.prisma.studio.create({
      data: createStudioDto,
    });
  }

  findAll() {
    return this.prisma.studio.findMany();
  }

  findOne(id: string) {
    const studio = this.prisma.studio.findUnique({
      where: { id },
    });

    if (!studio) {
      throw new Error(`Studio with ID ${id} not found`);
    }

    return studio;
  }


  async update(id: string, updateStudioDto: UpdateStudioDto) {
    await this.findOne(id);

    return this.prisma.studio.update({
      where: { id },
      data: updateStudioDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.studio.delete({
      where: { id },
    });
  }
}
