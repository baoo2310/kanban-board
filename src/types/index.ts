export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type UniqueId = string;

export interface Subtask {
    id: UniqueId;
    title: string;
    isCompleted: boolean;
}

export interface Task {
    id: UniqueId;
    title: string;
    description?: string;
    status: TaskStatus;
    subTasks: Subtask[];
    createdAt: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Column {
    id: TaskStatus;
    title: string;
    taskIds: UniqueId[];
}

export interface KanbanState {
    tasks: Record<UniqueId, Task>;
    columns: Record<TaskStatus, Column>;
    columnOrder: TaskStatus[];
}