import { useContext } from 'react';
import { KanbanContext } from '../context/kanbanContextDefinition';

export function useKanban() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
}
