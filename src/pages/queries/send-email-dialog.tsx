import { useState, useEffect } from "react";
import { getEmailAccounts, sendEmail } from "@/lib/api";
import { EmailAccount, Query } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SendEmailDialogProps {
  query: Query;
  onSuccess: () => void;
}

export function SendEmailDialog({ query, onSuccess }: SendEmailDialogProps) {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmailAccounts = async () => {
      setIsLoading(true);
      try {
        const response = await getEmailAccounts({ limit: 100 });
        // Filter only valid accounts
        const validAccounts = response.items.filter(account => account.status === "valid");
        setEmailAccounts(validAccounts);
        
        if (validAccounts.length > 0) {
          setSelectedAccountId(validAccounts[0].emailAccountId);
        }
      } catch (error) {
        setError("Failed to fetch email accounts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmailAccounts();
    
    // Pre-populate subject with publication name
    if (query.publicationName) {
      setSubject(`Re: ${query.publicationName} Query`);
    }
    
    // Pre-populate body with a template
    setBody(`Dear Editor,\n\nThank you for your query about ${query.publicationName}.\n\n[Your response here]\n\nBest regards,\n[Your Name]`);
  }, [query]);

  const handleSendEmail = async () => {
    if (!selectedAccountId) {
      setError("Please select an email account");
      return;
    }
    
    if (!subject.trim()) {
      setError("Subject line cannot be empty");
      return;
    }
    
    if (!body.trim()) {
      setError("Email body cannot be empty");
      return;
    }
    
    setIsSending(true);
    setError("");
    
    try {
      await sendEmail({
        emailAccountId: selectedAccountId,
        subjectLine: subject,
        body,
        emailAddress: query.queryWriterEmail || "recipient@example.com", // Fallback if not available
        queryId: query.itemId
      });
      
      onSuccess();
    } catch (error) {
      setError("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="emailAccount">Email Account</Label>
        <Select 
          value={selectedAccountId} 
          onValueChange={setSelectedAccountId}
          disabled={isLoading || emailAccounts.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an email account" />
          </SelectTrigger>
          <SelectContent>
            {emailAccounts.map(account => (
              <SelectItem key={account.emailAccountId} value={account.emailAccountId}>
                {account.emailAccountName || account.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {emailAccounts.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            No valid email accounts found. Please add an email account first.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject Line</Label>
        <Textarea
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject line"
          className="resize-none h-10"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="body">Email Body</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter email content"
          className="min-h-[200px]"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button 
          onClick={handleSendEmail}
          disabled={isSending || !selectedAccountId}
        >
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </div>
    </div>
  );
}