import './App.css'
import { KanbanBoard } from './components/KanbanBoard';
import { KanbanProvider } from './context/KanbanContext';

function App() {
  return (
    <KanbanProvider>
      <div className="kanban-container">
        <div className="kanban-header">
          <h1>Enterprise Kanban Board</h1>
        </div>
        <KanbanBoard />
      </div>
    </KanbanProvider>
  );
}

export default App