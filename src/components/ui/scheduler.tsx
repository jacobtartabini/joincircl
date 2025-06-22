
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface ComponentProps {
  isRepeating: boolean;
  toggleRepeating: () => void;
  repeatInterval: string;
  setRepeatInterval: (interval: string) => void;
  daysOfWeek: string[];
  selectedDays?: Set<string>;
  onDaysChange?: (days: Set<string>) => void;
}

interface SwapTextProps extends React.ComponentPropsWithoutRef<"div"> {
  initialText: string;
  finalText: string;
  supportsHover?: boolean;
  textClassName?: string;
  initialTextClassName?: string;
  finalTextClassName?: string;
  disableClick?: boolean;
  check?: boolean;
  onToggle?: () => void;
}

function SwapText({
  initialText,
  finalText,
  className,
  supportsHover = true,
  textClassName,
  initialTextClassName,
  finalTextClassName,
  disableClick,
  check,
  onToggle,
  ...props
}: SwapTextProps) {
  const [active, setActive] = useState<boolean>(!!check);
  
  useEffect(() => {
    setActive(!!check);
  }, [check]);

  const handleClick = () => {
    if (!disableClick) {
      setActive((current) => !current);
      onToggle?.();
    }
  };

  const common = "block transition-all duration-500 ease-out";
  const longWord = finalText.length > initialText.length ? finalText : null;
  
  return (
    <div {...props} className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("group cursor-pointer select-none", textClassName)}
        onClick={handleClick}
      >
        <span
          className={cn(common, initialTextClassName, {
            "flex flex-col": true,
            "-translate-y-full": active,
            "group-hover:-translate-y-full": supportsHover,
          })}
        >
          {initialText}
          {Boolean(longWord?.length) && <span className="invisible h-0">{longWord}</span>}
        </span>
        <span
          className={cn(`${common} absolute top-full`, finalTextClassName, {
            "-translate-y-full": active,
            "group-hover:-translate-y-full": supportsHover,
          })}
        >
          {finalText}
        </span>
      </div>
    </div>
  );
}

export const RecurringScheduler: React.FC<ComponentProps> = ({
  isRepeating,
  toggleRepeating,
  repeatInterval,
  setRepeatInterval,
  daysOfWeek,
  selectedDays = new Set(),
  onDaysChange,
}) => {
  const handleDayToggle = (day: string) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(day)) {
      newSelectedDays.delete(day);
    } else {
      newSelectedDays.add(day);
    }
    onDaysChange?.(newSelectedDays);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Recurring event</span>
        <Switch checked={isRepeating} onCheckedChange={toggleRepeating} />
      </div>

      <div
        className={cn(
          "space-y-4 transition-all duration-500 ease-out overflow-hidden",
          {
            "max-h-0 opacity-0": !isRepeating,
            "max-h-96 opacity-100": isRepeating,
          }
        )}
      >
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Frequency</label>
          <select
            disabled={!isRepeating}
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(e.target.value)}
            className="glass-input w-32 h-10 px-3 py-2 text-sm rounded-xl transition-all duration-500"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {repeatInterval === 'weekly' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Days of week</label>
            <div 
              className="glass-input rounded-xl p-3 transition-all duration-500"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <SwapText
                    key={day}
                    check={selectedDays.has(day)}
                    initialText={day}
                    finalText={day}
                    supportsHover={false}
                    onToggle={() => handleDayToggle(day)}
                    initialTextClassName="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground rounded-lg transition-all duration-300 hover:bg-white/20"
                    finalTextClassName="w-8 h-8 flex items-center justify-center text-xs text-foreground bg-white/30 backdrop-blur-sm rounded-lg border border-white/40 transition-all duration-300"
                    className="flex justify-center"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
