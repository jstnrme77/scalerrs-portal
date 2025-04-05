'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

// Define task types
type BaseTask = {
  id: number;
  task: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
}

type TodoTask = BaseTask & {
  completedDate?: undefined;
}

type CompletedTask = BaseTask & {
  completedDate: string;
}

type Task = TodoTask | CompletedTask;

// Sample task data
const taskBoards = {
  technicalSEO: [
    { id: 1, task: 'Fix broken internal links', status: 'todo', priority: 'high', assignee: 'John Doe', dueDate: '2025-04-15' },
    { id: 2, task: 'Implement schema markup on product pages', status: 'in-progress', priority: 'high', assignee: 'Jane Smith', dueDate: '2025-04-10' },
    { id: 3, task: 'Optimize site speed (Core Web Vitals)', status: 'in-progress', priority: 'high', assignee: 'John Doe', dueDate: '2025-04-12' },
    { id: 4, task: 'Fix duplicate content issues', status: 'todo', priority: 'medium', assignee: 'Jane Smith', dueDate: '2025-04-20' },
    { id: 5, task: 'Implement hreflang tags for international pages', status: 'todo', priority: 'medium', assignee: 'John Doe', dueDate: '2025-04-25' },
    { id: 6, task: 'Fix mobile usability issues', status: 'completed', priority: 'high', assignee: 'Jane Smith', completedDate: '2025-04-01', dueDate: '2025-04-01' },
    { id: 7, task: 'Implement canonical tags', status: 'completed', priority: 'medium', assignee: 'John Doe', completedDate: '2025-03-28', dueDate: '2025-03-28' },
  ],
  cro: [
    { id: 1, task: 'A/B test homepage hero section', status: 'in-progress', priority: 'high', assignee: 'Jane Smith', dueDate: '2025-04-15' },
    { id: 2, task: 'Optimize product page CTAs', status: 'todo', priority: 'high', assignee: 'John Doe', dueDate: '2025-04-18' },
    { id: 3, task: 'Improve checkout flow', status: 'todo', priority: 'high', assignee: 'Jane Smith', dueDate: '2025-04-22' },
    { id: 4, task: 'Implement exit-intent popups', status: 'in-progress', priority: 'medium', assignee: 'John Doe', dueDate: '2025-04-12' },
    { id: 5, task: 'Optimize mobile forms', status: 'completed', priority: 'high', assignee: 'Jane Smith', completedDate: '2025-04-02', dueDate: '2025-04-02' },
    { id: 6, task: 'Reduce cart abandonment rate', status: 'todo', priority: 'high', assignee: 'John Doe', dueDate: '2025-04-28' },
  ],
  contentStrategy: [
    { id: 1, task: 'Develop Q2 content calendar', status: 'in-progress', priority: 'high', assignee: 'Jane Smith', dueDate: '2025-04-10' },
    { id: 2, task: 'Conduct keyword gap analysis', status: 'completed', priority: 'high', assignee: 'John Doe', completedDate: '2025-04-01', dueDate: '2025-04-01' },
    { id: 3, task: 'Create content briefs for top 10 keywords', status: 'in-progress', priority: 'high', assignee: 'Jane Smith', dueDate: '2025-04-15' },
    { id: 4, task: 'Update outdated blog content', status: 'todo', priority: 'medium', assignee: 'John Doe', dueDate: '2025-04-20' },
    { id: 5, task: 'Develop link building strategy', status: 'todo', priority: 'high', assignee: 'Jane Smith', dueDate: '2025-04-25' },
    { id: 6, task: 'Create content style guide', status: 'completed', priority: 'medium', assignee: 'John Doe', completedDate: '2025-03-28', dueDate: '2025-03-28' },
  ]
};

