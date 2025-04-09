import { useState, useEffect } from "react";
import { getQueries } from "@/lib/api";
import { Query, PaginationParams, FilterGroup } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { RefreshCw, Send, SortAsc, SortDesc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SendEmailDialog } from "./send-email-dialog";
import { AdvancedSearch } from "@/components/ui/advanced-search";
import { FilterDropdown } from "@/components/ui/filter-dropdown";

export function QueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string[]>>({
    platform: [],
  });
  const { toast } = useToast();

  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "requestText", label: "Request Text" },
    { id: "publicationName", label: "Publication" },
    { id: "platform", label: "Platform" },
  ];

  const filterGroups: FilterGroup[] = [
    {
      id: "platform",
      label: "Platform",
      options: [
        { id: "platform-email", label: "Email", value: "Email" },
        { id: "platform-haro", label: "HARO", value: "HARO" },
        { id: "platform-other", label: "Other", value: "Other" },
      ],
    },
  ];

  const fetchQueries = async (params: PaginationParams = {}) => {
    setIsLoading(true);
    try {
      // Prepare filters for API
      const apiFilters: Record<string, any> = {};
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          apiFilters[key] = values;
        }
      });

      const response = await getQueries({
        page,
        limit,
        search,
        sortBy,
        order: sortOrder,
        filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
        ...params,
      });
      setQueries(response.items);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch queries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page, limit, search, sortBy, sortOrder, filters]);

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchQueries();
  };

  const handleRefresh = () => {
    fetchQueries();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <AdvancedSearch
            placeholder="Search queries..."
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            searchFields={searchFields}
            selectedField={searchField}
            onFieldChange={setSearchField}
          />
          <FilterDropdown
            filterGroups={filterGroups}
            selectedFilters={filters}
            onFilterChange={setFilters}
          />
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('receivedDate')}
              >
                <div className="flex items-center">
                  Received Date
                  {renderSortIcon('receivedDate')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('requestText')}
              >
                <div className="flex items-center">
                  Request Text
                  {renderSortIcon('requestText')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('publicationName')}
              >
                <div className="flex items-center">
                  Publication Name
                  {renderSortIcon('publicationName')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('platform')}
              >
                <div className="flex items-center">
                  Platform
                  {renderSortIcon('platform')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('deadline')}
              >
                <div className="flex items-center">
                  Deadline
                  {renderSortIcon('deadline')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : queries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No queries found
                </TableCell>
              </TableRow>
            ) : (
              queries.map((query) => (
                <TableRow key={query.itemId}>
                  <TableCell>{formatDate(query.receivedDate)}</TableCell>
                  <TableCell className="max-w-xs truncate">{query.requestText}</TableCell>
                  <TableCell>{query.publicationName}</TableCell>
                  <TableCell>{query.platform}</TableCell>
                  <TableCell>{query.deadline}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedQuery(query)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Send Email to Query</DialogTitle>
                          <DialogDescription>
                            Respond to this query using one of your email accounts.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedQuery && (
                          <SendEmailDialog 
                            query={selectedQuery} 
                            onSuccess={() => {
                              toast({
                                title: "Success",
                                description: "Email sent successfully",
                              });
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={page === p}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}