import { useQuery, useQueryClient } from "@tanstack/react-query";
import { modsActions } from "@/actions/mods";

export const MODS_QUERY_KEY = ["mods"];

export function useMods() {
  return useQuery({
    queryKey: MODS_QUERY_KEY,
    queryFn: () => modsActions.list(),
  });
}

export function useModsMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: MODS_QUERY_KEY });

  return {
    invalidate,
    enable: async (name: string) => {
      await modsActions.enable(name);
      await invalidate();
    },
    disable: async (name: string) => {
      await modsActions.disable(name);
      await invalidate();
    },
    reorder: async (enabledNames: string[]) => {
      await modsActions.reorder(enabledNames);
      await invalidate();
    },
    autoSort: async () => modsActions.autoSort(),
    enableAll: async () => {
      await modsActions.enableAll();
      await invalidate();
    },
    disableAll: async () => {
      await modsActions.disableAll();
      await invalidate();
    },
  };
}
