import { IsUUID, IsDateString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressOverrideDto {
  street: string;
  number?: string;
  district?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export class CreatePickupDto {
  @IsUUID('4', { message: 'customerId deve ser um UUID válido' })
  customerId: string;

  @IsUUID('4', { message: 'petId deve ser um UUID válido' })
  petId: string;

  @IsDateString({}, { message: 'pickupWindowStart deve ser uma data ISO válida' })
  pickupWindowStart: string;

  @IsDateString({}, { message: 'pickupWindowEnd deve ser uma data ISO válida' })
  pickupWindowEnd: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressOverrideDto)
  addressOverride?: AddressOverrideDto;
}





