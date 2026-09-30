import {  IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateMovieDto {
  // consist of title string, description string, posterUrl string, durationMin int
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  posterUrl: string;

  @IsNumber()
  @IsNotEmpty()
  durationMin: number;
}
