
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CareerStats {
  activeApplications: number;
  upcomingInterviews: number;
  completedSessions: number;
  careerContacts: number;
  overallProgress: number;
}

export function useCareerData() {
  const [stats, setStats] = useState<CareerStats>({
    activeApplications: 0,
    upcomingInterviews: 0,
    completedSessions: 0,
    careerContacts: 0,
    overallProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCareerStats = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch job applications
      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id);

      // Fetch interview sessions
      const { data: sessions } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id);

      // Fetch career contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .or('career_priority.eq.true,career_tags.not.is.null');

      const activeApplications = applications?.filter(app => 
        ['applied', 'interviewing'].includes(app.status)
      ).length || 0;

      const upcomingInterviews = applications?.filter(app => 
        app.interview_date && new Date(app.interview_date) > new Date()
      ).length || 0;

      const completedSessions = sessions?.length || 0;
      const careerContacts = contacts?.length || 0;

      // Calculate overall progress based on activity
      const totalActivity = activeApplications + completedSessions + careerContacts;
      const overallProgress = Math.min(Math.round((totalActivity / 20) * 100), 100);

      setStats({
        activeApplications,
        upcomingInterviews,
        completedSessions,
        careerContacts,
        overallProgress
      });
    } catch (error) {
      console.error('Error fetching career stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerStats();
  }, [user]);

  return { stats, isLoading, refetch: fetchCareerStats };
}
