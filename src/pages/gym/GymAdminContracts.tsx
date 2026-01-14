import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useContractTemplates, useSignedContracts, useContractTemplateMutations } from "@/hooks/gym/useGymContracts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock,
  Edit,
  Trash2,
  Eye,
  Shield,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GymAdminLayout } from "@/components/gym/admin/GymAdminLayout";

const CONTRACT_TYPES = [
  { value: "waiver", label: "Liability Waiver" },
  { value: "membership_agreement", label: "Membership Agreement" },
  { value: "terms", label: "Terms & Conditions" },
  { value: "liability", label: "Health Liability" },
];

const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  is_required: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

export default function GymAdminContracts() {
  const { gymId } = useParams();
  const { gym } = useGym();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState<string | null>(null);

  const { data: templates = [], isLoading: templatesLoading } = useContractTemplates(gymId);
  const { data: signedContracts = [], isLoading: signedLoading } = useSignedContracts(gymId);
  const { createTemplate, updateTemplate, deleteTemplate } = useContractTemplateMutations(gymId);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      type: "waiver",
      content: "",
      is_required: true,
      is_active: true,
    },
  });

  const handleSubmit = (data: TemplateFormData) => {
    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, ...data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingTemplate(null);
            form.reset();
          },
        }
      );
    } else {
      createTemplate.mutate(
        { ...data, gym_id: gymId! },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            form.reset();
          },
        }
      );
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      type: template.type,
      content: template.content,
      is_required: template.is_required,
      is_active: template.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template? This cannot be undone.")) {
      deleteTemplate.mutate(id);
    }
  };

  const activeTemplates = templates.filter(t => t.is_active);
  const totalSigned = signedContracts.length;

  return (
    <GymAdminLayout gymId={gymId!} gymName={gym?.name || "Loading..."}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Contracts & Waivers</h1>
            <p className="text-muted-foreground">Manage legal documents and member signatures</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingTemplate(null);
                form.reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "Edit Template" : "Create Contract Template"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Gym Liability Waiver" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTRACT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the full contract/waiver text..."
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {"{{member_name}}"} and {"{{date}}"} as placeholders
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-6">
                    <FormField
                      control={form.control}
                      name="is_required"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Required for signup</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Active</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
                      {editingTemplate ? "Update" : "Create"} Template
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{templates.length}</p>
                  <p className="text-sm text-muted-foreground">Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeTemplates.length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSigned}</p>
                  <p className="text-sm text-muted-foreground">Signed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {templates.filter(t => t.is_required).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="templates">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="signed">Signed Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            {templatesLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
            ) : templates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first contract or waiver template
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>
                            {CONTRACT_TYPES.find(t => t.value === template.type)?.label}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingContent(template.content)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Content
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(template.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {template.is_required && (
                          <Badge variant="outline">Required</Badge>
                        )}
                        <Badge variant="outline">v{template.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content.substring(0, 150)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Updated {format(new Date(template.updated_at), "MMM d, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="signed" className="mt-4">
            {signedLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading signed documents...</div>
            ) : signedContracts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No signed documents yet</h3>
                  <p className="text-muted-foreground">
                    Signed contracts will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Document</th>
                          <th className="text-left p-4 font-medium">Member</th>
                          <th className="text-left p-4 font-medium">Signed At</th>
                          <th className="text-left p-4 font-medium">Version</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {signedContracts.map((contract) => (
                          <tr key={contract.id}>
                            <td className="p-4">
                              {contract.template?.name || "Unknown"}
                            </td>
                            <td className="p-4">Member #{contract.member_id.slice(0, 8)}</td>
                            <td className="p-4">
                              {format(new Date(contract.signed_at), "MMM d, yyyy HH:mm")}
                            </td>
                            <td className="p-4">v{contract.template_version}</td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewingContent(contract.template_content_snapshot)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Content Viewer Dialog */}
        <Dialog open={!!viewingContent} onOpenChange={() => setViewingContent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document Content</DialogTitle>
            </DialogHeader>
            <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
              {viewingContent}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </GymAdminLayout>
  );
}
