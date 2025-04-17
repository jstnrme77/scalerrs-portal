'use client';

import React from 'react';
import Card from './Card';
import StatusBadge, { TaskStatus } from '../badges/StatusBadge';
import PriorityBadge, { TaskPriority } from '../badges/PriorityBadge';

export type Task = {
  id: number;
  name: string;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  comments?: string;
  notes?: string;
};

type TaskCardProps = {
  task: Task;
  className?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (id: number, status: TaskStatus) => void;
};

/**
 * A card component for displaying task information
 */
export default function TaskCard({
  task,
  className = '',
  onEdit,
  onDelete,
  onStatusChange
}: TaskCardProps) {
  return (
    <Card className={`${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-medium text-text-light dark:text-text-dark">{task.name}</h3>
        <StatusBadge status={task.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-mediumGray dark:text-gray-300">
          <span className="font-medium">Assigned to:</span> {task.assignedTo}
        </div>

        <div className="text-sm text-mediumGray dark:text-gray-300">
          <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-mediumGray dark:text-gray-300">Priority:</span>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm text-mediumGray dark:text-gray-300">
            <span className="font-medium">Impact:</span> {task.impact}
          </div>

          <div className="text-sm text-mediumGray dark:text-gray-300">
            <span className="font-medium">Effort:</span> {task.effort}
          </div>
        </div>

        {task.comments && (
          <div className="text-sm text-mediumGray dark:text-gray-300">
            <span className="font-medium">Comments:</span> {task.comments}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit && onEdit(task.id)}
            className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-scalerrs hover:bg-primary/10 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(task.id)}
            className="px-3 py-1 text-xs font-medium text-red-600 border border-red-600 rounded-scalerrs hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>

        {onStatusChange && (
          <select
            className="text-xs border border-lightGray dark:border-container rounded-scalerrs p-1 focus:outline-none focus:ring-1 focus:ring-primary dark:bg-darkGray dark:text-gray-300"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Done">Done</option>
          </select>
        )}
      </div>
    </Card>
  );
}
