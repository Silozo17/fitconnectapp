import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip } from "@/components/docs/DocComponents";
import { FileText, Edit, Eye, Search } from "lucide-react";

export default function AdminBlogDocs() {
  return (
    <DocsLayout
      title="Blog Management | Admin Guide"
      description="Create and manage blog posts for SEO and user engagement. Configure meta titles, descriptions, and featured images."
      breadcrumbs={[{ label: "Admin Guide", href: "/docs/admin" }, { label: "Blog" }]}
      noIndex
    >
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Managing Posts
        </h2>
        <p className="text-muted-foreground mb-4">
          The blog helps with SEO and provides valuable content for users. Create posts about 
          fitness tips, platform updates, and success stories.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Edit className="h-5 w-5 text-blue-500" />
          Creating a Post
        </h2>
        <DocStep stepNumber={1} title="Add new post">Click "New Post" in the blog management section.</DocStep>
        <DocStep stepNumber={2} title="Write content">Use the rich text editor to format your article.</DocStep>
        <DocStep stepNumber={3} title="Set SEO">Add meta title, description, and keywords.</DocStep>
        <DocStep stepNumber={4} title="Publish">Save as draft or publish immediately.</DocStep>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-green-500" />
          SEO Settings
        </h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Meta Title</strong> - Appears in search results (max 60 characters)</li>
          <li><strong>Meta Description</strong> - Summary shown in search (max 160 characters)</li>
          <li><strong>Keywords</strong> - Relevant terms for the article topic</li>
          <li><strong>Featured Image</strong> - Displayed in social shares and listings</li>
        </ul>
      </section>
      <DocTip>Schedule posts in advance to maintain a consistent publishing cadence.</DocTip>
    </DocsLayout>
  );
}
