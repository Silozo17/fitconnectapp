import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAllReviews, useDeleteReview, useReviewDisputes, useUpdateReviewDispute } from "@/hooks/useAdminData";
import { MessageSquare, Star, AlertTriangle, CheckCircle, XCircle, Search, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

const AdminReviews = () => {
  const { data: reviews, isLoading: reviewsLoading } = useAllReviews();
  const { data: disputes, isLoading: disputesLoading } = useReviewDisputes();
  const deleteReview = useDeleteReview();
  const updateDispute = useUpdateReviewDispute();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const filteredReviews = reviews?.filter((review: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      review.review_text?.toLowerCase().includes(searchLower) ||
      review.client_profiles?.first_name?.toLowerCase().includes(searchLower) ||
      review.coach_profiles?.display_name?.toLowerCase().includes(searchLower)
    );
  });

  const pendingDisputes = disputes?.filter((d: any) => d.status === "pending");
  const resolvedDisputes = disputes?.filter((d: any) => d.status !== "pending");

  const handleResolveDispute = async (status: "approved" | "rejected") => {
    if (!selectedDispute) return;
    
    await updateDispute.mutateAsync({
      id: selectedDispute.id,
      status,
      adminNotes,
    });

    // If approved, delete the review
    if (status === "approved" && selectedDispute.review_id) {
      await deleteReview.mutateAsync(selectedDispute.review_id);
    }

    setSelectedDispute(null);
    setAdminNotes("");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
          />
        ))}
      </div>
    );
  };

  if (reviewsLoading || disputesLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reviews & Disputes | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reviews & Disputes</h1>
            <p className="text-muted-foreground mt-1">Manage platform reviews and handle disputes</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{reviews?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {reviews?.length 
                      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) 
                      : "0"}
                  </p>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-500">{pendingDisputes?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-500">{resolvedDisputes?.length || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="reviews" className="space-y-4">
            <TabsList>
              <TabsTrigger value="reviews">All Reviews</TabsTrigger>
              <TabsTrigger value="disputes" className="relative">
                Disputes
                {pendingDisputes && pendingDisputes.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingDisputes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Reviews</CardTitle>
                      <CardDescription>View and moderate platform reviews</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredReviews && filteredReviews.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <Table className="min-w-[700px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Coach</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="w-[300px] hidden sm:table-cell">Review</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead className="hidden sm:table-cell">Visibility</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReviews.map((review: any) => (
                          <TableRow key={review.id}>
                            <TableCell>
                              {review.client_profiles?.first_name} {review.client_profiles?.last_name}
                            </TableCell>
                            <TableCell>{review.coach_profiles?.display_name || "Unknown"}</TableCell>
                            <TableCell>{renderStars(review.rating)}</TableCell>
                            <TableCell className="max-w-[300px] truncate hidden sm:table-cell">
                              {review.review_text || <span className="text-muted-foreground">No text</span>}
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden md:table-cell">
                              {format(new Date(review.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant={review.is_public ? "default" : "secondary"}>
                                {review.is_public ? "Public" : "Private"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this review?")) {
                                    deleteReview.mutate(review.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disputes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Pending Disputes
                  </CardTitle>
                  <CardDescription>Review disputes that need your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingDisputes && pendingDisputes.length > 0 ? (
                    <div className="space-y-4">
                      {pendingDisputes.map((dispute: any) => (
                        <div key={dispute.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{dispute.coach_profiles?.display_name} disputes a review</p>
                              <p className="text-sm text-muted-foreground">
                                Submitted {format(new Date(dispute.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                              Pending
                            </Badge>
                          </div>
                          
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm font-medium mb-1">Dispute Reason:</p>
                            <p className="text-sm">{dispute.reason}</p>
                          </div>

                          {dispute.reviews && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">Original Review:</p>
                              <div className="flex items-center gap-2 mb-1">
                                {renderStars(dispute.reviews.rating)}
                              </div>
                              <p className="text-sm">{dispute.reviews.review_text || "No text provided"}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setSelectedDispute(dispute);
                                setAdminNotes("");
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review & Decide
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                      <p>No pending disputes</p>
                      <p className="text-sm">All disputes have been resolved</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {resolvedDisputes && resolvedDisputes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resolved Disputes</CardTitle>
                    <CardDescription>Previously handled disputes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Coach</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Resolved</TableHead>
                          <TableHead>Admin Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resolvedDisputes.map((dispute: any) => (
                          <TableRow key={dispute.id}>
                            <TableCell>{dispute.coach_profiles?.display_name}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{dispute.reason}</TableCell>
                            <TableCell>
                              <Badge variant={dispute.status === "approved" ? "default" : "secondary"}>
                                {dispute.status === "approved" ? "Review Removed" : "Rejected"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {dispute.resolved_at && format(new Date(dispute.resolved_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                              {dispute.admin_notes || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Dispute Resolution Dialog */}
          <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Resolve Dispute</DialogTitle>
                <DialogDescription>
                  Review the dispute and make a decision
                </DialogDescription>
              </DialogHeader>

              {selectedDispute && (
                <div className="space-y-4 py-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">Dispute from {selectedDispute.coach_profiles?.display_name}:</p>
                    <p className="text-sm">{selectedDispute.reason}</p>
                  </div>

                  {selectedDispute.reviews && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1">Original Review:</p>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(selectedDispute.reviews.rating)}
                      </div>
                      <p className="text-sm">{selectedDispute.reviews.review_text || "No text provided"}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea
                      placeholder="Add notes about your decision..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleResolveDispute("rejected")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Dispute
                </Button>
                <Button onClick={() => handleResolveDispute("approved")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Remove Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminReviews;