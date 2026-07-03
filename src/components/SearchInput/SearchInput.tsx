import { Search, X } from "lucide-react";

export function SearchInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">Пошук кешбеків</span>
      <span className="flex h-12 items-center gap-3 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          aria-label="Пошук кешбеків"
          inputMode="search"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Kims, Кімс, хімчистка, продукти"
          type="text"
          value={value}
        />
        {value.length > 0 ? (
          <button
            aria-label="Очистити пошук"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onChange("")}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </span>
    </label>
  );
}
