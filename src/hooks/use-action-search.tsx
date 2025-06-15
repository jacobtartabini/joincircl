
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MessageSquare, Atom, Briefcase, Users, Settings, Bell } from 'lucide-react';
import type { Action } from '@/components/ui/action-search-bar';

interface UseActionSearchProps {
  onAddContact?: () => void;
  onAddKeystone?: () => void;
  onAddInteraction?: () => void;
}

export function useActionSearch({ 
  onAddContact, 
  onAddKeystone, 
  onAddInteraction 
}: UseActionSearchProps = {}) {
  const navigate = useNavigate();

  // Memoize the navigation handlers to prevent recreating functions
  const handleNavigateToAI = useCallback(() => navigate('/ai-assistant'), [navigate]);
  const handleNavigateToCircles = useCallback(() => navigate('/circles'), [navigate]);
  const handleNavigateToCareer = useCallback(() => navigate('/career-hub'), [navigate]);
  const handleNavigateToEvents = useCallback(() => navigate('/events'), [navigate]);
  const handleNavigateToNotifications = useCallback(() => navigate('/notifications'), [navigate]);
  const handleNavigateToSettings = useCallback(() => navigate('/settings'), [navigate]);

  const actions = useMemo<Action[]>(() => {
    console.log('Creating actions array');
    return [
      {
        id: 'add-contact',
        label: 'Add Contact',
        description: 'Create a new contact in your network',
        category: 'Contact Management',
        shortcut: '⌘N',
        icon: <Plus className="h-5 w-5 text-[#0daeec]" />,
        handler: onAddContact || (() => {}),
      },
      {
        id: 'create-keystone',
        label: 'Create Event',
        description: 'Add a new keystone or important date',
        category: 'Event Management',
        shortcut: '⌘E',
        icon: <Calendar className="h-5 w-5 text-green-500" />,
        handler: onAddKeystone || (() => {}),
      },
      {
        id: 'log-interaction',
        label: 'Log Interaction',
        description: 'Record a conversation or meeting',
        category: 'Contact Management',
        shortcut: '⌘I',
        icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
        handler: onAddInteraction || (() => {}),
      },
      {
        id: 'ask-arlo',
        label: 'Ask Arlo',
        description: 'Get AI assistance and insights',
        category: 'AI Features',
        shortcut: '⌘A',
        icon: (
          <>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <linearGradient id="atom-gradient-search" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0092ca" />
                  <stop offset="50%" stopColor="#a21caf" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <Atom className="h-5 w-5" stroke="url(#atom-gradient-search)" strokeWidth="2" />
          </>
        ),
        handler: handleNavigateToAI,
      },
      {
        id: 'view-circles',
        label: 'View Circles',
        description: 'Browse all your contacts',
        category: 'Navigation',
        shortcut: '⌘C',
        icon: <Users className="h-5 w-5 text-blue-500" />,
        handler: handleNavigateToCircles,
      },
      {
        id: 'add-job-application',
        label: 'Add Job Application',
        description: 'Track a new job opportunity',
        category: 'Career Tools',
        icon: <Briefcase className="h-5 w-5 text-orange-500" />,
        handler: handleNavigateToCareer,
      },
      {
        id: 'view-events',
        label: 'View Events',
        description: 'See upcoming keystones and dates',
        category: 'Event Management',
        icon: <Calendar className="h-5 w-5 text-amber-500" />,
        handler: handleNavigateToEvents,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        description: 'View recent updates and alerts',
        category: 'Navigation',
        icon: <Bell className="h-5 w-5 text-red-500" />,
        handler: handleNavigateToNotifications,
      },
      {
        id: 'settings',
        label: 'Settings',
        description: 'Manage your account and preferences',
        category: 'Navigation',
        shortcut: '⌘,',
        icon: <Settings className="h-5 w-5 text-gray-500" />,
        handler: handleNavigateToSettings,
      },
    ];
  }, [
    onAddContact, 
    onAddKeystone, 
    onAddInteraction,
    handleNavigateToAI,
    handleNavigateToCircles,
    handleNavigateToCareer,
    handleNavigateToEvents,
    handleNavigateToNotifications,
    handleNavigateToSettings
  ]);

  return { actions };
}
