import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DeliveryStatus } from '../../../../common/enums/delivery-status.enum';

export class UpdateDeliveryStatusDto {
  @IsOptional()
  @IsEnum(DeliveryStatus)
  statut?: DeliveryStatus;

  @IsOptional()
  @IsString()
  positionActuelle?: string;

  @IsOptional()
  @IsDateString()
  heureEstimee?: string;
}
