
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Minus, Sun, Moon, Monitor } from "lucide-react";
import { useId } from "react";

interface ThemeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const themeItems = [
  { 
    value: "light", 
    label: "Light", 
    icon: Sun,
    preview: "bg-gradient-to-br from-slate-50 to-white border-slate-200"
  },
  { 
    value: "dark", 
    label: "Dark", 
    icon: Moon,
    preview: "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700"
  },
  { 
    value: "system", 
    label: "System", 
    icon: Monitor,
    preview: "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-900 border-slate-400"
  },
];

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  const id = useId();
  
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium leading-none text-foreground">Choose a theme</legend>
      <RadioGroup className="flex gap-3" value={value} onValueChange={onValueChange}>
        {themeItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <label key={`${id}-${item.value}`} className="cursor-pointer">
              <RadioGroupItem
                id={`${id}-${item.value}`}
                value={item.value}
                className="peer sr-only after:absolute after:inset-0"
              />
              <div
                className={`relative overflow-hidden rounded-lg border border-input shadow-sm shadow-black/5 outline-offset-2 transition-all duration-200 peer-[:focus-visible]:outline peer-[:focus-visible]:outline-2 peer-[:focus-visible]:outline-ring/70 peer-data-[disabled]:cursor-not-allowed peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/20 peer-data-[disabled]:opacity-50 w-[88px] h-[70px] ${item.preview}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <IconComponent className="h-6 w-6 text-foreground/60" />
                </div>
              </div>
              <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
                <Check
                  size={16}
                  strokeWidth={2}
                  className="peer-data-[state=unchecked]:group-[]:hidden text-primary"
                  aria-hidden="true"
                />
                <Minus
                  size={16}
                  strokeWidth={2}
                  className="peer-data-[state=checked]:group-[]:hidden"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium">{item.label}</span>
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
