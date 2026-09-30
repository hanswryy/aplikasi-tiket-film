import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateStudioDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  capacity: number;

  @IsInt()
  @IsNotEmpty()
  totalRows: number;

  @IsInt()
  @IsNotEmpty()
  totalCols: number;
}
