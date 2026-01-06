import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Clock, Send, Loader2 } from "lucide-react";
import { useConnections } from "@/hooks/useConnections";
import { ConnectionCard } from "@/components/connections/ConnectionCard";
import { PendingRequestCard } from "@/components/connections/PendingRequestCard";
import { AddConnectionModal } from "@/components/connections/AddConnectionModal";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

const CoachConnections = () => {
  const { t } = useTranslation('coach');
  const { user } = useAuth();
  const {
    connections,
    pendingRequests,
    sentRequests,
    loading,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeConnection,
  } = useConnections();
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <PageHelpBanner
        pageKey="coach_connections"
        title="Client Connections"
        description="Manage connection requests and client relationships"
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Client <span className="gradient-text">Connections</span>
            </h1>
            <p className="text-muted-foreground">
              {t('connections.subtitle')}
            </p>
          </div>
          <Button onClick={() => setAddModalOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            {t('connections.addConnection')}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="friends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="friends" className="gap-2">
              <Users className="w-4 h-4" />
              {t('connections.friends')}
              {connections.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {connections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              {t('connections.pending')}
              {pendingRequests.length > 0 && (
                <Badge variant="default" className="ml-1 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="w-4 h-4" />
              {t('connections.sent')}
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
                  {t('connections.yourConnections')}
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
                      {t('connections.noConnections')}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setAddModalOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('connections.findConnections')}
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
                  {t('connections.pendingRequests')}
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
                      {t('connections.noPendingRequests')}
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
                  {t('connections.sentRequests')}
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
                      {t('connections.noSentRequests')}
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
    </DashboardLayout>
  );
};

export default CoachConnections;