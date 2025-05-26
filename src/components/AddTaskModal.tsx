import React from 'react'; // Removed unused imports for this test

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void; // Keep for basic functionality
  // Remove onAdd, boardType for this minimal test if they cause issues
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose /*, onAdd, boardType */ }) => {
  alert("MINIMAL AddTaskModal EXECUTING! isOpen: " + isOpen);
  console.log("MINIMAL AddTaskModal RENDER. isOpen:", isOpen);

  if (!isOpen) {
    console.log("MINIMAL AddTaskModal: isOpen is false, returning null.");
    return null;
  }

  console.log("MINIMAL AddTaskModal: isOpen is true, rendering content.");
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px' }}>
        <h2>Minimal Add Task Modal (isOpen: {isOpen ? 'true' : 'false'})</h2>
        <p>BoardType would be: {/* boardType */ " N/A for this test"}</p>
        <button onClick={onClose}>Close Minimal Modal</button>
      </div>
    </div>
  );
};

export default AddTaskModal; 