import { useDroppable } from "@dnd-kit/core";
import type { Column, Task } from "../types";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
    column: Column;
    tasks: Task[];
}

export const ColumnContainer = ( { column, tasks } : ColumnProps) => {
    const { setNodeRef } = useDroppable({
        id:column.id,
    });
    return (
        <div className="column-container">
            <div className="column-header">
                <div className="flex gap-2 items-center">
                    <h3>{column.title}</h3>
                    <span className="column-count">
                        {tasks.length}
                    </span>
                </div>
            </div>
            <div ref={setNodeRef} className="column-tasks">
                <SortableContext
                    items={tasks.map(t => t.id) || []}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task}/>
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}