
import { useState } from "react";
import { ToolCard } from "./ToolCard";
import { 
  FileText, 
  BookOpen, 
  User, 
  Search, 
  Briefcase, 
  Network, 
  Clock, 
  Pencil, 
  GraduationCap, 
  TrendingUp, 
  Mail, 
  Star, 
  Archive, 
  ListCheck 
} from "lucide-react";

// FIX: Import each tool individually instead of from "./"
import { ResumeReviewerTool } from "./ResumeReviewerTool";
import { CoverLetterGeneratorTool } from "./CoverLetterGeneratorTool";
import { ApplicationInfoIntakeTool } from "./ApplicationInfoIntakeTool";
import { JobDescriptionAnalyzerTool } from "./JobDescriptionAnalyzerTool";
import { NetworkDiscoveryTool } from "./NetworkDiscoveryTool";
import { InterviewerResearchTool } from "./InterviewerResearchTool";
import { CompanyResearchTool } from "./CompanyResearchTool";
import { MockInterviewTool } from "./MockInterviewTool";
import { TimelineTrackerTool } from "./TimelineTrackerTool";
import { FollowUpGeneratorTool } from "./FollowUpGeneratorTool";
import { InterviewDebriefJournalTool } from "./InterviewDebriefJournalTool";
import { OfferComparisonTool } from "./OfferComparisonTool";
import { SkillGapPlanTool } from "./SkillGapPlanTool";

type ToolKey =
  | "appInfo"
  | "resume"
  | "coverLetter"
  | "jobAnalyzer"
  | "networkDiscovery"
  | "interviewerResearch"
  | "companyResearch"
  | "mockInterview"
  | "timeline"
  | "followUp"
  | "interviewDebrief"
  | "offerCompare"
  | "skillGap"
;

const TOOLS: {
  key: ToolKey;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "appInfo",
    title: "Application Info Intake",
    description: "Add job title, company, deadline, description, and more.",
    icon: <Briefcase size={28} />
  },
  {
    key: "resume",
    title: "Resume Reviewer (Arlo AI)",
    description: "AI analyzes your resume vs. the job description with tailored suggestions.",
    icon: <FileText size={28} />
  },
  {
    key: "coverLetter",
    title: "Cover Letter Generator",
    description: "AI to draft or refine your cover letter in your tone.",
    icon: <Pencil size={28} />
  },
  {
    key: "jobAnalyzer",
    title: "Job Description Analyzer",
    description: "Extracts skills, responsibilities, and rates your fit.",
    icon: <Search size={28} />
  },
  {
    key: "networkDiscovery",
    title: "Network Discovery",
    description: "Find connections at a company or industry and draft outreach messages.",
    icon: <Network size={28} />
  },
  {
    key: "interviewerResearch",
    title: "Interviewer Research",
    description: "See LinkedIn-style profiles for interviewers with talking points.",
    icon: <User size={28} />
  },
  {
    key: "companyResearch",
    title: "Company Research & Questions",
    description: "Get company summary plus AI-generated interview questions.",
    icon: <GraduationCap size={28} />
  },
  {
    key: "mockInterview",
    title: "Mock Interview (AI)",
    description: "Practice job-specific interviews with real-time AI feedback.",
    icon: <Star size={28} />
  },
  {
    key: "timeline",
    title: "Timeline & Deadline Tracker",
    description: "Visual stage-based timeline and reminders for each application.",
    icon: <Clock size={28} />
  },
  {
    key: "followUp",
    title: "Follow-Up & Thank You Generator",
    description: "Draft & schedule thank-yous and follow-up notes post-interview.",
    icon: <Mail size={28} />
  },
  {
    key: "interviewDebrief",
    title: "Interview Debrief Journal",
    description: "Private notes for reflection and tracking lessons.",
    icon: <Archive size={28} />
  },
  {
    key: "offerCompare",
    title: "Offer Comparison & Negotiation Prep",
    description: "Compare offers, get AI gut-check and negotiation scripts.",
    icon: <TrendingUp size={28} />
  },
  {
    key: "skillGap",
    title: "Skill Gap & Learning Plan",
    description: "Analyze your skill gap and get personalized learning plans.",
    icon: <ListCheck size={28} />
  },
];

const modals: Partial<Record<ToolKey, React.ComponentType<{ onClose: () => void }>>> = {
  appInfo: ApplicationInfoIntakeTool,
  resume: ResumeReviewerTool,
  coverLetter: CoverLetterGeneratorTool,
  jobAnalyzer: JobDescriptionAnalyzerTool,
  networkDiscovery: NetworkDiscoveryTool,
  interviewerResearch: InterviewerResearchTool,
  companyResearch: CompanyResearchTool,
  mockInterview: MockInterviewTool,
  timeline: TimelineTrackerTool,
  followUp: FollowUpGeneratorTool,
  interviewDebrief: InterviewDebriefJournalTool,
  offerCompare: OfferComparisonTool,
  skillGap: SkillGapPlanTool,
};

export function CareerToolsView() {
  const [activeModal, setActiveModal] = useState<ToolKey | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {TOOLS.map(tool => (
          <ToolCard
            key={tool.key}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            onClick={() => setActiveModal(tool.key)}
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
