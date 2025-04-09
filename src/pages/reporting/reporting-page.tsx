import { useState, useEffect } from "react";
import { getEmailReportOverview, getEmailReplies } from "@/lib/api";
import { EmailReply } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useTheme } from "@/components/theme-provider";

export function ReportingPage() {
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
  const [replies, setReplies] = useState<EmailReply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, repliesData] = await Promise.all([
          getEmailReportOverview(),
          getEmailReplies({ limit: 100 }) // Get a larger sample for reporting
        ]);
        
        setStats(statsData);
        setReplies(repliesData.items);
      } catch (error) {
        console.error("Failed to fetch reporting data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Prepare data for charts
  const statusData = [
    { name: "Sent", value: stats.totalSent - stats.totalFailed - stats.totalReplied },
    { name: "Failed", value: stats.totalFailed },
    { name: "Replied", value: stats.totalReplied }
  ];

  const engagementData = [
    { name: "Opened", value: stats.totalOpened },
    { name: "Clicked", value: stats.totalClicked },
    { name: "Replied", value: stats.totalReplied }
  ];

  // Group replies by date for timeline chart
  const timelineData = replies.reduce((acc: Record<string, { date: string; sent: number; replied: number }>, reply) => {
    const date = new Date(reply.emailSentAt).toLocaleDateString();
    
    if (!acc[date]) {
      acc[date] = { date, sent: 0, replied: 0 };
    }
    
    acc[date].sent += 1;
    
    if (reply.replyStatus === "replied") {
      acc[date].replied += 1;
    }
    
    return acc;
  }, {});

  const timelineChartData = Object.values(timelineData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by publication for platform breakdown
  const publicationData = replies.reduce((acc: Record<string, number>, reply) => {
    const publication = reply.publicationName || "Unknown";
    
    if (!acc[publication]) {
      acc[publication] = 0;
    }
    
    acc[publication] += 1;
    
    return acc;
  }, {});

  const publicationChartData = Object.entries(publicationData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 publications

  // Colors for charts
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Status</CardTitle>
            <CardDescription>
              Distribution of email statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>
              Email engagement breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={engagementData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Activity Timeline</CardTitle>
            <CardDescription>
              Sent and replied emails over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" name="Sent" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="replied" name="Replied" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Publications</CardTitle>
            <CardDescription>
              Most frequent publications in queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={publicationChartData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}