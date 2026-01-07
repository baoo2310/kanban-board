import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface TaskCardProps {
    task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task: task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if(isDragging) {
        return(
            <div
                ref={setNodeRef}
                style={style}
                className="task-dragging"
           />
        )
    }
    return(
        <div 
            ref={setNodeRef}
            style={style}
            className="task-card"  
        >
            <div 
                {...attributes}
                {...listeners}
                className="task-drag-handle"
            />
            <div className="task-content">
                <h3 className="task-title">
                    {task.title}
                </h3>
                {task.description && (
                    <p className="task-description">
                        {task.description}
                    </p>
                )}
                <div className="task-id">
                    {task.id.slice(0, 8)}
                </div>
            </div>
        </div>
    )
}