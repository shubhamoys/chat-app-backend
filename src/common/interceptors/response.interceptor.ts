import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  ApiResponseData,
} from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: any) => {
        // If the response is already in the correct format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Transform the data into the standard API response format
        const response: ApiResponse<T> = {
          success: true,
          message: data?.message || 'Operation completed successfully',
          data: this.transformData(data),
        };

        return response;
      }),
    );
  }

  private transformData(data: any): ApiResponseData<T> | undefined {
    if (!data) {
      return undefined;
    }

    // If data has a message property, remove it from the transformed data
    const { message, ...rest } = data;

    // Check if the response is already properly formatted with pagination structure
    if (
      rest &&
      typeof rest === 'object' &&
      'totalCount' in rest &&
      'currentCount' in rest &&
      'page' in rest
    ) {
      // Already has proper pagination structure, return as is
      return rest;
    }

    // Handle paginated responses with items array
    if (rest.items && Array.isArray(rest.items)) {
      const resourceName = this.getResourceName(rest.items[0]);
      return {
        currentCount: rest.items.length,
        totalCount: rest.totalCount || rest.items.length,
        page: rest.page || null,
        [resourceName]: rest.items,
      };
    }

    // Handle single resource responses (like individual user, message, etc.)
    if (rest && typeof rest === 'object' && (rest._id || rest.id)) {
      const resourceName = this.getResourceName(rest);
      return {
        currentCount: null,
        totalCount: null,
        page: null,
        [resourceName]: rest,
      };
    }

    // Fallback for other data structures
    return {
      currentCount: null,
      totalCount: null,
      page: null,
      data: rest,
    };
  }

  private getResourceName(item: any): string {
    if (!item) return 'data';

    // Try to determine resource name from the constructor name
    const constructorName = item.constructor?.name;
    if (constructorName && constructorName !== 'Object') {
      return constructorName.toLowerCase() + 's';
    }

    // Default resource names based on common patterns
    if (item._id || item.id) {
      if (item.username || item.email) return 'users';
      if (item.from && item.to) return 'friendRequests';
      if (item.chatId || item.participants) return 'conversations';
      if (item.content || item.sender) return 'messages';
    }

    return 'data';
  }
}
