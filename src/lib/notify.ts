import { toast } from "sonner";

export function notifyError(title: string, description?: string) {
  toast.error(title, description ? { description } : undefined);
}

export function notifySuccess(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined);
}

export function notifyWarning(title: string, description?: string) {
  toast.warning(title, description ? { description } : undefined);
}

export function notifyInfo(title: string, description?: string) {
  toast.info(title, description ? { description } : undefined);
}
