import { useEffect, useReducer, type ReactNode } from 'react';
import type { KanbanState, Task, TaskStatus } from '../types';
import { initData } from '../data/initData';
import { KanbanContext, type Action } from './kanbanContextDefinition'; 

function kanbanReducer(state: KanbanState, action: Action): KanbanState {
  const deriveStatusFromSubtasks = (task: Task): TaskStatus => {
    const subs = task.subTasks || [];
    if (subs.length === 0) return task.status;
    const completed = subs.filter((s) => s.isCompleted).length;
    if (completed === 0) return 'TODO';
    if (completed === subs.length) return 'DONE';
    return 'IN_PROGRESS';
  };

  switch (action.type) {
    case 'ADD_TASK': {
      const task = action.payload;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task.id]: task,
        },
        columns: {
          ...state.columns,
          [task.status]: {
            ...state.columns[task.status],
            taskIds: [...state.columns[task.status].taskIds, task.id],
          },
        },
      };
    }

    case 'DELETE_TASK': {
      const taskId = action.payload;
      const task = state.tasks[taskId];
      if (!task) return state; // Safety check

      const column = state.columns[task.status];
      const restTasks = { ...state.tasks } as typeof state.tasks;
      delete restTasks[taskId];

      return {
        ...state,
        tasks: restTasks,
        columns: {
          ...state.columns,
          [task.status]: {
            ...column,
            taskIds: column.taskIds.filter((id) => id !== taskId),
          },
        },
      };
    }

    case 'UPDATE_TASK': {
      const incomingTask = action.payload;
      const oldTask = state.tasks[incomingTask.id];
      const nextStatus = deriveStatusFromSubtasks(incomingTask);
      const updatedTask: Task = { ...incomingTask, status: nextStatus };
      
      // If status changed, update columns
      if(oldTask && oldTask.status !== updatedTask.status) {
        const oldColumn = state.columns[oldTask.status];
        const newColumn = state.columns[updatedTask.status];
        
        return {
          ...state,
          tasks: {
            ...state.tasks,
            [updatedTask.id]: updatedTask,
          },
          columns: {
            ...state.columns,
            [oldTask.status]: {
              ...oldColumn,
              taskIds: oldColumn.taskIds.filter((id) => id !== updatedTask.id),
            },
            [updatedTask.status]: {
              ...newColumn,
              taskIds: [...newColumn.taskIds, updatedTask.id], // append to bottom of target column
            },
          },
        };
      }
      
      // No status change, just update task; if in DONE, ensure it sits at the bottom
      if (oldTask) {
        const column = state.columns[oldTask.status];
        const filtered = column.taskIds.filter((id) => id !== updatedTask.id);
        const taskIds = oldTask.status === 'DONE'
          ? [...filtered, updatedTask.id]
          : column.taskIds;

        return {
          ...state,
          tasks: {
            ...state.tasks,
            [updatedTask.id]: updatedTask,
          },
          columns: {
            ...state.columns,
            [oldTask.status]: {
              ...column,
              taskIds,
            },
          },
        };
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [updatedTask.id]: updatedTask,
        },
      };
    }

    case 'MOVE_TASK': {
      const { activeId, sourceColumnId, targetColumnId, newIndex } = action.payload;
      const sourceColumn = state.columns[sourceColumnId];
      const targetColumn = state.columns[targetColumnId];
      const newSourceTaskIds = sourceColumn.taskIds.filter(id => id !== activeId);
      const newTargetTaskIds = sourceColumnId === targetColumnId 
        ? [...newSourceTaskIds] 
        : [...targetColumn.taskIds];
      newTargetTaskIds.splice(newIndex, 0, activeId);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [activeId]: {
            ...state.tasks[activeId],
            status: targetColumnId,
          },
        },
        columns: {
          ...state.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: newSourceTaskIds,
          },
          [targetColumnId]: {
            ...targetColumn,
            taskIds: newTargetTaskIds,
          },
        },
      };
    }
    default:
      return state;
  }
}

const loadState = (): KanbanState => {
  const saved = localStorage.getItem('kanban-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }
  return initData; // Nếu không có thì dùng Mock Data
};

export const KanbanProvider = ({ children }: { children: ReactNode }) => {
  // Thay initialData bằng hàm loadState()
  // Lưu ý: useReducer tham số thứ 3 là hàm init (lazy initialization)
  const [state, dispatch] = useReducer(kanbanReducer, initData, loadState);

  // Mỗi khi state thay đổi, lưu vào localStorage
  useEffect(() => {
    localStorage.setItem('kanban-state', JSON.stringify(state));
  }, [state]);

  return (
    <KanbanContext.Provider value={{ state, dispatch }}>
      {children}
    </KanbanContext.Provider>
  );
};