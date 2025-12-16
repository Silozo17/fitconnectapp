import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WidgetItem {
  id: string;
  widget_type: string;
  title: string;
  position: number;
  size: "small" | "medium" | "large" | "full";
  is_visible: boolean;
  config: Record<string, any>;
}

interface DraggableWidgetGridProps {
  widgets: WidgetItem[];
  editMode: boolean;
  onReorder: (widgets: WidgetItem[]) => void;
  onResize: (widgetId: string, size: "small" | "medium" | "large" | "full") => void;
  renderWidget: (widget: WidgetItem) => React.ReactNode;
  getSizeClasses: (size: string | null | undefined) => string;
}

function SortableWidget({
  widget,
  editMode,
  onResize,
  renderWidget,
  getSizeClasses,
}: {
  widget: WidgetItem;
  editMode: boolean;
  onResize: (widgetId: string, size: "small" | "medium" | "large" | "full") => void;
  renderWidget: (widget: WidgetItem) => React.ReactNode;
  getSizeClasses: (size: string | null | undefined) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        getSizeClasses(widget.size),
        isDragging && "opacity-50 z-50",
        editMode && "ring-2 ring-dashed ring-primary/30 rounded-lg"
      )}
    >
      <div className="relative h-full">
        {editMode && (
          <div className="absolute -top-2 -right-2 z-10 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 cursor-grab active:cursor-grabbing shadow-md"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-6 w-6 shadow-md">
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onResize(widget.id, "small")}>
                  <Minimize2 className="h-4 w-4 mr-2" /> Small
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResize(widget.id, "medium")}>
                  <Maximize2 className="h-4 w-4 mr-2" /> Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResize(widget.id, "large")}>
                  <Maximize2 className="h-4 w-4 mr-2" /> Large
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResize(widget.id, "full")}>
                  <Maximize2 className="h-4 w-4 mr-2" /> Full Width
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {renderWidget(widget)}
      </div>
    </div>
  );
}

export function DraggableWidgetGrid({
  widgets,
  editMode,
  onReorder,
  onResize,
  renderWidget,
  getSizeClasses,
}: DraggableWidgetGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(widgets, oldIndex, newIndex).map((w, index) => ({
        ...w,
        position: index,
      }));

      onReorder(newWidgets);
    }
  };

  const visibleWidgets = widgets.filter((w) => w.is_visible);
  const activeWidget = activeId ? widgets.find((w) => w.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleWidgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              editMode={editMode}
              onResize={onResize}
              renderWidget={renderWidget}
              getSizeClasses={getSizeClasses}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeWidget ? (
          <div className={cn(getSizeClasses(activeWidget.size), "opacity-80")}>
            {renderWidget(activeWidget)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
