import { useState } from "react";

export function CheckboxDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (value: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const allChecked = selected.size === options.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleAll = () => onChange(allChecked ? new Set() : new Set(options));
  const toggle = (opt: string) => {
    const next = new Set(selected);
    if (next.has(opt)) {
      next.delete(opt);
    } else {
      next.add(opt);
    }
    onChange(next);
  };

  return (
    <div className="sbc-cb-wrap">
      <div
        className={`sbc-cb-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {someChecked && <span className="sbc-cb-dot" />}
        {label}
        {someChecked || (!allChecked && selected.size === 0)
          ? ` (${selected.size})`
          : ""}
        <span className="sbc-cb-caret">▼</span>
      </div>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 98 }}
            onClick={() => setOpen(false)}
          />
          <div className="sbc-cb-panel">
            <div className="sbc-cb-group">
              <label
                className={`sbc-cb-item sbc-cb-all ${allChecked ? "checked" : someChecked ? "partial" : ""}`}
                onClick={toggleAll}
              >
                <span className="sbc-cb-box">
                  {allChecked && <span className="sbc-cb-check">✓</span>}
                  {someChecked && <span className="sbc-cb-dash">−</span>}
                </span>
                <span className="sbc-cb-label">Semua Jenis</span>
              </label>
              <div className="sbc-cb-divider" />
              {options.map((opt) => (
                <label
                  key={opt}
                  className={`sbc-cb-item ${selected.has(opt) ? "checked" : ""}`}
                  onClick={() => toggle(opt)}
                >
                  <span className="sbc-cb-box">
                    {selected.has(opt) && <span className="sbc-cb-check">✓</span>}
                  </span>
                  <span className="sbc-cb-label">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
