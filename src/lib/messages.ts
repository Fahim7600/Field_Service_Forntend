import { authMessages } from "@/lib/auth-messages";

export interface MessageItem {
  title: string;
  description?: string;
}

export const messages = {
  requests: {
    submitted: {
      title: "Request submitted",
      description: "Our team will review your details shortly.",
    },
    updated: {
      title: "Request updated",
      description: "Your changes have been saved.",
    },
    cancelled: {
      title: "Request cancelled",
      description: "The service request has been cancelled.",
    },
    rescheduled: {
      title: "Visit rescheduled",
      description: "Your preferred schedule has been updated.",
    },
    photosFailed: {
      title: "Photos could not be attached",
      description:
        "Your request was saved. You can upload photos on the request page.",
    },
  },
  dispatch: {
    approved: {
      title: "Request approved",
      description: "The work order has been created and queued for dispatch.",
    },
    rejected: {
      title: "Request rejected",
      description: "The customer has been notified of the rejection.",
    },
    assigned: {
      title: "Technician assigned",
      description: "The technician has been assigned to this work order.",
    },
    scheduleSet: {
      title: "Visit scheduled",
      description: "The technician visit time has been set.",
    },
    scheduleConflict: {
      title: "Schedule conflict",
      description:
        "That time is already booked for this technician. Pick another time.",
    },
    reassigned: {
      title: "Technician reassigned",
      description: "The assignment has been updated.",
    },
  },
  tasks: {
    accepted: {
      title: "Assignment accepted",
      description: "The task is confirmed on your schedule.",
    },
    rejected: {
      title: "Assignment declined",
      description: "The task has been returned to the dispatch queue.",
    },
    statusUpdated: {
      title: "Status updated",
      description: "The work order milestone has been updated.",
    },
    reportSubmitted: {
      title: "Service report submitted",
      description: "The report and job completion have been recorded.",
    },
    reportRetry: {
      title: "Report upload retried",
      description: "Uploading diagnostic photos and report details.",
    },
  },
  invoices: {
    created: {
      title: "Invoice created",
      description: "A new draft invoice has been generated.",
    },
    updated: {
      title: "Invoice updated",
      description: "Invoice line items and notes have been saved.",
    },
    issued: {
      title: "Invoice issued",
      description: "The customer can now pay this invoice online.",
    },
    voided: {
      title: "Invoice voided",
      description: "The invoice has been voided and can no longer be paid.",
    },
  },
  payments: {
    redirectingToStripe: {
      title: "Redirecting to checkout",
      description: "You will be redirected to complete your payment securely.",
    },
    refunded: {
      title: "Payment refunded",
      description: "The refund has been processed successfully.",
    },
    refundFailed: {
      title: "Refund failed",
      description:
        "Could not process the refund. Please check transaction details.",
    },
  },
  premium: {
    checkoutStarted: {
      title: "Starting membership setup",
      description: "Redirecting to Stripe to activate your plan.",
    },
    renewalCancelled: {
      title: "Renewal cancelled",
      description:
        "Your membership benefits will remain active until the period ends.",
    },
    renewalResumed: {
      title: "Renewal resumed",
      description: "Your automatic subscription renewal has been reactivated.",
    },
  },
  feedback: {
    submitted: {
      title: "Feedback submitted",
      description: "Thank you for rating your service experience.",
    },
    alreadyRated: {
      title: "Already reviewed",
      description:
        "A rating has already been submitted for this service visit.",
    },
  },
  profile: {
    updated: {
      title: "Profile updated",
      description: "Your account details have been saved.",
    },
    passwordChanged: {
      title: "Password updated",
      description: "Your new password is now active.",
    },
    skillsSaved: {
      title: "Skills updated",
      description: "Your certified skills have been updated.",
    },
  },
  admin: {
    userRoleChanged: {
      title: "User role updated",
      description: "The user permissions have been adjusted.",
    },
    userStatusChanged: {
      title: "User status updated",
      description: "The account status has been changed.",
    },
    categorySaved: {
      title: "Category saved",
      description: "Service catalog category has been saved.",
    },
    skillSaved: {
      title: "Skill saved",
      description: "Technician skill has been saved.",
    },
    deleted: {
      title: "Item deleted",
      description: "The record has been permanently removed.",
    },
  },
  notifications: {
    allRead: {
      title: "All notifications read",
      description: "All unread notification badges have been cleared.",
    },
  },
  generic: {
    saved: {
      title: "Changes saved",
      description: "Your updates have been applied.",
    },
    deleted: {
      title: "Deleted",
      description: "The item has been removed.",
    },
    copied: {
      title: "Copied to clipboard",
      description: "The text has been copied.",
    },
    networkProblem: {
      title: "Connection problem",
      description: "The server may be waking up, please try again in a moment.",
    },
    forbidden: {
      title: "Access denied",
      description: "You do not have permission to do this.",
    },
    notFound: {
      title: "Not found",
      description: "The requested record could not be found.",
    },
    tryAgain: {
      title: "Action failed",
      description: "Please try again in a few moments.",
    },
    validation: {
      title: "Validation error",
      description: "Please check the form inputs and try again.",
    },
  },
} as const;

export { authMessages };
