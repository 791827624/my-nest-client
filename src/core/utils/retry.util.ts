export class RetryUtil {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    onError: (error: any) => void,
    delayMs = 1000,
  ): Promise<T> {
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        onError(error);

        if (attempt > maxRetries) {
          throw new Error(`Operation failed after ${maxRetries} retries`);
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
    throw new Error('Unreachable code');
  }
}
