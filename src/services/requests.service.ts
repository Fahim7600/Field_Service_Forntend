import { apiGet, apiPost } from "@/lib/api-client";
import type {
  CreateServiceRequestPayload,
  ServiceCategory,
  ServiceRequestAttachment,
  ServiceRequestCreated,
} from "@/types/api";

export const requestsService = {
  /**
   * Retrieves all available service categories from catalog.
   */
  async fetchCategories(): Promise<ServiceCategory[]> {
    return apiGet<ServiceCategory[]>("/service-categories");
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
