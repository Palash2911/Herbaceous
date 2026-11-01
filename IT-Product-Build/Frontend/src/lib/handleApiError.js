import { toast } from "sonner";

export function handleApiError(error, fallback = "Something went wrong") {
  if (error?.status === 401) {
    toast.error("Your session expired, please sign in again");
    return;
  }
  toast.error(error?.message || fallback);
}
