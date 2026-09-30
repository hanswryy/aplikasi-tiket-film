import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested, ArrayNotEmpty } from 'class-validator';

export class SeatItemDto {
  @IsString()
  @IsNotEmpty()
  row: string; // e.g. "A"

  @IsNumber()
  @IsNotEmpty()
  number: number; // e.g. 1
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  showtimeId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SeatItemDto)
  seats: SeatItemDto[]; // e.g. [{ row: "A", number: 1 }, { row: "A", number: 2 }]
}