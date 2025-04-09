import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api-client";
import { EmailAccount, PaginationParams, FilterGroup } from "@/lib/types";
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  CheckCircle, 
  XCircle, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Pencil, 
  Trash, 
  SortAsc,
  SortDesc
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdvancedSearch } from "@/components/ui/advanced-search";
import { FilterDropdown } from "@/components/ui/filter-dropdown";

export function EmailAccountsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string[]>>({
    status: [],
  });
  const { toast } = useToast();

  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "email", label: "Email" },
    { id: "emailAccountName", label: "Account Name" },
    { id: "smtpServer", label: "SMTP Server" },
  ];

  const filterGroups: FilterGroup[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { id: "status-valid", label: "Active", value: "valid" },
        { id: "status-invalid", label: "Inactive", value: "invalid" },
      ],
    },
  ];

  const fetchAccounts = async (params: PaginationParams = {}) => {
    setIsLoading(true);
    try {
      // Prepare filters for API
      const apiFilters: Record<string, any> = {};
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          apiFilters[key] = values;
        }
      });

      const response = await api.emailAccounts.list({
        page,
        limit,
        search: search || undefined,
        sortBy,
        order: sortOrder,
        ...apiFilters,
        ...params,
      });

      setAccounts(response.items);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch email accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, limit, search, sortBy, sortOrder, filters]);

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchAccounts();
  };

  const handleRefresh = () => {
    fetchAccounts();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.emailAccounts.delete(id);
      toast({
        title: "Success",
        description: "Email account deleted successfully",
      });
      fetchAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email account",
        variant: "destructive",
      });
    } finally {
      setAccountToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAccounts.length === 0) return;
    
    setIsBulkDeleting(true);
    try {
      await api.emailAccounts.bulkDelete(selectedAccounts);
      toast({
        title: "Success",
        description: `${selectedAccounts.length} email accounts deleted successfully`,
      });
      setSelectedAccounts([]);
      fetchAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected accounts",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleTest = async (id: string) => {
    try {
      const result = await api.emailAccounts.test(id);
      toast({
        title: result.status === "valid" ? "Success" : "Error",
        description: result.status === "valid" 
          ? "Connection test successful" 
          : `Connection test failed: ${result.statusReason}`,
        variant: result.status === "valid" ? "default" : "destructive",
      });
      fetchAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test email account",
        variant: "destructive",
      });
    }
  };

  const handleSelectAccount = (id: string) => {
    setSelectedAccounts(prev => 
      prev.includes(id) 
        ? prev.filter(accId => accId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map(acc => acc.emailAccountId));
    }
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <AdvancedSearch
            placeholder="Search accounts..."
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
        <div className="flex items-center gap-2">
          {selectedAccounts.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsBulkDeleting(true)}
              disabled={isLoading}
            >
              Delete Selected ({selectedAccounts.length})
            </Button>
          )}
          <Link to="/email-accounts/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedAccounts.length === accounts.length && accounts.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('emailAccountName')}
              >
                <div className="flex items-center">
                  Account Name
                  {renderSortIcon('emailAccountName')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {renderSortIcon('email')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIcon('status')}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No email accounts found
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.emailAccountId}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.emailAccountId)}
                      onChange={() => handleSelectAccount(account.emailAccountId)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>{account.emailAccountName || "Unnamed Account"}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {account.status === "valid" ? (
                              <CheckCircle className="h-5 w-5 text-accent mr-1" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive mr-1" />
                            )}
                            <span>{account.status === "valid" ? "Active" : "Inactive"}</span>
                          </div>
                        </TooltipTrigger>
                        {account.status === "invalid" && (
                          <TooltipContent>
                            <p>{account.statusReason}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTest(account.emailAccountId)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Test Connection
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/email-accounts/edit/${account.emailAccountId}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setAccountToDelete(account.emailAccountId)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={accountToDelete !== null} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the email account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => accountToDelete && handleDelete(accountToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleting} onOpenChange={setIsBulkDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple accounts?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedAccounts.length} email accounts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}