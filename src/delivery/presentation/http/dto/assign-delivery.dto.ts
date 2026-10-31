import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AssignDeliveryDto {
  @IsInt()
  @Min(1)
  orderId: number;

  @IsInt()
  @Min(1)
  livreurId: number;

  @IsOptional()
  @IsString()
  positionActuelle?: string;

  @IsOptional()
  @IsDateString()
  heureEstimee?: string;
}
