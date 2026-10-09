import { apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CustomerServiceHistoryItem,
  CustomerServiceHistoryQueryParams,
  PaginatedResponse,
} from "@/types/api";
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

  /**
   * Cancels a work order before technician arrival.
   */
  async cancelWorkOrder(
    id: string,
    reason?: string,
  ): Promise<{ id: string; status: string }> {
    const payload = {
      reason:
        reason && reason.trim().length >= 5
          ? reason.trim()
          : "Customer requested cancellation.",
    };
    return apiPost<{ id: string; status: string }, { reason: string }>(
      `/work-orders/${id}/cancel`,
      payload,
    );
  },

  /**
   * Reschedules a scheduled work order to a new visit start and end window.
   */
  async rescheduleWorkOrder(
    id: string,
    payload: { visitStart: string; visitEnd: string },
  ): Promise<{ id: string; scheduledDate?: string }> {
    return apiPatch<
      { id: string; scheduledDate?: string },
      { visitStart: string; visitEnd: string }
    >(`/work-orders/${id}/reschedule`, payload);
  },

  /**
   * Retrieves customer completed service history.
   */
  async fetchCustomerServiceHistory(
    params?: CustomerServiceHistoryQueryParams,
  ): Promise<PaginatedResponse<CustomerServiceHistoryItem>> {
    return apiGetPaginated<CustomerServiceHistoryItem>(
      "/customers/me/service-history",
      {
        params,
      },
    );
  },
};
