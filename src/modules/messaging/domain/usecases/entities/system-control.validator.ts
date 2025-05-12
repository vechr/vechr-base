import { IsString, IsOptional } from 'class-validator';

export class GetConfigurationValidator {
  @IsString()
  @IsOptional()
  name?: string;
}

export class GetConfigurationParameterValidator {
  @IsString()
  paramName: string;
}

export class GetControlListValidator {
  @IsString()
  @IsOptional()
  handlerType?: string;
}
