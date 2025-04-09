import { useState, useEffect } from "react";
import { getEmailReplies, getEmailReportOverview, markReplyAsPublished } from "@/lib/api";
import { EmailReply, PaginationParams, FilterGroup } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
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
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  MessageSquare,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AdvancedSearch } from "@/components/ui/advanced-search";
import { FilterDropdown } from "@/components/ui/filter-dropdown";

export function RepliesPage() {
  const [replies, setReplies] = useState<EmailReply[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalFailed: 0,
    totalReplied: 0,
    replyRate: 0,
    totalOpened: 0,
    openRate: 0,
    totalClicked: 0,
    clickRate: 0
  });
  const [selectedReply, setSelectedReply] = useState<EmailReply | null>(null);
  const [publishUrl, setPublishUrl] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string[]>>({
    replyStatus: [],
    platform: [],
  });
  const { toast } = useToast();

  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "emailAccountEmailAddress", label: "Email Account" },
    { id: "publicationName", label: "Publication" },
    { id: "queryWriterEmail", label: "Recipient" },
  ];

  const filterGroups: FilterGroup[] = [
    {
      id: "replyStatus",
      label: "Status",
      options: [
        { id: "status-sent", label: "Sent", value: "sent" },
        { id: "status-replied", label: "Replied", value: "replied" },
        { id: "status-published", label: "Published", value: "published" },
        { id: "status-failed", label: "Failed", value: "failed" },
      ],
    },
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

  const fetchReplies = async (params: PaginationParams = {}) => {
    setIsLoading(true);
    try {
      // Prepare filters for API
      const apiFilters: Record<string, any> = {};
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          apiFilters[key] = values;
        }
      });

      const response = await getEmailReplies({
        page,
        limit,
        search,
        sortBy,
        order: sortOrder,
        filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined,
        ...params,
      });
      setReplies(response.items);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch replies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getEmailReportOverview();
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch email statistics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReplies();
    fetchStats();
  }, [page, limit, search, sortBy, sortOrder, filters]);

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchReplies();
  };

  const handleRefresh = () => {
    fetchReplies();
    fetchStats();
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

  const handleMarkAsPublished = async (replyId: string) => {
    try {
      await markReplyAsPublished(replyId, publishUrl);
      toast({
        title: "Success",
        description: "Reply marked as published",
      });
      fetchReplies();
      setPublishUrl("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark reply as published",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <span className="flex items-center text-accent"><CheckCircle className="h-4 w-4 mr-1" /> Sent</span>;
      case "failed":
        return <span className="flex items-center text-destructive"><XCircle className="h-4 w-4 mr-1" /> Failed</span>;
      case "bounce":
        return <span className="flex items-center text-destructive"><XCircle className="h-4 w-4 mr-1" /> Bounced</span>;
      case "replied":
        return <span className="flex items-center text-secondary"><MessageSquare className="h-4 w-4 mr-1" /> Replied</span>;
      case "published":
        return <span className="flex items-center text-primary"><ExternalLink className="h-4 w-4 mr-1" /> Published</span>;
      default:
        return <span className="flex items-center text-muted-foreground"><Clock className="h-4 w-4 mr-1" /> {status}</span>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reply Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.replyRate}%</p>
            <p className="text-sm text-muted-foreground">{stats.totalReplied} replies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.openRate}%</p>
            <p className="text-sm text-muted-foreground">{stats.totalOpened} opened</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.clickRate}%</p>
            <p className="text-sm text-muted-foreground">{stats.totalClicked} clicked</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <AdvancedSearch
            placeholder="Search replies..."
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
                onClick={() => handleSort('emailAccountEmailAddress')}
              >
                <div className="flex items-center">
                  Email Account
                  {renderSortIcon('emailAccountEmailAddress')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('emailSentAt')}
              >
                <div className="flex items-center">
                  Sent At
                  {renderSortIcon('emailSentAt')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('replyStatus')}
              >
                <div className="flex items-center">
                  Status
                  {renderSortIcon('replyStatus')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('replyAt')}
              >
                <div className="flex items-center">
                  Replied At
                  {renderSortIcon('replyAt')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('publicationName')}
              >
                <div className="flex items-center">
                  Publication
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : replies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No replies found
                </TableCell>
              </TableRow>
            ) : (
              replies.map((reply) => (
                <TableRow key={reply.replyId}>
                  <TableCell>{reply.emailAccountEmailAddress}</TableCell>
                  <TableCell>{formatDate(reply.emailSentAt)}</TableCell>
                  <TableCell>{getStatusBadge(reply.replyStatus)}</TableCell>
                  <TableCell>{formatDate(reply.replyAt)}</TableCell>
                  <TableCell>{reply.publicationName}</TableCell>
                  <TableCell>{reply.platform}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReply(reply)}
                          >
                            View Details
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[800px] sm:w-[800px]">
                          <SheetHeader>
                            <SheetTitle>Query & Reply Details</SheetTitle>
                            <SheetDescription>
                              View the complete query and reply information
                            </SheetDescription>
                          </SheetHeader>
                          {selectedReply && (
                            <div className="grid grid-cols-2 gap-6 py-6">
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Query Details</h3>
                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-medium">Publication</h4>
                                    <p>{selectedReply.publicationName}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Platform</h4>
                                    <p>{selectedReply.platform}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Received Date</h4>
                                    <p>{formatDate(selectedReply.receivedDate)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Deadline</h4>
                                    <p>{selectedReply.deadline}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Request Text</h4>
                                    <div className="p-3 bg-muted rounded-md mt-1 max-h-[300px] overflow-y-auto">
                                      <p className="whitespace-pre-wrap">{selectedReply.requestText}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Email Details</h3>
                                <div className="space-y-2">
                                  <div>
                                    <h4 className="text-sm font-medium">From</h4>
                                    <p>{selectedReply.emailAccountEmailAddress}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">To</h4>
                                    <p>{selectedReply.queryWriterEmail}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Sent At</h4>
                                    <p>{formatDate(selectedReply.emailSentAt)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Status</h4>
                                    <p>{getStatusBadge(selectedReply.replyStatus)}</p>
                                  </div>
                                  {selectedReply.replyAt && (
                                    <div>
                                      <h4 className="text-sm font-medium">Replied At</h4>
                                      <p>{formatDate(selectedReply.replyAt)}</p>
                                    </div>
                                  )}
                                  {selectedReply.isPublished && selectedReply.publishedUrl && (
                                    <div>
                                      <h4 className="text-sm font-medium">Published URL</h4>
                                      <a 
                                        href={selectedReply.publishedUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center"
                                      >
                                        {selectedReply.publishedUrl}
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>

                      {reply.replyStatus !== "published" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => setSelectedReply(reply)}
                            >
                              Mark Published
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Mark as Published</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="published" />
                                  <Label htmlFor="published">Mark as published</Label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="publishUrl">Publication URL (optional)</Label>
                                <Input
                                  id="publishUrl"
                                  placeholder="https://example.com/article"
                                  value={publishUrl}
                                  onChange={(e) => setPublishUrl(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  onClick={() => selectedReply && handleMarkAsPublished(selectedReply.replyId)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
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