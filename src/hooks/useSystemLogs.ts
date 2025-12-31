import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

export function useSystemLogs() {
  const { user } = useUser();

  const logAction = async (action: string, details?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          user_name: user.name,
          user_role: user.role,
          action,
          details,
        });

      if (error) {
        console.error('Error logging action:', error);
      }
    } catch (err) {
      console.error('Error logging action:', err);
    }
  };

  const getSystemLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching system logs:', err);
      return [];
    }
  };

  return { logAction, getSystemLogs };
}
