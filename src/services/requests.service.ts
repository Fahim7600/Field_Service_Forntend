import {
  apiDelete,
  apiGet,
  apiGetPaginated,
  apiPatch,
  apiPost,
  apiPostForm,
} from "@/lib/api-client";
import { appendFiles } from "@/lib/uploads";
import type {
  CreateServiceRequestPayload,
  CustomerRequestDetail,
  CustomerRequestListItem,
  PaginatedResponse,
  ServiceCategory,
  ServiceRequestAttachment,
  ServiceRequestCreated,
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
  ): Promise<PaginatedResponse<CustomerRequestListItem>> {
    return apiGetPaginated<CustomerRequestListItem>("/service-requests", {
      params,
    });
  },

  /**
   * Searches customer service requests by text query.
   */
  async searchMyRequests(
    q: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<CustomerRequestListItem>> {
    return apiGetPaginated<CustomerRequestListItem>(
      "/service-requests/search",
      {
        params: {
          q,
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      },
    );
  },

  /**
   * Retrieves full service request details by ID.
   */
  async fetchRequestById(id: string): Promise<CustomerRequestDetail> {
    return apiGet<CustomerRequestDetail>(`/service-requests/${id}`);
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
   * Updates an editable SUBMITTED service request.
   */
  async updateRequest(
    id: string,
    payload: Partial<CreateServiceRequestPayload>,
  ): Promise<{ id: string }> {
    return apiPatch<{ id: string }, Partial<CreateServiceRequestPayload>>(
      `/service-requests/${id}`,
      payload,
    );
  },

  /**
   * Deletes / cancels a pending service request (allowed only for SUBMITTED).
   */
  async deleteRequest(id: string): Promise<null> {
    return apiDelete<null>(`/service-requests/${id}`);
  },

  /**
   * Alias for deleteRequest for backwards compatibility.
   */
  async cancelServiceRequest(id: string): Promise<null> {
    return this.deleteRequest(id);
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
