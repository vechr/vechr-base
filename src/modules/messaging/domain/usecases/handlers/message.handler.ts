import {
  ErrorResponse,
  IErrorResponse,
  log,
  SuccessResponse,
} from '@/frameworks';
import { HandlerRegistryService } from '@/modules/messaging/domain/usecases/services/handler-registry.service';

export class MessageHandler {
  constructor(protected readonly handlerRegistry: HandlerRegistryService) {}

  public messageType: string = '';
  protected methods: Array<{ name: string; description: string }> = [];

  /**
   * Register all system monitor control methods with the global registry
   */
  protected registrationControls(messageType: string): void {
    this.messageType = messageType;
    this.registerControls(this.methods);
  }

  /**
   * Register a control method with the global registry
   */
  protected registerControl(name: string, description: string): void {
    if (!this.messageType) {
      log.warn('Cannot register control: messageType is not set');
      return;
    }
    this.handlerRegistry.registerControl(this.messageType, name, description);
  }

  /**
   * Register multiple control methods at once
   */
  protected registerControls(
    controls: Array<{ name: string; description: string }>,
  ): void {
    if (!this.messageType) {
      log.warn('Cannot register controls: messageType is not set');
      return;
    }
    this.handlerRegistry.registerControls(this.messageType, controls);
  }

  protected createSuccessResponse<T>(
    message: string,
    data: T,
  ): SuccessResponse<T> {
    return new SuccessResponse(message, data);
  }

  protected createErrorResponse(
    message: string,
    error: IErrorResponse,
  ): ErrorResponse {
    return new ErrorResponse(message, error);
  }
}
