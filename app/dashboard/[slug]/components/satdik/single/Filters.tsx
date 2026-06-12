import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
// ── Multi Select Component ───────────────────────────────────
export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onChange,
}: {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOption = (value: string) => {
    if (value === "Semua") {
      onChange(["Semua"]);
    } else {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues.filter((v) => v !== "Semua"), value];

      if (newValues.length === 0) {
        onChange(["Semua"]);
      } else {
        onChange(newValues);
      }
    }
  };

  const removeFilter = (value: string) => {
    const newValues = selectedValues.filter((v) => v !== value);
    if (newValues.length === 0) {
      onChange(["Semua"]);
    } else {
      onChange(newValues);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.includes("Semua") || selectedValues.length === 0) {
      return "Semua";
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return `${selectedValues.length} terpilih`;
  };

  return (
    <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
      <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full pl-3 pr-8 py-2 rounded-lg text-sm border
            transition-all cursor-pointer text-left
            ${
              selectedValues.length > 0 && !selectedValues.includes("Semua")
                ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }
          `}
        >
          {getDisplayText()}
        </button>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
          <svg
            className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""} ${selectedValues.length > 0 && !selectedValues.includes("Semua") ? "text-indigo-500" : "text-slate-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {selectedValues.length > 0 && !selectedValues.includes("Semua") && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600"
            >
              {value}
              <button
                onClick={() => removeFilter(value)}
                className="hover:text-indigo-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Native Select Component ───────────────────────────────────
export function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const isActive = value !== "Semua";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border
            transition-all cursor-pointer outline-none
            ${
              isActive
                ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }
          `}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
          <svg
            className={`w-3.5 h-3.5 ${isActive ? "text-indigo-500" : "text-slate-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange("Semua");
            }}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Search Input Component ───────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const isActive = value !== "";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
        Search
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full pl-9 pr-8 py-2 rounded-lg text-sm border
            transition-all outline-none
            ${
              isActive
                ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium placeholder:text-indigo-300"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 placeholder:text-slate-400"
            }
          `}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}


