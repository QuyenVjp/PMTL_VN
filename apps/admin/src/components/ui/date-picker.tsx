import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseDateValue(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function splitDateTimeValue(value: string | undefined): { date: string; time: string } {
  if (!value) return { date: "", time: "08:00" };
  const [date = "", time = "08:00"] = value.split("T");
  return { date, time: time.slice(0, 5) || "08:00" };
}

export function AdminDatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}) {
  const date = parseDateValue(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!date}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? format(date, "dd/MM/yyyy", { locale: vi }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(nextDate) => onChange(toDateValue(nextDate))}
          locale={vi}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function AdminDateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày giờ",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}) {
  const { date: dateValue, time } = splitDateTimeValue(value);
  const date = parseDateValue(dateValue);

  function update(nextDate: string, nextTime: string) {
    onChange(nextDate ? `${nextDate}T${nextTime || "08:00"}` : "");
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!date}
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? `${format(date, "dd/MM/yyyy", { locale: vi })} ${time}` : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(nextDate) => update(toDateValue(nextDate), time)}
          locale={vi}
          initialFocus
        />
        <div className="border-t p-3">
          <Input
            type="time"
            value={time}
            onChange={(event) => update(dateValue, event.target.value)}
            disabled={disabled}
            aria-label="Giờ bắt đầu"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
