import { apiDelete, apiGet, apiGetPaginated, apiPost } from "@/lib/api-client";
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
   * Creates a new customer service request.
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
   * Uploads attachments for an existing service request.
   */
  async uploadAttachments(
    id: string,
    formData: FormData,
  ): Promise<ServiceRequestAttachment[]> {
    return apiPost<ServiceRequestAttachment[], FormData>(
      `/service-requests/${id}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
};
