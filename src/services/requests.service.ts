import {
  apiDelete,
  apiGet,
  apiGetPaginated,
  apiPost,
  apiPostForm,
} from "@/lib/api-client";
import { appendFiles } from "@/lib/uploads";
import type {
  CreateServiceRequestPayload,
  PaginatedResponse,
  ServiceCategory,
  ServiceRequestAttachment,
  ServiceRequestCreated,
  ServiceRequestDetail,
  ServiceRequestListItem,
  ServiceRequestQueryParams,
} from "@/types/api";

export const requestsService = {
  /**
   * Retrieves all available service categories from catalog.
   */
  async fetchCategories(): Promise<ServiceCategory[]> {
    return apiGet<ServiceCategory[]>("/service-categories");
  },

  /**
   * Retrieves paginated list of service requests with optional filters.
   */
  async fetchMyRequests(
    params?: ServiceRequestQueryParams,
  ): Promise<PaginatedResponse<ServiceRequestListItem>> {
    return apiGetPaginated<ServiceRequestListItem>("/service-requests", {
      params,
    });
  },

  /**
   * Retrieves single service request details by ID.
   */
  async fetchRequestById(id: string): Promise<ServiceRequestDetail> {
    return apiGet<ServiceRequestDetail>(`/service-requests/${id}`);
  },

  /**
   * Creates a new customer service request (pure JSON payload).
   */
  async createServiceRequest(
    payload: CreateServiceRequestPayload,
  ): Promise<ServiceRequestCreated> {
    return apiPost<ServiceRequestCreated, CreateServiceRequestPayload>(
      "/service-requests",
      payload,
    );
  },

  /**
   * Cancels/deletes a pending service request.
   */
  async cancelServiceRequest(id: string): Promise<null> {
    return apiDelete<null>(`/service-requests/${id}`);
  },

  /**
   * Uploads binary attachments for an existing service request as multipart/form-data.
   * Field name in OpenAPI: "files".
   */
  async uploadAttachments(
    id: string,
    filesOrFormData: (File | Blob)[] | FormData,
    onProgress?: (percent: number) => void,
  ): Promise<ServiceRequestAttachment[]> {
    let formData: FormData;
    if (filesOrFormData instanceof FormData) {
      formData = filesOrFormData;
    } else {
      formData = new FormData();
      appendFiles(formData, "files", filesOrFormData);
    }

    return apiPostForm<ServiceRequestAttachment[]>(
      `/service-requests/${id}/attachments`,
      formData,
      {
        onUploadProgress: onProgress,
      },
    );
  },

  /**
   * Deletes a single attachment from a service request.
   */
  async deleteAttachment(id: string, attachmentId: string): Promise<null> {
    return apiDelete<null>(
      `/service-requests/${id}/attachments/${attachmentId}`,
    );
  },
};
