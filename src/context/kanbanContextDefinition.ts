import { createContext } from 'react';
import type { KanbanState, Task, TaskStatus, UniqueId } from '../types';

export type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: UniqueId }
  | { type: 'UPDATE_TASK'; payload: Task } 
  | { 
      type: 'MOVE_TASK'; 
      payload: { 
        activeId: UniqueId;     
        sourceColumnId: TaskStatus; 
        targetColumnId: TaskStatus; 
        newIndex: number;         
      }
  };

export interface KanbanContextProps {
  state: KanbanState;
  dispatch: React.Dispatch<Action>;
}

export const KanbanContext = createContext<KanbanContextProps | undefined>(undefined);
