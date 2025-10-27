import { IsObject, IsNotEmpty } from 'class-validator';

export class UpdateFeatureLimitsDto {
  @IsObject()
  @IsNotEmpty()
  limits: any;
}




