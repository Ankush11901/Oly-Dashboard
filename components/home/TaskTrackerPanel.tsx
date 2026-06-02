'use client';

import { useEffect } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import {
  STATUS_CFG,
  formatTaskDueWindow,
  formatTaskRecurrence,
  type Task,
} from '@/components/home/home-data';
import { TaskDetailContent, TaskDetailTitle } from '@/components/home/TaskDetailContent';
import './home-hybrid.css';

export interface TaskTrackerPanelProps {
  open: boolean;
  tasks: Task[];
  taskPhotos: Record<number, string>;
  selectedTaskId: number | null;
  isAdmin: boolean;
  onClose: () => void;
  onBackToList: () => void;
  onSelectTask: (id: number) => void;
  onAddTask: () => void;
  onToggleTask: (id: number) => void;
}

export function TaskTrackerPanel({
  open,
  tasks,
  taskPhotos,
  selectedTaskId,
  isAdmin,
  onClose,
  onBackToList,
  onSelectTask,
  onAddTask,
  onToggleTask,
}: TaskTrackerPanelProps) {
  const selectedTask =
    selectedTaskId != null ? tasks.find(t => t.id === selectedTaskId) ?? null : null;
  const inDetail = Boolean(selectedTask);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (inDetail) onBackToList();
      else onClose();
    };
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [open, inDetail, onBackToList, onClose]);

  const handleRowKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectTask(id);
    }
  };

  if (!open) return null;

  return (
    <div
      className="task-tracker-panel__backdrop theme-overlay"
      role="presentation"
      onClick={onClose}
    >
      <aside
        className={`task-tracker-panel${inDetail ? ' task-tracker-panel--detail' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={inDetail ? 'hybrid-task-detail-title' : 'task-tracker-panel-title'}
        onClick={e => e.stopPropagation()}
      >
        <header className="task-tracker-panel__head">
          {inDetail && selectedTask ? (
            <>
              <button
                type="button"
                className="task-tracker-panel__back"
                onClick={onBackToList}
              >
                <ChevronLeft size={16} strokeWidth={2} aria-hidden />
                All tasks
              </button>
              <button
                type="button"
                className="task-tracker-panel__close"
                onClick={onClose}
                aria-label="Close"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <div>
                <h3 id="task-tracker-panel-title">Task tracker</h3>
                <p>
                  {tasks.filter(t => t.status === 'done').length} of {tasks.length} completed
                </p>
              </div>
              <div className="task-tracker-panel__head-actions">
                {isAdmin ? (
                  <button type="button" className="task-tracker-panel__add" onClick={onAddTask}>
                    <Plus size={13} strokeWidth={2.5} /> Add Task
                  </button>
                ) : null}
                <button
                  type="button"
                  className="task-tracker-panel__close"
                  onClick={onClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </header>

        <div className="task-tracker-panel__body" key={inDetail ? `detail-${selectedTaskId}` : 'list'}>
          {inDetail && selectedTask ? (
            <div className="task-tracker-panel__detail">
              <TaskDetailTitle task={selectedTask} />
              <TaskDetailContent
                task={selectedTask}
                photoUrl={taskPhotos[selectedTask.id]}
              />
            </div>
          ) : (
            <div className="task-tracker-panel__list">
              {tasks.map(task => {
                const s = STATUS_CFG[task.status];
                return (
                  <div
                    key={task.id}
                    className="task-tracker__row"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectTask(task.id)}
                    onKeyDown={e => handleRowKeyDown(e, task.id)}
                  >
                    <span style={{ color: s.color, display: 'flex', flexShrink: 0 }}>{s.icon}</span>
                    <div className="task-tracker__row-main">
                      <p>{task.title}</p>
                      <span>
                        {task.store} · {formatTaskDueWindow(task)}
                        {formatTaskRecurrence(task) ? ` · ${formatTaskRecurrence(task)}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="task-tracker__row-action"
                      onClick={e => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                    >
                      {task.status === 'done' ? 'Reopen' : 'Done'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
