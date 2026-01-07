import { useState } from 'react'; // Import useState
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Column, Task } from '../types';
import { TaskCard } from './TaskCard';
import { useKanban } from '../hooks/useKanban';

interface ColumnProps {
  column: Column;
  tasks: Task[];
}

export const ColumnContainer = ({ column, tasks }: ColumnProps) => {
  // State quản lý việc đóng mở Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { dispatch } = useKanban();

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <>
      <div className="column-container">
        <div className="column-header">
          <h3 className="column-title">{column.title}</h3>
          <div className="column-tools">
            <span className="column-count">{tasks.length}</span>
            <button
              className="add-task-btn"
              aria-label="Add task"
              title="Add task"
              onClick={() => setIsModalOpen(true)}
            >
              Add
            </button>
          </div>
        </div>

        <div
          ref={setNodeRef}
          className={`column-tasks ${tasks.length === 0 ? 'column-tasks-empty' : ''}`}
        >
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="modal-title">Add Task</h4>
            <label className="modal-label">Title</label>
            <input
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
            <label className="modal-label" style={{ marginTop: 10 }}>Description</label>
            <textarea
              className="modal-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const newTask: Task = {
                    id: `${column.id}-${Date.now()}`,
                    title: title.trim() || 'Untitled',
                    description: description.trim(),
                    status: column.id,
                    subTasks: [],
                    createdAt: new Date().toISOString(),
                  };
                  dispatch({ type: 'ADD_TASK', payload: newTask });
                  setTitle('');
                  setDescription('');
                  setIsModalOpen(false);
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
};