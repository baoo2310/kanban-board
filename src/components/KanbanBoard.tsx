import { closestCorners, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useKanban } from "../hooks/useKanban";
import { ColumnContainer } from "./ColumnContainer";
import type { TaskStatus } from "../types";

export const KanbanBoard = () => {
    const { state, dispatch } = useKanban();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 0 },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        const task = state.tasks[taskId];
        if (!task) return;

        const columnIds = state.columnOrder as TaskStatus[];
        let targetStatus: TaskStatus | null = null;

        if (columnIds.includes(overId as TaskStatus)) {
            targetStatus = overId as TaskStatus;
        } else if (state.tasks[overId]) {
            targetStatus = state.tasks[overId].status;
        }

        if (!targetStatus || task.status === targetStatus) return;

        dispatch({
            type: "UPDATE_TASK",
            payload: { ...task, status: targetStatus },
        });
    };

    return (
        <div className="kanban-board">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                {state.columnOrder.map((colId: string) => {
                    const column = state.columns[colId as keyof typeof state.columns];
                    const tasks = column.taskIds.map((taskId: string) => state.tasks[taskId]);

                    return (
                        <ColumnContainer key={column.id} column={column} tasks={tasks} />
                    );
                })}
            </DndContext>
        </div>
    );
};