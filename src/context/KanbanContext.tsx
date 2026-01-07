import React, { useReducer, type ReactNode } from 'react';
import type { KanbanState } from '../types';
import { initData } from '../data/initData';
import { KanbanContext, type Action } from './kanbanContextDefinition'; 

function kanbanReducer(state: KanbanState, action: Action): KanbanState {
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
      const updatedTask = action.payload;
      const oldTask = state.tasks[updatedTask.id];
      
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
              taskIds: [...newColumn.taskIds, updatedTask.id],
            },
          },
        };
      }
      
      // No status change, just update task
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

export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, initData);

  return (
    <KanbanContext.Provider value={{ state, dispatch }}>
      {children}
    </KanbanContext.Provider>
  );
};