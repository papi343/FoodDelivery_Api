import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CheckoutPaymentDto {
  @IsInt()
  @Min(1)
  orderId: number;

  @IsString()
  @IsNotEmpty()
  methode: string;

  @IsOptional()
  @IsBoolean()
  simulerEchec?: boolean;
}
