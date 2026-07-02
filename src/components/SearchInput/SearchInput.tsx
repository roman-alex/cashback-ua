import { Search } from "lucide-react";

export function SearchInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">Пошук</span>
      <span className="mt-2 flex h-12 items-center gap-3 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          inputMode="search"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Kims, Кімс, хімчистка, 5411"
          type="search"
          value={value}
        />
      </span>
    </label>
  );
}
