import { IsString, MinLength, MaxLength } from 'class-validator';

export class SetActionPasswordDto {
  @IsString()
  @MinLength(4)
  @MaxLength(128)
  password!: string;
}