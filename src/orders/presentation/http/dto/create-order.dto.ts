import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemInputDto {
  @IsInt()
  @Min(1)
  menuItemId: number;

  @IsInt()
  @Min(1)
  quantite: number;
}

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  restaurantId: number;

  @IsString()
  @IsNotEmpty()
  adresseLivraison: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}
