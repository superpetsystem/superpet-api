import { IsUUID, IsUrl, IsDateString, IsOptional } from 'class-validator';

export class CreateStreamDto {
  @IsUUID('4', { message: 'petId deve ser um UUID válido' })
  petId: string;

  @IsOptional()
  @IsUUID('4')
  serviceContextId?: string;

  @IsUrl({}, { message: 'streamUrl deve ser uma URL válida' })
  streamUrl: string;

  @IsDateString({}, { message: 'expiresAt deve ser uma data ISO válida' })
  expiresAt: string;
}


