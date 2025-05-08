
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useWelcomeTutorial = () => {
  const { user, hasSeenTutorial, setHasSeenTutorial } = useAuth();

  useEffect(() => {
    // Save that the user has seen the tutorial
    if (!hasSeenTutorial && user) {
      const updateUserTutorialStatus = async () => {
        try {
          // Safely update the profile with the has_seen_tutorial property
          const { error } = await supabase
            .from('profiles')
            .update({ has_seen_tutorial: true })
            .eq('id', user.id);
            
          if (!error) {
            setHasSeenTutorial(true);
          } else {
            console.error("Error updating tutorial status:", error);
          }
        } catch (error) {
          console.error("Error updating tutorial status:", error);
        }
      };
      
      updateUserTutorialStatus();
    }
  }, [user, hasSeenTutorial, setHasSeenTutorial]);
};
