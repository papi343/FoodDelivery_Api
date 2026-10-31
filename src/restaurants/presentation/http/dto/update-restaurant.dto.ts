import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

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
