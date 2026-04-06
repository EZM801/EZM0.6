import { toast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  return {
    toast: ({ title, description, variant = 'default' }: ToastOptions) => {
      toast(variant === 'destructive' ? 'error' : 'success', {
        description: title,
        action: description ? {
          label: description,
          onClick: () => {},
        } : undefined,
      });
    },
  };
} 