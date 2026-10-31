import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  prix: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @IsString()
  @IsNotEmpty()
  categorie: string;
}
