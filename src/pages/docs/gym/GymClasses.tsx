import { DocsLayout } from "@/components/docs/DocsLayout";
import { DocStep, DocTip, DocInfo, DocWarning } from "@/components/docs/DocComponents";

export default function GymClasses() {
  return (
    <DocsLayout
      title="Class Scheduling"
      description="Create class types, build your weekly schedule, manage instructor assignments, and handle bookings and waitlists."
      breadcrumbs={[
        { label: "For Gym Owners", href: "/docs/gym" },
        { label: "Class Scheduling" }
      ]}
    >
      <section className="mb-12">
        <p className="text-muted-foreground mb-4">
          A well-organized class schedule is essential for member satisfaction. Our scheduling 
          system makes it easy to create, manage, and modify your timetable.
        </p>
      </section>

      {/* Class Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Setting Up Class Types</h2>
        <p className="text-muted-foreground mb-4">
          Before creating your schedule, define the types of classes you offer:
        </p>

        <DocStep stepNumber={1} title="Create a Class Type">
          <p className="mb-4">Navigate to Schedule → Class Types and click "Add Class Type":</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Name</strong> - e.g., "Boxing Fundamentals", "HIIT", "Yoga Flow"</li>
            <li><strong>Description</strong> - What members can expect from this class</li>
            <li><strong>Duration</strong> - Default length (45 min, 60 min, etc.)</li>
            <li><strong>Colour</strong> - For visual identification on the schedule</li>
            <li><strong>Category</strong> - Group similar classes together</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={2} title="Set Capacity & Rules">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Default Capacity</strong> - Maximum participants</li>
            <li><strong>Minimum Age</strong> - Age restrictions if applicable</li>
            <li><strong>Required Level</strong> - Beginner, intermediate, advanced</li>
            <li><strong>Equipment Needed</strong> - What members should bring</li>
            <li><strong>Eligible Memberships</strong> - Which plans can book this class</li>
          </ul>
          <DocTip>
            Create separate class types for different skill levels (e.g., "Boxing - Beginners" 
            vs "Boxing - Advanced") rather than mixing levels in one class.
          </DocTip>
        </DocStep>

        <DocStep stepNumber={3} title="Assign Instructors">
          <p className="mb-4">
            Link qualified instructors to each class type. Only assigned instructors can be 
            scheduled to teach that class.
          </p>
        </DocStep>
      </section>

      {/* Creating the Schedule */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Creating Your Schedule</h2>

        <h3 className="text-lg font-medium mb-3">Weekly View</h3>
        <p className="text-muted-foreground mb-4">
          The schedule displays a weekly grid showing all classes. Each day is divided into 
          time slots based on your operating hours.
        </p>

        <h3 className="text-lg font-medium mb-3 mt-6">Adding a Class</h3>
        <DocStep stepNumber={1} title="Click on a Time Slot">
          <p>Click on the day and time where you want to add a class, or use the "Add Class" button.</p>
        </DocStep>

        <DocStep stepNumber={2} title="Configure the Class">
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Class Type</strong> - Select from your defined types</li>
            <li><strong>Date & Time</strong> - Confirm the start time</li>
            <li><strong>Duration</strong> - Uses default or override for this instance</li>
            <li><strong>Instructor</strong> - Assign a qualified instructor</li>
            <li><strong>Location</strong> - Room or area within the gym</li>
            <li><strong>Capacity</strong> - Override default if needed</li>
          </ul>
        </DocStep>

        <DocStep stepNumber={3} title="Set Recurrence">
          <p className="mb-4">For regular classes, set up recurring patterns:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Weekly</strong> - Same day and time every week</li>
            <li><strong>Bi-weekly</strong> - Every other week</li>
            <li><strong>Monthly</strong> - Same week of each month</li>
            <li><strong>Custom</strong> - Specific days or patterns</li>
          </ul>
          <DocInfo>
            Recurring classes create individual class instances. Changes to one instance 
            don't affect others unless you choose to update the series.
          </DocInfo>
        </DocStep>
      </section>

      {/* Managing Classes */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Managing Scheduled Classes</h2>

        <h3 className="text-lg font-medium mb-3">Editing Classes</h3>
        <p className="text-muted-foreground mb-4">
          Click on any scheduled class to modify it:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Change instructor (notifies booked members)</li>
          <li>Modify time or duration</li>
          <li>Adjust capacity</li>
          <li>Add special notes</li>
        </ul>
        <p className="text-muted-foreground">
          When editing a recurring class, choose whether to update just this instance, 
          this and future classes, or the entire series.
        </p>

        <h3 className="text-lg font-medium mb-3 mt-6">Cancelling Classes</h3>
        <p className="text-muted-foreground mb-4">
          When you need to cancel a class:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>All booked members receive automatic notification</li>
          <li>Class credits or passes are refunded</li>
          <li>Option to provide a cancellation reason</li>
          <li>Offer to rebook members into alternative classes</li>
        </ul>
        <DocWarning>
          Cancelling recurring classes affects all future instances. Use "Cancel this 
          instance only" for one-time cancellations.
        </DocWarning>

        <h3 className="text-lg font-medium mb-3 mt-6">Substitute Instructors</h3>
        <p className="text-muted-foreground mb-4">
          When the regular instructor is unavailable:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Assign a substitute from qualified instructors</li>
          <li>Option to notify booked members of the change</li>
          <li>Original instructor remains assigned for future recurring classes</li>
        </ul>
      </section>

      {/* Bookings & Attendance */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Bookings & Attendance</h2>

        <h3 className="text-lg font-medium mb-3">Member Booking</h3>
        <p className="text-muted-foreground mb-4">
          Members can book classes through the member portal:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>View available classes in their timetable</li>
          <li>Book based on their membership allowances</li>
          <li>Receive confirmation and reminders</li>
          <li>Cancel bookings (subject to your policies)</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Booking Settings</h3>
        <p className="text-muted-foreground mb-4">Configure booking rules:</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Advance Booking</strong> - How far ahead members can book (e.g., 7 days)</li>
          <li><strong>Cancellation Window</strong> - Latest time to cancel without penalty (e.g., 4 hours)</li>
          <li><strong>Late Cancel Fee</strong> - Charge for late cancellations or no-shows</li>
          <li><strong>Booking Limits</strong> - Maximum concurrent bookings per member</li>
        </ul>
        <DocTip>
          A 2-hour cancellation window and late cancel fee helps reduce no-shows while 
          remaining member-friendly.
        </DocTip>

        <h3 className="text-lg font-medium mb-3 mt-6">Waitlists</h3>
        <p className="text-muted-foreground mb-4">
          When a class reaches capacity:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Members can join the waitlist</li>
          <li>Automatic promotion when spots open</li>
          <li>Email/push notification sent immediately</li>
          <li>Time limit to confirm waitlist spot</li>
        </ul>

        <h3 className="text-lg font-medium mb-3 mt-6">Attendance Tracking</h3>
        <p className="text-muted-foreground mb-4">
          Mark attendance during or after class:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Instructors can mark attendance from their app</li>
          <li>Members check in via QR code</li>
          <li>Front desk can manually update attendance</li>
          <li>No-shows are automatically flagged</li>
        </ul>
      </section>

      {/* Room/Area Management */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Room & Area Management</h2>
        <p className="text-muted-foreground mb-4">
          If your gym has multiple training areas:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
          <li>Define rooms/areas (Main Floor, Studio A, Spin Room, etc.)</li>
          <li>Set capacity for each room</li>
          <li>Assign classes to specific rooms</li>
          <li>Prevent double-booking of spaces</li>
        </ul>
        <p className="text-muted-foreground">
          The schedule can show a combined view or filter by room to avoid conflicts.
        </p>
      </section>
    </DocsLayout>
  );
}
