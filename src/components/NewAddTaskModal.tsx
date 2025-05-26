import React, { useEffect, useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskEffort } from '@/types/task'; // Assuming these types are okay
import { getTaskFieldOptions } from "@/lib/client-api-utils"; // We'll use the same util

interface NewAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: any, originalFields: any) => void; // Simplify the callback for now
  boardType: string; // e.g., "technicalSEO", "cro", "strategyAdHoc" - will be used for getTaskFieldOptions
}

const NewAddTaskModal: React.FC<NewAddTaskModalProps> = ({ isOpen, onClose, onAddTask, boardType }) => {
  console.log(`NewAddTaskModal RENDERING. isOpen: ${isOpen}, boardType: ${boardType}`);

  const [options, setOptions] = useState<any>({
    priority: [], impact: [], effort: [], status: []
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [taskName, setTaskName] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedImpact, setSelectedImpact] = useState('');
  const [selectedEffort, setSelectedEffort] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceLinks, setReferenceLinks] = useState(''); // Added for original UI

  // Effect to fetch options
  useEffect(() => {
    console.log(`NewAddTaskModal options-useEffect triggered. isOpen: ${isOpen}, boardType: ${boardType}`);
    if (!isOpen) {
      console.log("NewAddTaskModal options-useEffect: isOpen is false, returning early.");
      return;
    }

    console.log(`NewAddTaskModal options-useEffect: Fetching options for boardType: ${boardType}`);
    setIsLoadingOptions(true);
    getTaskFieldOptions(boardType)
      .then(opts => {
        console.log("NewAddTaskModal options-useEffect: Received options:", opts);
        setOptions(opts || { priority: [], impact: [], effort: [], status: [] });
        setSelectedPriority(opts?.priority?.[0] || '');
        setSelectedImpact(opts?.impact?.[0] || '');
        setSelectedEffort(opts?.effort?.[0] || '');
        setSelectedStatus(opts?.status?.[0] || '');
        setTaskName(''); 
        setNotes('');    
        setReferenceLinks(''); // Reset ref links
      })
      .catch(error => {
        console.error("NewAddTaskModal options-useEffect: Error fetching options:", error);
        setOptions({ priority: [], impact: [], effort: [], status: [] });
        setSelectedPriority('');
        setSelectedImpact('');
        setSelectedEffort('');
        setSelectedStatus('');
        setReferenceLinks('');
      })
      .finally(() => {
        setIsLoadingOptions(false);
      });
  }, [isOpen, boardType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!taskName.trim()) {
        alert("Task name is required.");
        return;
    }

    const links = referenceLinks.trim() ? referenceLinks.split('\n').filter(link => link.trim() !== '') : [];

    const taskSubmission = {
      task: taskName,
      status: selectedStatus as TaskStatus, // Cast to specific type if confident
      priority: selectedPriority as TaskPriority,
      impact: selectedImpact, // This will be string "1", "2" etc. or "Medium" if error
      effort: selectedEffort as TaskEffort,
      notes: notes,
      referenceLinks: links, // Added
    };
    
    const originalFieldsForBackend = {
        priority: selectedPriority, 
        impact: selectedImpact, 
        effort: selectedEffort
    };

    console.log("NewAddTaskModal submitting taskSubmission:", taskSubmission, "and originalFieldsForBackend:", originalFieldsForBackend);
    onAddTask(taskSubmission, originalFieldsForBackend); 
    onClose(); 
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white p-8 rounded-[12px] border-2 border-gray-200 shadow-lg max-w-xl w-full pointer-events-auto">
        <div className="bg-gray-100 p-6 border-b border-gray-200 -mx-8 -mt-8 mb-8 flex justify-between items-center rounded-t-[12px]">
          <h3 className="text-lg font-bold text-black px-2">Add New Task to {boardType} Board</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="new-taskName" className="block text-sm font-medium text-mediumGray mb-2">Task Name</label>
              <input
                id="new-taskName"
                type="text"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                placeholder="Enter task description"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="new-status" className="block text-sm font-medium text-mediumGray mb-2">Status</label>
              <select
                id="new-status"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                {options.status?.map((opt: string) => <option key={`status-${opt}`} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="new-priority" className="block text-sm font-medium text-mediumGray mb-2">Priority</label>
              <select
                id="new-priority"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="">Select Priority</option>
                {options.priority?.map((opt: string) => <option key={`priority-${opt}`} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="new-impact" className="block text-sm font-medium text-mediumGray mb-2">Impact</label>
              <select
                id="new-impact"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
              >
                <option value="">Select Impact</option>
                {options.impact?.map((opt: string) => <option key={`impact-${opt}`} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="new-effort" className="block text-sm font-medium text-mediumGray mb-2">Effort</label>
              <select
                id="new-effort"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000]"
                value={selectedEffort}
                onChange={(e) => setSelectedEffort(e.target.value)}
              >
                <option value="">Select Effort</option>
                {options.effort?.map((opt: string) => <option key={`effort-${opt}`} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="new-notes" className="block text-sm font-medium text-mediumGray mb-2">Notes</label>
              <textarea
                id="new-notes"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000] min-h-[80px]"
                placeholder="Add any additional notes or context"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="new-referenceLinks" className="block text-sm font-medium text-mediumGray mb-2">Reference Links (one per line)</label>
              <textarea
                id="new-referenceLinks"
                className="w-full border border-gray-200 rounded-[12px] p-3 focus:outline-none focus:ring-2 focus:ring-[#000000] min-h-[60px]"
                placeholder="Add reference links (one per line)"
                value={referenceLinks}
                onChange={(e) => setReferenceLinks(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-base font-medium text-[#000000] border border-[#000000] rounded-[12px] hover:bg-[#000000]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-base font-medium text-white bg-[#000000] rounded-[12px] hover:bg-[#000000]/80 transition-colors"
              // disabled={!taskName.trim()} // Basic validation, can be enhanced
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAddTaskModal; 