import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  createEmailAccount, 
  getEmailAccount, 
  updateEmailAccount, 
  testEmailConfig 
} from "@/lib/api";
import { EmailAccountFormData, EmailAccountTestResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface EmailProviderConfig {
  name: string;
  smtpServer: string;
  smtpPort: string;
  smtpSecurity: "none" | "ssl_tls" | "starttls";
  imapServer: string;
  imapPort: string;
  imapSecurity: "none" | "ssl_tls" | "starttls";
}

const emailProviders: EmailProviderConfig[] = [
  {
    name: "Gmail",
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    smtpSecurity: "starttls",
    imapServer: "imap.gmail.com",
    imapPort: "993",
    imapSecurity: "ssl_tls"
  },
  {
    name: "Outlook",
    smtpServer: "smtp-mail.outlook.com",
    smtpPort: "587",
    smtpSecurity: "starttls",
    imapServer: "outlook.office365.com",
    imapPort: "993",
    imapSecurity: "ssl_tls"
  },
  {
    name: "Yahoo",
    smtpServer: "smtp.mail.yahoo.com",
    smtpPort: "587",
    smtpSecurity: "starttls",
    imapServer: "imap.mail.yahoo.com",
    imapPort: "993",
    imapSecurity: "ssl_tls"
  },
  {
    name: "Custom",
    smtpServer: "",
    smtpPort: "",
    smtpSecurity: "starttls",
    imapServer: "",
    imapPort: "",
    imapSecurity: "ssl_tls"
  }
];

export function EmailAccountForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<EmailAccountFormData>({
    emailAccountName: "",
    smtpServer: "",
    smtpPortNumber: "",
    smtpSecurityProtocol: "starttls",
    imapServer: "",
    imapPortNumber: "",
    imapSecurityProtocol: "ssl_tls",
    username: "",
    email: "",
    password: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<EmailAccountTestResult | null>(null);
  const [error, setError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("Custom");
  
  useEffect(() => {
    if (isEditMode && id) {
      const fetchAccount = async () => {
        setIsLoading(true);
        try {
          const account = await getEmailAccount(id);
          setFormData({
            emailAccountName: account.emailAccountName || "",
            smtpServer: account.smtpServer,
            smtpPortNumber: account.smtpPortNumber,
            smtpSecurityProtocol: account.smtpSecurityProtocol,
            imapServer: account.imapServer,
            imapPortNumber: account.imapPortNumber,
            imapSecurityProtocol: account.imapSecurityProtocol,
            username: account.username,
            email: account.email,
            password: account.password
          });
          
          // Try to determine the provider
          const provider = emailProviders.find(p => 
            p.smtpServer === account.smtpServer && 
            p.imapServer === account.imapServer
          );
          
          if (provider) {
            setSelectedProvider(provider.name);
          } else {
            setSelectedProvider("Custom");
          }
          
          setTestResult({
            status: account.status,
            statusReason: account.statusReason
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch email account details",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAccount();
    }
  }, [id, isEditMode]);
  
  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    
    if (value !== "Custom") {
      const provider = emailProviders.find(p => p.name === value);
      if (provider) {
        setFormData(prev => ({
          ...prev,
          smtpServer: provider.smtpServer,
          smtpPortNumber: provider.smtpPort,
          smtpSecurityProtocol: provider.smtpSecurity,
          imapServer: provider.imapServer,
          imapPortNumber: provider.imapPort,
          imapSecurityProtocol: provider.imapSecurity
        }));
      }
    }
    
    // Reset test result when provider changes
    setTestResult(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset test result when any field changes
    setTestResult(null);
  };
  
  const handleSecurityChange = (field: 'smtpSecurityProtocol' | 'imapSecurityProtocol', value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value as "none" | "ssl_tls" | "starttls" 
    }));
    
    // Reset test result when security protocol changes
    setTestResult(null);
  };
  
  const isFormValid = () => {
    return (
      formData.smtpServer.trim() !== "" &&
      formData.smtpPortNumber.trim() !== "" &&
      formData.imapServer.trim() !== "" &&
      formData.imapPortNumber.trim() !== "" &&
      formData.username.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== ""
    );
  };
  
  const handleTestConnection = async () => {
    if (!isFormValid()) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsTesting(true);
    setError("");
    
    try {
      const result = await testEmailConfig({
        smtpServer: formData.smtpServer,
        smtpPortNumber: formData.smtpPortNumber,
        smtpSecurityProtocol: formData.smtpSecurityProtocol,
        imapServer: formData.imapServer,
        imapPortNumber: formData.imapPortNumber,
        imapSecurityProtocol: formData.imapSecurityProtocol,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setTestResult(result);
      
      toast({
        title: result.status === "valid" ? "Success" : "Error",
        description: result.status === "valid" 
          ? "Connection test successful" 
          : `Connection test failed: ${result.statusReason}`,
        variant: result.status === "valid" ? "default" : "destructive",
      });
    } catch (error) {
      setError("Failed to test connection. Please check your settings and try again.");
      setTestResult(null);
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!testResult || testResult.status !== "valid") {
      setError("Please test the connection before saving");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      if (isEditMode && id) {
        await updateEmailAccount(id, formData);
        toast({
          title: "Success",
          description: "Email account updated successfully",
        });
      } else {
        await createEmailAccount(formData);
        toast({
          title: "Success",
          description: "Email account created successfully",
        });
      }
      navigate("/email-accounts");
    } catch (error) {
      setError("Failed to save email account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {testResult && testResult.status === "valid" && (
              <Alert className="bg-accent/20 text-accent-foreground border-accent">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Connection test successful</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="emailAccountName">Account Name</Label>
                <Input
                  id="emailAccountName"
                  name="emailAccountName"
                  value={formData.emailAccountName}
                  onChange={handleInputChange}
                  placeholder="My Email Account"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="provider">Email Provider</Label>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailProviders.map(provider => (
                      <SelectItem key={provider.name} value={provider.name}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Usually your email address"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Your email password or app password"
                  required
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">SMTP Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      name="smtpServer"
                      value={formData.smtpServer}
                      onChange={handleInputChange}
                      placeholder="smtp.example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtpPortNumber">Port</Label>
                    <Input
                      id="smtpPortNumber"
                      name="smtpPortNumber"
                      value={formData.smtpPortNumber}
                      onChange={handleInputChange}
                      placeholder="587"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtpSecurityProtocol">Security</Label>
                    <Select 
                      value={formData.smtpSecurityProtocol} 
                      onValueChange={(value) => handleSecurityChange('smtpSecurityProtocol', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select security" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="ssl_tls">SSL/TLS</SelectItem>
                        <SelectItem value="starttls">STARTTLS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">IMAP Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor="imapServer">IMAP Server</Label>
                    <Input
                      id="imapServer"
                      name="imapServer"
                      value={formData.imapServer}
                      onChange={handleInputChange}
                      placeholder="imap.example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imapPortNumber">Port</Label>
                    <Input
                      id="imapPortNumber"
                      name="imapPortNumber"
                      value={formData.imapPortNumber}
                      onChange={handleInputChange}
                      placeholder="993"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imapSecurityProtocol">Security</Label>
                    <Select 
                      value={formData.imapSecurityProtocol} 
                      onValueChange={(value) => handleSecurityChange('imapSecurityProtocol', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select security" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="ssl_tls">SSL/TLS</SelectItem>
                        <SelectItem value="starttls">STARTTLS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/email-accounts")}
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleTestConnection}
                disabled={!isFormValid() || isTesting}
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || !testResult || testResult.status !== "valid"}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}