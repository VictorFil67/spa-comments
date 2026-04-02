import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsNotEmpty,
  IsInt,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only alphanumeric characters',
  })
  @MaxLength(100)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsUrl({}, { message: 'Home page must be a valid URL' })
  @MaxLength(500)
  homePage?: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsString()
  @IsNotEmpty()
  captchaId: string;

  @IsString()
  @IsNotEmpty()
  captchaValue: string;
}