// Priority Badge Component
function PriorityBadge({ priority }: { priority: string }) {
  let bgColor = '';
  let textColor = '';
  
  switch (priority) {
    case 'high':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'medium':
      bgColor = 'bg-gold/10';
      textColor = 'text-gold';
      break;
    case 'low':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      bgColor = 'bg-lightGray';
      textColor = 'text-mediumGray';
  }
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

// Task Card Component
function TaskCard({ 
  task, 
  onStatusChange 
}: { 
  task: Task; 
  onStatusChange: (id: number, status: string) => void; 
}) {
  return (
    <div className="bg-white p-4 rounded-scalerrs border border-lightGray shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-medium text-dark">{task.task}</h3>
        <PriorityBadge priority={task.priority} />
      </div>
      
      <div className="mb-3">
        <div className="text-sm text-mediumGray">
          <span className="font-medium">Assignee:</span> {task.assignee}
        </div>
        {task.status !== 'completed' ? (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Due:</span> {task.dueDate}
          </div>
        ) : (
          <div className="text-sm text-mediumGray">
            <span className="font-medium">Completed:</span> {task.completedDate}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        {task.status === 'todo' && (
          <>
            <button 
              onClick={() => onStatusChange(task.id, 'in-progress')}
              className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
            >
              Start
            </button>
          </>
        )}
        
        {task.status === 'in-progress' && (
          <>
            <button 
              onClick={() => onStatusChange(task.id, 'completed')}
              className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-scalerrs hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
            <button 
              onClick={() => onStatusChange(task.id, 'todo')}
              className="px-3 py-1 text-xs font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-300 transition-colors"
            >
              Back to Todo
            </button>
          </>
        )}
        
        {task.status === 'completed' && (
          <button 
            onClick={() => onStatusChange(task.id, 'in-progress')}
            className="px-3 py-1 text-xs font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-300 transition-colors"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

// Task Column Component
function TaskColumn({ 
  title, 
  tasks, 
  status, 
  onStatusChange 
}: { 
  title: string; 
  tasks: Task[]; 
  status: string; 
  onStatusChange: (id: number, status: string) => void; 
}) {
  return (
    <div className="bg-lightGray p-4 rounded-scalerrs min-h-[500px]">
      <h3 className="text-md font-medium text-dark mb-4 flex items-center">
        {title}
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-white rounded-full text-mediumGray">
          {tasks.length}
        </span>
      </h3>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onStatusChange={onStatusChange} 
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="bg-white p-4 rounded-scalerrs border border-dashed border-lightGray text-center">
            <p className="text-sm text-mediumGray">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Task Modal Component
function AddTaskModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  boardType 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (task: Task) => void; 
  boardType: string; 
}) {
  const [taskData, setTaskData] = useState({
    task: '',
    priority: 'medium',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0]
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskData.task.trim() && taskData.assignee.trim()) {
      onAdd({
        ...taskData,
        id: Date.now(),
        status: 'todo'
      });
      setTaskData({
        task: '',
        priority: 'medium',
        assignee: '',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-scalerrs shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-dark mb-4">Add New Task to {boardType} Board</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Task Description</label>
            <input 
              type="text" 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter task description"
              value={taskData.task}
              onChange={(e) => setTaskData({ ...taskData, task: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Priority</label>
            <select 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={taskData.priority}
              onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Assignee</label>
            <input 
              type="text" 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter assignee name"
              value={taskData.assignee}
              onChange={(e) => setTaskData({ ...taskData, assignee: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-mediumGray mb-1">Due Date</label>
            <input 
              type="date" 
              className="w-full border border-lightGray rounded-scalerrs p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={taskData.dueDate}
              onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-mediumGray bg-lightGray rounded-scalerrs hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TaskBoards() {
  const [boards, setBoards] = useState(taskBoards);
  const [activeBoard, setActiveBoard] = useState('technicalSEO');
  const [addTaskModal, setAddTaskModal] = useState(false);
  
  const handleStatusChange = (id: number, newStatus: string) => {
    setBoards(prev => {
      const newBoards = { ...prev };
      const taskIndex = newBoards[activeBoard as keyof typeof boards].findIndex(task => task.id === id);
      
      if (taskIndex !== -1) {
        const currentTask = newBoards[activeBoard as keyof typeof boards][taskIndex];
        
        if (newStatus === 'completed') {
          // When moving to completed, add completedDate
          const updatedTask: CompletedTask = {
            id: currentTask.id,
            task: currentTask.task,
            status: newStatus,
            priority: currentTask.priority,
            assignee: currentTask.assignee,
            completedDate: new Date().toISOString().split('T')[0],
            dueDate: currentTask.dueDate
          };
          newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
        } else {
          // When moving to todo or in-progress
          const updatedTask: TodoTask = {
            id: currentTask.id,
            task: currentTask.task,
            status: newStatus,
            priority: currentTask.priority,
            assignee: currentTask.assignee,
            dueDate: currentTask.dueDate
          };
          newBoards[activeBoard as keyof typeof boards][taskIndex] = updatedTask;
        }
      }
      
      return newBoards;
    });
  };
  
  const handleAddTask = (task: Task) => {
    setBoards(prev => {
      const newBoards = { ...prev };
      newBoards[activeBoard as keyof typeof boards] = [
        ...newBoards[activeBoard as keyof typeof boards],
        task
      ];
      return newBoards;
    });
    
    setAddTaskModal(false);
  };
  
  // Filter tasks by status
  const todoTasks = boards[activeBoard as keyof typeof boards].filter(task => task.status === 'todo');
  const inProgressTasks = boards[activeBoard as keyof typeof boards].filter(task => task.status === 'in-progress');
  const completedTasks = boards[activeBoard as keyof typeof boards].filter(task => task.status === 'completed');

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Task Boards</h1>
          <p className="text-mediumGray">Manage and track SEO and CRO tasks</p>
        </div>
        
        <button 
          onClick={() => setAddTaskModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-scalerrs hover:bg-primary/80 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>
      
      <div className="bg-white rounded-scalerrs shadow-sm border border-lightGray mb-6">
        <div className="flex border-b border-lightGray">
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeBoard === 'technicalSEO' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveBoard('technicalSEO')}
          >
            Technical SEO
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeBoard === 'cro' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveBoard('cro')}
          >
            CRO
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium ${activeBoard === 'contentStrategy' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
            onClick={() => setActiveBoard('contentStrategy')}
          >
            Content Strategy
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn 
          title="To Do" 
          tasks={todoTasks} 
          status="todo" 
          onStatusChange={handleStatusChange} 
        />
        
        <TaskColumn 
          title="In Progress" 
          tasks={inProgressTasks} 
          status="in-progress" 
          onStatusChange={handleStatusChange} 
        />
        
        <TaskColumn 
          title="Completed" 
          tasks={completedTasks} 
          status="completed" 
          onStatusChange={handleStatusChange} 
        />
      </div>
      
      <div className="bg-lightGray p-4 rounded-scalerrs mt-8">
        <p className="text-sm text-mediumGray">
          <strong>Note:</strong> Task boards are synchronized with our project management system. Changes made here will be reflected in the main system within 5 minutes.
        </p>
      </div>
      
      <AddTaskModal 
        isOpen={addTaskModal} 
        onClose={() => setAddTaskModal(false)} 
        onAdd={handleAddTask} 
        boardType={activeBoard === 'technicalSEO' ? 'Technical SEO' : activeBoard === 'cro' ? 'CRO' : 'Content Strategy'} 
      />
    </DashboardLayout>
  );
}
