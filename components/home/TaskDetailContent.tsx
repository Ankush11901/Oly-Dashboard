'use client';

import { type ReactNode } from 'react';
import { MapPin, ImageOff, Camera } from 'lucide-react';
import {
  STATUS_CFG,
  PRIORITY_CFG,
  formatTaskDueWindow,
  formatTaskRecurrence,
  getTaskOverdueSummary,
  getTaskPriority,
  getTaskActivityFeed,
  getTaskRequiredActions,
  type Task,
} from '@/components/home/home-data';

const ACTIVITY_PREVIEW = 2;

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="hybrid-task-detail__block">
      <h3 className="hybrid-task-detail__block-title">{title}</h3>
      <div className="hybrid-task-detail__block-body">{children}</div>
    </section>
  );
}

export interface TaskDetailContentProps {
  task: Task;
  photoUrl?: string;
}

export function TaskDetailTitle({ task }: { task: Task }) {
  return (
    <header className="hybrid-task-detail__head hybrid-task-detail__head--embedded">
      <div className="hybrid-task-detail__head-main">
        <h2 id="hybrid-task-detail-title">{task.title}</h2>
        {task.store ? (
          <p className="hybrid-task-detail__store">
            <MapPin size={13} strokeWidth={1.5} aria-hidden />
            {task.store}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function TaskDetailContent({ task, photoUrl }: TaskDetailContentProps) {
  const st = STATUS_CFG[task.status];
  const priority = getTaskPriority(task);
  const pr = PRIORITY_CFG[priority];
  const recurrence = formatTaskRecurrence(task);
  const overdueSummary = getTaskOverdueSummary(task);
  const hasPhoto = Boolean(photoUrl);
  const requiredActions = getTaskRequiredActions(task);
  const activityFeed = getTaskActivityFeed(task);
  const activityPreview = activityFeed.slice(0, ACTIVITY_PREVIEW);
  const activityMore = activityFeed.length - activityPreview.length;

  const dueLabel = `${formatTaskDueWindow(task)}${recurrence ? ` · ${recurrence}` : ''}`;

  return (
    <div className="hybrid-task-detail__body hybrid-task-detail__body--compact">
      <DetailBlock title="Task overview">
        <div className="hybrid-task-detail__meta-row">
          <span
            className="hybrid-task-detail__pill"
            style={{ color: st.color, background: st.bg }}
          >
            {st.icon}
            {st.label}
          </span>
          <span
            className="hybrid-task-detail__pill"
            style={{ color: pr.color, background: pr.bg }}
          >
            {pr.label}
          </span>
          {task.assignedTo ? (
            <span className="hybrid-task-detail__meta-chip">{task.assignedTo}</span>
          ) : null}
          {task.automated ? (
            <span className="hybrid-task-detail__meta-chip hybrid-task-detail__meta-chip--muted">
              Automated
            </span>
          ) : null}
        </div>

        <ul className="hybrid-task-detail__timeline-inline" aria-label="Timeline">
          {task.createdAt ? <li><span>Created</span> {task.createdAt}</li> : null}
          <li><span>Due</span> {dueLabel}</li>
          {task.status === 'done' && task.completedAt ? (
            <li><span>Completed</span> {task.completedAt}</li>
          ) : null}
          {task.status === 'overdue' ? (
            <li className="is-overdue">
              <span>Overdue</span>
              {overdueSummary || 'Past due'}
            </li>
          ) : null}
        </ul>

        {task.description ? (
          <p className="hybrid-task-detail__description">{task.description}</p>
        ) : (
          <p className="hybrid-task-detail__muted">No description provided.</p>
        )}
      </DetailBlock>

      <div className="hybrid-task-detail__split">
        <DetailBlock title="Requirements">
          <p className="hybrid-task-detail__proof-line">
            <Camera size={12} strokeWidth={1.5} aria-hidden />
            {task.requiresPhoto ? 'Photo proof required' : 'Photo proof not required'}
          </p>
          {requiredActions.length > 0 ? (
            <ul className="hybrid-task-detail__action-tags">
              {requiredActions.map(action => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          ) : null}
          {task.notes && task.status !== 'done' ? (
            <p className="hybrid-task-detail__note-line">
              <strong>Instructions:</strong> {task.notes}
            </p>
          ) : null}
        </DetailBlock>

        <DetailBlock title="Attachments & evidence">
          <div className="hybrid-task-detail__evidence">
            {task.requiresPhoto ? (
              hasPhoto ? (
                <a
                  href={photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hybrid-task-detail__photo"
                >
                  <img src={photoUrl} alt={`Proof for ${task.title}`} />
                </a>
              ) : (
                <span className="hybrid-task-detail__empty-proof">
                  <ImageOff size={12} strokeWidth={1.5} aria-hidden />
                  No image yet
                </span>
              )
            ) : (
              <span className="hybrid-task-detail__muted hybrid-task-detail__muted--inline">
                No image required
              </span>
            )}
            {task.completionNotes ? (
              <p className="hybrid-task-detail__note-line">
                <strong>Notes:</strong> {task.completionNotes}
              </p>
            ) : null}
          </div>
        </DetailBlock>
      </div>

      <DetailBlock title="Activity history">
        {activityPreview.length > 0 ? (
          <>
            <ul className="hybrid-task-detail__activity hybrid-task-detail__activity--compact">
              {activityPreview.map((item, i) => (
                <li key={`${item.type}-${item.at}-${i}`}>
                  <time>{item.at}</time>
                  <span>
                    <strong>{item.author}</strong> — {item.text}
                  </span>
                </li>
              ))}
            </ul>
            {activityMore > 0 ? (
              <p className="hybrid-task-detail__activity-more">
                +{activityMore} earlier update{activityMore === 1 ? '' : 's'}
              </p>
            ) : null}
          </>
        ) : (
          <p className="hybrid-task-detail__muted">No activity recorded yet.</p>
        )}
      </DetailBlock>
    </div>
  );
}
