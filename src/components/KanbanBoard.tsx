import { useState } from "react";
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent, type DragStartEvent, type DragCancelEvent } from "@dnd-kit/core";
import { useKanban } from "../hooks/useKanban";
import { ColumnContainer } from "./ColumnContainer";
import type { Task, TaskStatus } from "../types";

export const KanbanBoard = () => {
    const { state, dispatch } = useKanban();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const allTasks = Object.values(state.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((task) => {
        const subs = task.subTasks || [];
        if (subs.length > 0) return subs.every((s) => s.isCompleted);
        return task.status === "DONE";
    }).length;
    const completionPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 0 },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const taskId = event.active.id as string;
        const task = state.tasks[taskId];
        if (task) setActiveTask(task);
    };

    const handleDragCancel = (_event: DragCancelEvent) => {
        setActiveTask(null);
    };

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

        setActiveTask(null);
    };

    return (
        <div className="kanban-board">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                {state.columnOrder.map((colId: string) => {
                    const column = state.columns[colId as keyof typeof state.columns];
                    const tasks = column.taskIds.map((taskId: string) => state.tasks[taskId]);

                    return (
                        <ColumnContainer key={column.id} column={column} tasks={tasks} />
                    );
                })}

                <div className="summary-column" aria-label="Board summary">
                    <div className="summary-header">
                        <h3 className="column-title">Summary</h3>
                        <span className="column-count">{totalTasks}</span>
                    </div>
                    <div className="summary-body">
                        <div className="summary-row">
                            <span className="summary-label">Done</span>
                            <span className="summary-value">{completedTasks}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Remaining</span>
                            <span className="summary-value">{totalTasks - completedTasks}</span>
                        </div>
                        <div className="summary-progress" aria-label="Overall completion">
                            <div className="summary-progress-header">
                                <span className="summary-progress-count">{completedTasks}/{totalTasks}</span>
                                <span className="summary-progress-percent">{completionPercent}%</span>
                            </div>
                            <div className="summary-progress-bar" aria-hidden="true">
                                <div className="summary-progress-fill" style={{ width: `${completionPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="task-card" style={{ cursor: "grabbing", width: 320 }}>
                            <div className="task-drag-handle" />
                            <div className="task-content">
                                <h3 className="task-title">{activeTask.title}</h3>
                                {activeTask.description && (
                                    <p className="task-description">{activeTask.description}</p>
                                )}
                                <div className="task-id">{activeTask.id.slice(0, 8)}</div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};