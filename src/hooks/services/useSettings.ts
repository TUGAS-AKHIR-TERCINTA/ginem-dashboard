import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiGet } from "@/hooks/api";
import { useApiErrorHandler } from "@/hooks/api/useApiErrorHandler";
import { queryKeys } from "@/services/query-keys";
import {
  SETTINGS_API,
  settingsService,
  type WhatsappQrData,
  type WhatsappStatusData,
} from "@/services/settingsService";

export function useWhatsappStatusQuery() {
  return useApiGet<WhatsappStatusData>(SETTINGS_API.whatsappStatus);
}

export function useWhatsappQrQuery(options: {
  enabled: boolean;
  refetchInterval?: number | false;
}) {
  return useApiGet<WhatsappQrData>(SETTINGS_API.whatsappConnect, options);
}

export function useDisconnectWhatsappMutation() {
  const onError = useApiErrorHandler();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsService.disconnectWhatsapp,
    onError,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.get(SETTINGS_API.whatsappStatus),
      });
    },
  });
}
