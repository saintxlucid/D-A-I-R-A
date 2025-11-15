import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ProfileRole } from './types';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsArray()
  @IsEnum(ProfileRole, { each: true })
  profiles: ProfileRole[];
}

export class CreateProfileDto {
  @IsString()
  displayName: string;

  @IsEnum(ProfileRole)
  role: ProfileRole;
}

export class CreatePostDto {
  @IsString()
  content: string;

  @IsString()
  authorId: string;
}
