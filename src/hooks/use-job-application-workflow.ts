
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type WorkflowStage = 
  | 'application_info'
  | 'resume_review'
  | 'network_discovery'
  | 'interviewer_research'
  | 'interview_prep'
  | 'company_research'
  | 'follow_up';

export interface StageCompletion {
  [key: string]: {
    completed: boolean;
    progress: number;
    lastUpdated: string;
  };
}

export interface JobApplicationWorkflow {
  id: string;
  job_title: string;
  company_name: string;
  workflow_stage: WorkflowStage;
  stage_completion: StageCompletion;
  arlo_insights: Record<string, any>;
  status: string;
  applied_date?: string;
  created_at: string;
}

export function useJobApplicationWorkflow(applicationId?: string) {
  const [workflow, setWorkflow] = useState<JobApplicationWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const stages: { key: WorkflowStage; title: string; description: string }[] = [
    {
      key: 'application_info',
      title: 'Application Info',
      description: 'Add job details and upload job description'
    },
    {
      key: 'resume_review',
      title: 'Resume Review',
      description: 'AI analysis and tailored improvements'
    },
    {
      key: 'network_discovery',
      title: 'Network Discovery',
      description: 'Find relevant connections in your network'
    },
    {
      key: 'interviewer_research',
      title: 'Interviewer Research',
      description: 'Research your interviewers and their backgrounds'
    },
    {
      key: 'interview_prep',
      title: 'Interview Prep',
      description: 'Practice questions and mock interviews'
    },
    {
      key: 'company_research',
      title: 'Company Research',
      description: 'Learn about company culture and prepare questions'
    },
    {
      key: 'follow_up',
      title: 'Follow-Up & Notes',
      description: 'Post-interview reflections and thank you tracking'
    }
  ];

  const fetchWorkflow = async () => {
    if (!user || !applicationId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setWorkflow(data as JobApplicationWorkflow);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStageCompletion = async (stage: WorkflowStage, progress: number, completed: boolean = false) => {
    if (!workflow || !user) return;

    const updatedCompletion = {
      ...workflow.stage_completion,
      [stage]: {
        completed,
        progress,
        lastUpdated: new Date().toISOString()
      }
    };

    try {
      const { error } = await supabase
        .from('job_applications')
        .update({
          stage_completion: updatedCompletion,
          workflow_stage: completed ? getNextStage(stage) : stage
        })
        .eq('id', workflow.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWorkflow(prev => prev ? {
        ...prev,
        stage_completion: updatedCompletion,
        workflow_stage: completed ? getNextStage(stage) : stage
      } : null);
    } catch (error) {
      console.error('Error updating stage completion:', error);
    }
  };

  const saveStageData = async (stage: WorkflowStage, data: Record<string, any>) => {
    if (!workflow || !user) return;

    try {
      const { error } = await supabase
        .from('application_workflow_data')
        .upsert({
          job_application_id: workflow.id,
          user_id: user.id,
          stage,
          data
        }, {
          onConflict: 'job_application_id,stage'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving stage data:', error);
    }
  };

  const getNextStage = (currentStage: WorkflowStage): WorkflowStage => {
    const currentIndex = stages.findIndex(s => s.key === currentStage);
    const nextIndex = Math.min(currentIndex + 1, stages.length - 1);
    return stages[nextIndex].key;
  };

  const getOverallProgress = () => {
    if (!workflow) return 0;
    
    const completedStages = Object.values(workflow.stage_completion).filter(
      stage => stage?.completed
    ).length;
    
    return Math.round((completedStages / stages.length) * 100);
  };

  useEffect(() => {
    fetchWorkflow();
  }, [applicationId, user]);

  return {
    workflow,
    stages,
    isLoading,
    updateStageCompletion,
    saveStageData,
    getOverallProgress,
    refetch: fetchWorkflow
  };
}
