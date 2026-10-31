import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  adresse: string;

  @IsOptional()
  @IsBoolean()
  estOuvert?: boolean;

  @IsOptional()
  @IsString()
  horaires?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  note?: number;
}
