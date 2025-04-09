import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterIcon, X } from "lucide-react";
import { FilterGroup, FilterOption } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface FilterDropdownProps {
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filters: Record<string, string[]>) => void;
}

export function FilterDropdown({
  filterGroups,
  selectedFilters,
  onFilterChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterToggle = (groupId: string, value: string) => {
    const currentValues = selectedFilters[groupId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange({
      ...selectedFilters,
      [groupId]: newValues,
    });
  };

  const handleClearFilters = () => {
    const emptyFilters: Record<string, string[]> = {};
    filterGroups.forEach((group) => {
      emptyFilters[group.id] = [];
    });
    onFilterChange(emptyFilters);
  };

  const handleRemoveFilter = (groupId: string, value: string) => {
    const newValues = (selectedFilters[groupId] || []).filter((v) => v !== value);
    onFilterChange({
      ...selectedFilters,
      [groupId]: newValues,
    });
  };

  // Count total active filters
  const activeFilterCount = Object.values(selectedFilters).reduce(
    (count, values) => count + values.length,
    0
  );

  // Find label for a filter value
  const getFilterLabel = (groupId: string, value: string): string => {
    const group = filterGroups.find((g) => g.id === groupId);
    if (!group) return value;
    const option = group.options.find((o) => o.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <FilterIcon className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 h-5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filterGroups.map((group) => (
              <DropdownMenuGroup key={group.id}>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
                {group.options.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleFilterToggle(group.id, option.value);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={option.id}
                      checked={(selectedFilters[group.id] || []).includes(option.value)}
                      onCheckedChange={() => {
                        handleFilterToggle(group.id, option.value);
                      }}
                    />
                    <label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer"
                      onClick={(e) => e.preventDefault()}
                    >
                      {option.label}
                    </label>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            ))}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center mt-2"
                onClick={() => {
                  handleClearFilters();
                  setIsOpen(false);
                }}
              >
                Clear all filters
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9 px-2 text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(selectedFilters).map(([groupId, values]) =>
            values.map((value) => (
              <Badge key={`${groupId}-${value}`} variant="outline" className="gap-1">
                {getFilterLabel(groupId, value)}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFilter(groupId, value)}
                  className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          )}
        </div>
      )}
    </div>
  );
}