import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymRecurringSchedules() {
  return (
    <DocsLayout
      title="Recurring Schedules"
      description="Set up automatic weekly class schedules, manage recurring events, and streamline your gym's timetable management."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Recurring Schedules" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          Instead of creating each class individually, set up recurring schedules that automatically 
          generate your weekly timetable. Save hours of administrative work while maintaining a 
          consistent schedule for your members.
        </p>
      </section>

      {/* Understanding Recurring Schedules */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">How Recurring Schedules Work</h2>
        
        <p className="text-muted-foreground mb-4">
          A recurring schedule is a template that creates class instances automatically:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">The Template</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Class type and description</li>
              <li>• Day(s) of the week</li>
              <li>• Time and duration</li>
              <li>• Assigned instructor</li>
              <li>• Capacity limits</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Generated Classes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Created automatically each week</li>
              <li>• Bookable by members</li>
              <li>• Can be individually modified</li>
              <li>• Inherit template settings</li>
            </ul>
          </div>
        </div>

        <DocInfo>
          Changes to a recurring schedule affect future classes only. Already-created classes 
          with bookings remain unchanged unless you explicitly update them.
        </DocInfo>
      </section>

      {/* Creating a Recurring Schedule */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Creating a Recurring Schedule</h2>

        <DocStep stepNumber={1} title="Navigate to Schedule Templates">
          <p>Go to Classes → Schedule Templates or Recurring Schedules in your gym dashboard.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Create New Template">
          <p>Click "Create New Schedule" and select the class type.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Set the Pattern">
          <p className="mb-4">Configure when the class repeats:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Days</strong> - Select which days of the week</li>
            <li><strong>Time</strong> - Start time for each occurrence</li>
            <li><strong>Duration</strong> - How long the class runs</li>
            <li><strong>Start Date</strong> - When to begin generating classes</li>
            <li><strong>End Date</strong> - Optional end date for seasonal schedules</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={4} title="Assign Instructor">
          <p>Choose the default instructor. You can set different instructors for different days.</p>
        </DocStep>

        <DocStep stepNumber={5} title="Set Capacity and Booking Rules">
          <p className="mb-4">Configure class settings:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Maximum participants</li>
            <li>Waitlist enabled/disabled</li>
            <li>Booking opens (e.g., 7 days before)</li>
            <li>Cancellation deadline</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={6} title="Preview and Activate">
          <p>Review the generated schedule and activate it. Classes will be created automatically.</p>
        </DocStep>

        <DocTip>
          Use the preview feature to check how your schedule looks over the coming weeks before activating.
        </DocTip>
      </section>

      {/* Managing Templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Managing Schedule Templates</h2>

        <h3 className="text-xl font-medium mb-4">Editing a Template</h3>
        <p className="text-muted-foreground mb-4">
          When you edit a recurring schedule template:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Future classes not yet created will use the new settings</li>
          <li>Already-created classes remain unchanged</li>
          <li>You can choose to update existing upcoming classes (without bookings)</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Pausing a Template</h3>
        <p className="text-muted-foreground mb-4">
          Temporarily stop a recurring schedule without deleting it:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
          <li>Click "Pause" on the template</li>
          <li>No new classes will be generated</li>
          <li>Existing scheduled classes remain active</li>
          <li>Resume anytime to start generating again</li>
        </ul>

        <h3 className="text-xl font-medium mb-4">Deleting a Template</h3>
        <DocWarning>
          Deleting a template stops future class generation. You'll be asked whether to also 
          delete upcoming classes that haven't occurred yet. Classes with bookings cannot be 
          bulk deleted and must be handled individually.
        </DocWarning>
      </section>

      {/* Handling Exceptions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Handling Exceptions</h2>

        <h3 className="text-xl font-medium mb-4">Holiday Closures</h3>
        <DocStep stepNumber={1} title="Add Holiday Dates">
          <p>Go to Settings → Holidays and add your closure dates (e.g., Christmas, Bank Holidays).</p>
        </DocStep>

        <DocStep stepNumber={2} title="Configure Holiday Behaviour">
          <p className="mb-4">Choose what happens to classes on holidays:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Skip</strong> - Don't generate classes on this date</li>
            <li><strong>Cancel</strong> - Generate but mark as cancelled</li>
            <li><strong>Normal</strong> - Generate as usual (for classes that run on holidays)</li>
          </ul>
        </DocStep>

        <h3 className="text-xl font-medium mb-4 mt-6">One-Time Changes</h3>
        <p className="text-muted-foreground mb-4">
          For individual class changes without affecting the template:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Navigate to the specific class in the calendar</li>
          <li>Edit the individual class (time, instructor, capacity)</li>
          <li>Changes only affect that specific occurrence</li>
        </ul>

        <DocTip>
          For regular schedule variations (e.g., shorter classes on Fridays), create a 
          separate template rather than modifying individual classes each week.
        </DocTip>
      </section>

      {/* Instructor Cover */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Instructor Cover and Substitutions</h2>

        <p className="text-muted-foreground mb-4">
          When an instructor can't take their scheduled class:
        </p>

        <DocStep stepNumber={1} title="Open the Class">
          <p>Find the affected class in the calendar and click to open it.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Assign Cover">
          <p>Click "Change Instructor" and select the covering instructor.</p>
        </DocStep>

        <DocStep stepNumber={3} title="Notify Members">
          <p>Optionally send notifications to booked members about the instructor change.</p>
        </DocStep>

        <h3 className="text-xl font-medium mb-4 mt-6">Setting Up Cover Permissions</h3>
        <p className="text-muted-foreground mb-4">
          Control who can assign cover instructors:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Instructors can request cover themselves</li>
          <li>Managers approve or assign cover</li>
          <li>System suggests available instructors based on their schedules</li>
        </ul>
      </section>

      {/* Schedule Generation Settings */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Schedule Generation Settings</h2>

        <p className="text-muted-foreground mb-4">
          Configure how far in advance classes are generated:
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Generation Horizon</h4>
            <p className="text-sm text-muted-foreground">
              How many weeks ahead to create classes. Default is 4 weeks. 
              Increase for members who book far in advance.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h4 className="font-medium mb-2">Generation Timing</h4>
            <p className="text-sm text-muted-foreground">
              When new classes are generated. Default is midnight Sunday. 
              Can be set to any day/time that suits your workflow.
            </p>
          </div>
        </div>

        <DocInfo>
          Classes are generated automatically based on your settings. You can also manually 
          trigger generation from the Schedule Templates page.
        </DocInfo>
      </section>

      {/* Multi-Location Schedules */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Multi-Location Schedules</h2>
        
        <p className="text-muted-foreground mb-4">
          For gyms with multiple locations:
        </p>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Each template is assigned to a specific location</li>
          <li>Instructors can be scheduled across locations</li>
          <li>Area managers can view and edit schedules for their locations</li>
          <li>Clone templates between locations to maintain consistency</li>
        </ul>

        <DocTip>
          Create a "master schedule" for your flagship location, then clone and modify it 
          for other locations to save setup time.
        </DocTip>
      </section>
    </DocsLayout>
  );
}
