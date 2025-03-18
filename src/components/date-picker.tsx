"use client";

import ReactDatePicker from "react-datepicker";
import { CalendarIcon } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
// import { Input } from "@/components/ui/input";

export function DatePicker({
  field
}: {
  field: ControllerRenderProps<any, any>;
}) {
  return (
    <div className="relative">
      <ReactDatePicker
        selected={field.value}
        onChange={field.onChange}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        maxDate={new Date()}
        minDate={new Date(1900, 0, 1)}
        dateFormat="dd/MM/yyyy"
        placeholderText="Select date of birth"
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-sm"
      />
      <CalendarIcon className="absolute right-3 top-2 h-4 w-4 opacity-50" />
    </div>
  );
}
