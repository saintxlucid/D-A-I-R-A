import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  authorId?: string;
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaInput)
  media?: MediaInput[];
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  content?: string;
}

export class MediaInput {
  @IsString()
  url: string;

  @IsString()
  type: string;
}
