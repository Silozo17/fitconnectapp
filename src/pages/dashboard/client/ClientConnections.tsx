import { useState } from "react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Clock, Send, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useConnections } from "@/hooks/useConnections";
import { ConnectionCard } from "@/components/connections/ConnectionCard";
import { PendingRequestCard } from "@/components/connections/PendingRequestCard";
import { AddConnectionModal } from "@/components/connections/AddConnectionModal";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";
import { DashboardSectionHeader } from "@/components/shared/DashboardSectionHeader";

const ClientConnections = () => {
  const { user } = useAuth();
  const {
    connections,
    pendingRequests,
    sentRequests,
    loading,
    error,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeConnection,
    refreshConnections,
  } = useConnections();
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <ClientDashboardLayout>
      <PageHelpBanner
        pageKey="client_connections"
        title="Coach Connections"
        description="Manage your relationships with coaches"
      />
      <div className="space-y-11">
        {/* Header */}
        <DashboardSectionHeader
          title="Connections"
          description="Connect with friends and other fitness enthusiasts"
          action={
            <Button onClick={() => setAddModalOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Connection
            </Button>
          }
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshConnections}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="friends" className="gap-2">
              <Users className="w-4 h-4" />
              Friends
              {connections.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {connections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="default" className="ml-1 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="w-4 h-4" />
              Sent
              {sentRequests.length > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      You haven't connected with anyone yet
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setAddModalOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find Friends
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connections.map((connection) => (
                      <ConnectionCard
                        key={connection.id}
                        connection={connection}
                        currentUserId={user?.id || ""}
                        onRemove={removeConnection}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      No pending connection requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <PendingRequestCard
                        key={request.id}
                        request={request}
                        type="incoming"
                        onAccept={acceptRequest}
                        onReject={rejectRequest}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent value="sent">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Sent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : sentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      You haven't sent any requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <PendingRequestCard
                        key={request.id}
                        request={request}
                        type="sent"
                        onAccept={acceptRequest}
                        onReject={rejectRequest}
                        onCancel={cancelRequest}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddConnectionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </ClientDashboardLayout>
  );
};

export default ClientConnections;
