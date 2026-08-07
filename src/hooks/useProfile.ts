import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth';

export interface Profile {
  id: string;
  fullName: string | null;
  phone: string | null;
}

/** Auth-adjacent, not catalogue data, so this talks to Supabase directly
 * rather than going through `catalogService` — that layer is reserved for
 * the swappable commerce domain (see lib/services). */
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
      if (error) throw error;
      return { id: data.id, fullName: data.full_name, phone: data.phone };
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { fullName?: string; phone?: string }) => {
      const row: Record<string, unknown> = {};
      if (patch.fullName !== undefined) row.full_name = patch.fullName;
      if (patch.phone !== undefined) row.phone = patch.phone;
      const { error } = await supabase.from('profiles').update(row).eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}
