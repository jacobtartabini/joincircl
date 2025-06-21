
import { useState, useMemo } from "react";
import { ToolCard } from "./ToolCard";
import { 
  FileText, 
  BookOpen, 
  User, 
  Search, 
  Briefcase, 
  Network, 
  Pencil, 
  GraduationCap, 
  TrendingUp, 
  Mail, 
  Star, 
  ListCheck,
  MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Tool components for modals only
import { LinkedInMessageGeneratorTool } from "./LinkedInMessageGeneratorTool";

type ToolKey =
  | "appInfo"
  | "resume"
  | "coverLetter"
  | "jobAnalyzer"
  | "networkDiscovery"
  | "interviewerResearch"
  | "companyResearch"
  | "mockInterview"
  | "followUp"
  | "offerCompare"
  | "skillGap"
  | "linkedinMessage"
;

interface CareerToolsViewProps {
  onAddApplication?: () => void;
}

const TOOLS: {
  key: ToolKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  hasPage?: boolean;
}[] = [
  {
    key: "appInfo",
    title: "Application Info Intake",
    description: "Add job title, company, deadline, description, and more.",
    icon: <Briefcase size={28} />,
    hasPage: false // Opens modal
  },
  {
    key: "resume",
    title: "Resume Reviewer (Arlo AI)",
    description: "AI analyzes your resume vs. the job description with tailored suggestions.",
    icon: <FileText size={28} />,
    hasPage: true
  },
  {
    key: "coverLetter",
    title: "Cover Letter Generator",
    description: "AI to draft or refine your cover letter in your tone.",
    icon: <Pencil size={28} />,
    hasPage: true
  },
  {
    key: "jobAnalyzer",
    title: "Job Description Analyzer",
    description: "Extracts skills, responsibilities, and rates your fit.",
    icon: <Search size={28} />,
    hasPage: true
  },
  {
    key: "networkDiscovery",
    title: "Network Discovery",
    description: "Find connections at a company or industry and draft outreach messages.",
    icon: <Network size={28} />,
    hasPage: true
  },
  {
    key: "linkedinMessage",
    title: "LinkedIn Message Generator",
    description: "Generate personalized LinkedIn messages for networking and outreach.",
    icon: <MessageCircle size={28} />,
    hasPage: false // Keep as modal for now
  },
  {
    key: "interviewerResearch",
    title: "Interviewer Research",
    description: "Research your interviewers and get personalized conversation tips.",
    icon: <User size={28} />,
    hasPage: true
  },
  {
    key: "companyResearch",
    title: "Company Research & Questions",
    description: "Get company insights and AI-generated interview questions.",
    icon: <GraduationCap size={28} />,
    hasPage: true
  },
  {
    key: "mockInterview",
    title: "Mock Interview (AI)",
    description: "Practice interviews with AI feedback using the STAR method.",
    icon: <Star size={28} />,
    hasPage: true
  },
  {
    key: "followUp",
    title: "Follow-Up & Thank You Generator",
    description: "Generate personalized thank you emails for each interviewer.",
    icon: <Mail size={28} />,
    hasPage: true
  },
  {
    key: "offerCompare",
    title: "Offer Comparison & Negotiation Prep",
    description: "Compare multiple offers and get negotiation strategies.",
    icon: <TrendingUp size={28} />,
    hasPage: true
  },
  {
    key: "skillGap",
    title: "Skill Gap & Learning Plan",
    description: "Analyze skill gaps and get personalized learning recommendations.",
    icon: <ListCheck size={28} />,
    hasPage: true
  },
];

// Modal components map for tools that still use modals
const modals: Partial<Record<ToolKey, React.ComponentType<{ onClose: () => void }>>> = {
  linkedinMessage: LinkedInMessageGeneratorTool,
};

export function CareerToolsView({ onAddApplication }: CareerToolsViewProps) {
  const [activeModal, setActiveModal] = useState<ToolKey | null>(null);
  const [bookmarkedTools, setBookmarkedTools] = useState<Set<ToolKey>>(new Set());
  const navigate = useNavigate();

  const handleToolClick = (tool: { key: ToolKey; hasPage?: boolean }) => {
    if (tool.key === "appInfo") {
      // Open the add application dialog
      onAddApplication?.();
      return;
    }

    if (tool.hasPage) {
      // Navigate to dedicated page
      navigate(`/career/${tool.key}`);
    } else {
      // Open modal
      setActiveModal(tool.key);
    }
  };

  const handleBookmarkChange = (toolKey: ToolKey, bookmarked: boolean) => {
    setBookmarkedTools(prev => {
      const newSet = new Set(prev);
      if (bookmarked) {
        newSet.add(toolKey);
      } else {
        newSet.delete(toolKey);
      }
      return newSet;
    });
  };

  // Sort tools with bookmarked ones first
  const sortedTools = useMemo(() => {
    return [...TOOLS].sort((a, b) => {
      const aBookmarked = bookmarkedTools.has(a.key);
      const bBookmarked = bookmarkedTools.has(b.key);
      
      if (aBookmarked && !bBookmarked) return -1;
      if (!aBookmarked && bBookmarked) return 1;
      return 0;
    });
  }, [bookmarkedTools]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedTools.map(tool => (
          <ToolCard
            key={tool.key}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            onClick={() => handleToolClick(tool)}
            isBookmarked={bookmarkedTools.has(tool.key)}
            onBookmarkChange={(bookmarked) => handleBookmarkChange(tool.key, bookmarked)}
          />
        ))}
      </div>
      
      {activeModal && (() => {
        const ModalComp = modals[activeModal];
        return ModalComp ? (
          <ModalComp onClose={() => setActiveModal(null)} />
        ) : null;
      })()}
    </div>
  );
}
