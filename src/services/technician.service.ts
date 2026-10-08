import { apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CreateServiceReportPayload,
  PaginatedResponse,
  RejectWorkOrderPayload,
  ServiceReportDetail,
  UpdateWorkOrderStatusPayload,
  WorkOrderFullDetail,
  WorkOrderSummary,
  WorkOrdersQueryParams,
} from "@/types/api";

export const technicianService = {
  /**
   * Retrieves active tasks assigned to the authenticated technician (ASSIGNED, SCHEDULED, ARRIVED, IN_PROGRESS).
   */
  async fetchMyAssignedTasks(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WorkOrderSummary>> {
    return apiGetPaginated<WorkOrderSummary>("/work-orders/my-assigned", {
      params,
    });
  },

  /**
   * Retrieves work orders with status filter (e.g. for completed history or specific statuses).
   */
  async fetchWorkOrders(
    params?: WorkOrdersQueryParams,
  ): Promise<PaginatedResponse<WorkOrderSummary>> {
    return apiGetPaginated<WorkOrderSummary>("/work-orders", {
      params,
    });
  },

  /**
   * Retrieves full work order details by ID including service request, attachments, and service report.
   */
  async fetchWorkOrderById(id: string): Promise<WorkOrderFullDetail> {
    const res = await apiGet<{ workOrder: WorkOrderFullDetail }>(
      `/work-orders/${id}`,
    );
    return res.workOrder;
  },

  /**
   * Accepts an assigned work order.
   */
  async acceptTask(id: string): Promise<unknown> {
    return apiPost<unknown>(`/work-orders/${id}/accept`);
  },

  /**
   * Rejects an assigned work order with a required reason.
   */
  async rejectTask(
    id: string,
    payload: RejectWorkOrderPayload,
  ): Promise<unknown> {
    return apiPost<unknown, RejectWorkOrderPayload>(
      `/work-orders/${id}/reject`,
      payload,
    );
  },

  /**
   * Updates task status along the state machine (ARRIVED, IN_PROGRESS, COMPLETED).
   */
  async updateTaskStatus(
    id: string,
    payload: UpdateWorkOrderStatusPayload,
  ): Promise<{ workOrder: WorkOrderSummary }> {
    return apiPatch<
      { workOrder: WorkOrderSummary },
      UpdateWorkOrderStatusPayload
    >(`/work-orders/${id}/status`, payload);
  },

  /**
   * Submits a service report with work done description, parts used, hours spent, and optional photo attachments.
   */
  async submitServiceReport(
    id: string,
    payload: CreateServiceReportPayload | FormData,
  ): Promise<{ report: ServiceReportDetail }> {
    if (payload instanceof FormData) {
      return apiPost<{ report: ServiceReportDetail }, FormData>(
        `/work-orders/${id}/service-report`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    }

    // Build FormData if files are present in the payload
    if (payload.files && payload.files.length > 0) {
      const formData = new FormData();
      formData.append("workDone", payload.workDone);
      formData.append("hoursSpent", String(payload.hoursSpent));
      if (payload.partsUsed) {
        formData.append(
          "partsUsed",
          typeof payload.partsUsed === "string"
            ? payload.partsUsed
            : JSON.stringify(payload.partsUsed),
        );
      }
      for (const file of payload.files) {
        formData.append("photos", file);
      }

      return apiPost<{ report: ServiceReportDetail }, FormData>(
        `/work-orders/${id}/service-report`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    }

    return apiPost<
      { report: ServiceReportDetail },
      Omit<CreateServiceReportPayload, "files">
    >(`/work-orders/${id}/service-report`, {
      workDone: payload.workDone,
      hoursSpent: payload.hoursSpent,
      partsUsed: payload.partsUsed,
    });
  },
};
