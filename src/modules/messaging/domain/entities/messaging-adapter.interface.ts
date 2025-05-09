/**
 * Messaging Adapter Interface
 * Abstracts the messaging system functionality
 */
export interface IMessagingAdapter {
  publish(subject: string, data: any): Promise<void>;
  request<T = any>(subject: string, data: any, timeout?: number): Promise<T>;
}

export const MESSAGING_ADAPTER = 'MESSAGING_ADAPTER';
