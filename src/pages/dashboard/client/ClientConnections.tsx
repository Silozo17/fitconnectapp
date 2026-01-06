import { useState } from "react";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
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
import { DashboardSectionHeader, ContentSection } from "@/components/shared";

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
            <Button onClick={() => setAddModalOpen(true)} className="gap-2 rounded-xl">
              <UserPlus className="w-4 h-4" />
              Add Connection
            </Button>
          }
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshConnections}
                className="ml-4 rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="bg-secondary/50 rounded-2xl p-1.5 h-auto max-w-md">
            <TabsTrigger value="friends" className="gap-2 rounded-xl px-4 py-2.5">
              <Users className="w-4 h-4" />
              Friends
              {connections.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {connections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 rounded-xl px-4 py-2.5">
              <Clock className="w-4 h-4" />
              Pending
              {pendingRequests.length > 0 && (
                <Badge variant="default" className="ml-1 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2 rounded-xl px-4 py-2.5">
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : connections.length === 0 ? (
              <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display">No friends yet</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto mb-6">
                  You haven't connected with anyone yet
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setAddModalOpen(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Friends
                </Button>
              </ContentSection>
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
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display">No pending requests</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  No pending connection requests
                </p>
              </ContentSection>
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
          </TabsContent>

          {/* Sent Tab */}
          <TabsContent value="sent">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : sentRequests.length === 0 ? (
              <ContentSection colorTheme="muted" className="py-16 text-center border-dashed">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                  <Send className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 font-display">No sent requests</h3>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  You haven't sent any requests
                </p>
              </ContentSection>
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
          </TabsContent>
        </Tabs>
      </div>

      <AddConnectionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </ClientDashboardLayout>
  );
};

export default ClientConnections;
