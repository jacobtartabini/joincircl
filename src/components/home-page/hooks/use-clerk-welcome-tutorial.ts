
import { useEffect } from "react";
import { useAuth } from "@/contexts/ClerkAuthContext";

export const useClerkWelcomeTutorial = () => {
  const { user, hasSeenTutorial, setHasSeenTutorial } = useAuth();

  useEffect(() => {
    // Save that the user has seen the tutorial
    if (!hasSeenTutorial && user) {
      const updateUserTutorialStatus = async () => {
        try {
          // Update the profile to mark tutorial as seen
          // This will be stored in the local profile cache
          setHasSeenTutorial(true);
        } catch (error) {
          console.error("Error updating tutorial status:", error);
        }
      };
      
      updateUserTutorialStatus();
    }
  }, [user, hasSeenTutorial, setHasSeenTutorial]);
};
