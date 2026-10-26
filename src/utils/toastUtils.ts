import { toast } from 'react-hot-toast';

export function showSuccess(message: string) {
  toast.success(message, { duration: 3000 });
}

export function showError(message: string) {
  toast.error(message, { duration: 4000 });
}
