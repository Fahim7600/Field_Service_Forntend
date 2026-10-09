import { apiGet, apiGetPaginated } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  WorkOrder,
  WorkOrderStatusHistoryItem,
  WorkOrdersQueryParams,
} from "@/types/work-order";

export const workOrdersService = {
  /**
   * Retrieves a paginated list of work orders with optional filtering and sorting.
   * Status accepts a single WorkOrderStatus value per OpenAPI specification.
   */
  async fetchWorkOrders(
    params?: WorkOrdersQueryParams,
  ): Promise<PaginatedResponse<WorkOrder>> {
    return apiGetPaginated<WorkOrder>("/work-orders", {
      params,
    });
  },

  /**
   * Retrieves full details for a single work order by ID.
   */
  async fetchWorkOrderById(id: string): Promise<WorkOrder> {
    return apiGet<WorkOrder>(`/work-orders/${id}`);
  },

  /**
   * Retrieves chronological status transition history for a work order.
   */
  async fetchWorkOrderHistory(
    id: string,
  ): Promise<WorkOrderStatusHistoryItem[]> {
    return apiGet<WorkOrderStatusHistoryItem[]>(`/work-orders/${id}/history`);
  },
};
