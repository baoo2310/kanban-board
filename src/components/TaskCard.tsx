import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Task } from "../types";
import { useKanban } from "../hooks/useKanban";

interface TaskCardProps {
    task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
    const { dispatch } = useKanban();
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");
    const totalSubtasks = task.subTasks?.length ?? 0;
    const completedSubtasks = task.subTasks?.filter((s) => s.isCompleted).length ?? 0;
    const completionPercent = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);
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
            type: "Task",
            task: task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="task-dragging"
            />
        );
    }

    return (
        <>
            <div 
                ref={setNodeRef}
                style={style}
                className="task-card"  
                {...attributes}
                {...listeners}
                onClick={() => setIsDetailOpen(true)}
            >
                <div 
                    className="task-drag-handle"
                />
                <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && (
                        <p className="task-description">{task.description}</p>
                    )}

                    {totalSubtasks > 0 && (
                        <div className="task-progress" aria-label="Task progress">
                            <div className="task-progress-header">
                                <span className="task-progress-count">{completedSubtasks}/{totalSubtasks}</span>
                                <span className="task-progress-percent">{completionPercent}%</span>
                            </div>
                            <div className="task-progress-bar" aria-hidden="true">
                                <div
                                    className="task-progress-fill"
                                    style={{ width: `${completionPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="task-id">{task.id.slice(0, 8)}</div>
                </div>
            </div>

            {isDetailOpen && (
                <div className="modal-backdrop" onClick={() => setIsDetailOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h4 className="modal-title">{task.title}</h4>
                        {task.description && (
                            <p className="task-description" style={{ marginBottom: 12 }}>
                                {task.description}
                            </p>
                        )}

                        <div className="subtask-header">
                            <h5 className="modal-subtitle">Subtasks</h5>
                            <div className="subtask-progress">
                                <span className="subtask-progress-count">{completedSubtasks}/{totalSubtasks}</span>
                                <div className="subtask-progress-bar" aria-hidden="true">
                                    <div
                                        className="subtask-progress-fill"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                                <span className="subtask-progress-percent">{completionPercent}%</span>
                            </div>
                        </div>
                        <div className="subtask-list">
                            {task.subTasks && task.subTasks.length > 0 ? (
                                task.subTasks.map((st) => (
                                    <div key={st.id} className="subtask-item">
                                        <label className="subtask-label">
                                            <input
                                                type="checkbox"
                                                checked={st.isCompleted}
                                                onChange={() => {
                                                    const updated = task.subTasks.map((s) =>
                                                        s.id === st.id
                                                            ? { ...s, isCompleted: !s.isCompleted }
                                                            : s
                                                    );
                                                    dispatch({
                                                        type: "UPDATE_TASK",
                                                        payload: { ...task, subTasks: updated },
                                                    });
                                                }}
                                            />
                                            <span
                                                className={
                                                    st.isCompleted ? "subtask-text done" : "subtask-text"
                                                }
                                            >
                                                {st.title}
                                            </span>
                                        </label>
                                        <button
                                            className="subtask-delete"
                                            aria-label="Delete subtask"
                                            onClick={() => {
                                                const updated = task.subTasks.filter((s) => s.id !== st.id);
                                                dispatch({
                                                    type: "UPDATE_TASK",
                                                    payload: { ...task, subTasks: updated },
                                                });
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="subtask-empty">No subtasks yet</div>
                            )}
                        </div>

                        <div className="subtask-add">
                            <input
                                className="modal-input"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="New subtask"
                            />
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const title = newSubtask.trim();
                                    if (!title) return;
                                    const updated = [
                                        ...(task.subTasks || []),
                                        {
                                            id: `${task.id}-st-${Date.now()}`,
                                            title,
                                            isCompleted: false,
                                        },
                                    ];
                                    dispatch({
                                        type: "UPDATE_TASK",
                                        payload: { ...task, subTasks: updated },
                                    });
                                    setNewSubtask("");
                                }}
                            >
                                Add
                            </button>
                        </div>

                        <div className="modal-actions" style={{ marginTop: 16 }}>
                            <button
                                className="btn-danger"
                                onClick={() => {
                                    dispatch({ type: "DELETE_TASK", payload: task.id });
                                    setIsDetailOpen(false);
                                }}
                            >
                                Delete Task
                            </button>
                            <button className="btn-secondary" onClick={() => setIsDetailOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};