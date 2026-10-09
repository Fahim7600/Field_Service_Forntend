import {
  apiGet,
  apiGetPaginated,
  apiPatch,
  apiPost,
  apiPostForm,
} from "@/lib/api-client";
import type {
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
   * Submits a service report with work done description, parts used, hours spent, and photo attachments as multipart/form-data.
   */
  async submitServiceReport(
    id: string,
    payload:
      | {
          workDone: string;
          partsUsed: string;
          hoursSpent: number;
          photos?: (File | { file: File })[];
        }
      | FormData,
    onProgress?: (percent: number) => void,
  ): Promise<{
    id: string;
    workOrderId: string;
    workDone: string;
    hoursSpent: number;
    report?: ServiceReportDetail;
  }> {
    if (payload instanceof FormData) {
      return apiPostForm<{
        id: string;
        workOrderId: string;
        workDone: string;
        hoursSpent: number;
        report?: ServiceReportDetail;
      }>(`/work-orders/${id}/service-report`, payload, {
        onUploadProgress: onProgress,
      });
    }

    const formData = new FormData();
    formData.append("workDone", payload.workDone);
    formData.append("partsUsed", payload.partsUsed || "None");
    formData.append("hoursSpent", String(payload.hoursSpent));

    if (payload.photos && Array.isArray(payload.photos)) {
      for (const item of payload.photos) {
        if (item instanceof File) {
          formData.append("photos", item);
        } else if (
          item &&
          typeof item === "object" &&
          "file" in item &&
          item.file instanceof File
        ) {
          formData.append("photos", item.file);
        }
      }
    }

    return apiPostForm<{
      id: string;
      workOrderId: string;
      workDone: string;
      hoursSpent: number;
      report?: ServiceReportDetail;
    }>(`/work-orders/${id}/service-report`, formData, {
      onUploadProgress: onProgress,
    });
  },
};
