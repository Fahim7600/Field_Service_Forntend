import { apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CreateServiceReportPayload,
  PaginatedResponse,
  ServiceReportDetail,
  TechnicianTask,
  TechnicianTasksQueryParams,
  WorkOrder,
} from "@/types/api";

export const technicianService = {
  /**
   * Retrieves tasks assigned to the authenticated technician with optional single status filter.
   */
  async fetchMyTasks(
    params?: TechnicianTasksQueryParams,
  ): Promise<PaginatedResponse<TechnicianTask>> {
    return apiGetPaginated<TechnicianTask>("/work-orders/my-assigned", {
      params,
    });
  },

  /**
   * Alias for fetchMyTasks
   */
  async fetchMyAssignedTasks(
    params?: TechnicianTasksQueryParams,
  ): Promise<PaginatedResponse<TechnicianTask>> {
    return this.fetchMyTasks(params);
  },

  /**
   * Retrieves full work order details by ID for the technician.
   */
  async fetchTaskById(id: string): Promise<WorkOrder> {
    return apiGet<WorkOrder>(`/work-orders/${id}`);
  },

  /**
   * Alias for fetchTaskById
   */
  async fetchWorkOrderById(id: string): Promise<WorkOrder> {
    return this.fetchTaskById(id);
  },

  /**
   * Accepts an assigned work order (moves status to ACCEPTED/keeps in ASSIGNED awaiting scheduling).
   */
  async acceptTask(id: string): Promise<{ id: string; status: string }> {
    return apiPost<{ id: string; status: string }>(`/work-orders/${id}/accept`);
  },

  /**
   * Rejects an assigned work order with a required reason.
   */
  async rejectTask(
    id: string,
    reason: string,
  ): Promise<{ id: string; status: string }> {
    return apiPost<{ id: string; status: string }, { reason: string }>(
      `/work-orders/${id}/reject`,
      { reason },
    );
  },

  /**
   * Updates task status along the state machine (ARRIVED, IN_PROGRESS, COMPLETED).
   */
  async updateTaskStatus(
    id: string,
    status: "ARRIVED" | "IN_PROGRESS" | "COMPLETED",
    notes?: string,
  ): Promise<{ id: string; status: string }> {
    return apiPatch<
      { id: string; status: string },
      { status: string; notes?: string }
    >(`/work-orders/${id}/status`, {
      status,
      ...(notes ? { notes } : {}),
    });
  },

  /**
   * Submits a service report with work done description, parts used, hours spent, and photo attachments.
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
