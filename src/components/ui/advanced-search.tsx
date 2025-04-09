import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchField {
  id: string;
  label: string;
}

interface AdvancedSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  searchFields: SearchField[];
  selectedField: string;
  onFieldChange: (field: string) => void;
}

export function AdvancedSearch({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  searchFields,
  selectedField,
  onFieldChange,
}: AdvancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      {searchFields.length > 0 && (
        <Select value={selectedField} onValueChange={onFieldChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Search in..." />
          </SelectTrigger>
          <SelectContent>
            {searchFields.map((field) => (
              <SelectItem key={field.id} value={field.id}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2"
          onClick={onSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}