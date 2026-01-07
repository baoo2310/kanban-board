import type { KanbanState } from "../types";
import { v4 as uuidv4 } from "uuid";

const TASK_ID_1 = uuidv4();
const TASK_ID_2 = uuidv4();
const TASK_ID_3 = uuidv4();

export const initData: KanbanState = {
    tasks: {
    [TASK_ID_1]: {
      id: TASK_ID_1,
      title: 'Init React + TS',
      description: 'Setup Vite, ESLint, and TailwindCSS',
      status: 'TODO',
      subTasks: [
        { id: uuidv4(), title: 'Install Node.js', isCompleted: true },
        { id: uuidv4(), title: 'Run create-vite', isCompleted: true },
      ],
      createdAt: new Date().toISOString(),
    },
    [TASK_ID_2]: {
      id: TASK_ID_2,
      title: 'Build Kanban Context',
      status: 'IN_PROGRESS',
      subTasks: [],
      createdAt: new Date().toISOString(),
    },
    [TASK_ID_3]: {
      id: TASK_ID_3,
      title: 'Optimize performance render',
      status: 'DONE',
      subTasks: [],
      createdAt: new Date().toISOString(),
    },
  },
  columns: {
    TODO: {
      id: 'TODO',
      title: 'To Do',
      taskIds: [TASK_ID_1],
    },
    IN_PROGRESS: {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      taskIds: [TASK_ID_2],
    },
    REVIEW: {
      id: 'REVIEW',
      title: 'Review',
      taskIds: [],
    },
    DONE: {
      id: 'DONE',
      title: 'Done',
      taskIds: [TASK_ID_3],
    },
  },
  columnOrder: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
}