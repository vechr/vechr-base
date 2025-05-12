import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GetConfigurationValidator {
  @IsString()
  @IsOptional()
  name?: string;
}

export class GetConfigurationParameterValidator {
  @IsString()
  @IsNotEmpty()
  paramName: string;
}

export class GetControlListValidator {
  @IsString()
  @IsOptional()
  handlerType?: string;
}
