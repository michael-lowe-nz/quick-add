# Design Document

## Overview

This design extends the existing calculator application to support subtraction operations with visual tracking, number editing capabilities, and a redesigned button layout. The implementation maintains consistency with the existing addition functionality while introducing clear visual distinctions for subtraction operations.

## Architecture

### Component Structure

The design builds upon the existing Calculator class architecture:

```
Calculator Class Extensions:
├── Subtraction Operations
│   ├── performSubtraction()
│   ├── updateRunningDisplayWithSubtraction()
│   └── handleSubtractionOperator()
├── Number Editing
│   ├── enableRunningItemEditing()
│   ├── handleRunningItemEdit()
│   ├── deleteRunningItem()
│   └── recalculateRunningTotals()
└── UI Enhancements
    ├── createSplitAddSubtractButtons()
    ├── updateButtonLayout()
    └── handleEditableRunningItems()
```

### Data Model Extensions

The existing data structure will be enhanced to support subtraction tracking:

```javascript
// Enhanced Calculator state
{
  currentValue: string,
  previousValue: number,
  operator: string,
  runningTotal: number,
  operationHistory: [  // New: replaces addedNumbers
    {
      id: string,        // Unique identifier for editing
      value: number,     // The number value
      operation: 'add' | 'subtract',  // Operation type
      timestamp: number, // For ordering
      runningTotal: number  // Running total after this operation
    }
  ],
  // ... existing properties
}
```

## Components and Interfaces

### 1. Button Layout Redesign

**Split Add/Subtract Button Design:**
- The current single "+" button area will be split vertically
- Top 40%: Subtract button ("-") with red/orange color scheme
- Bottom 60%: Add button ("+") maintaining current orange color scheme
- Both buttons maintain the same grid area but use CSS flexbox for internal layout

**CSS Grid Modifications:**
```css
.key[data-action="add-subtract-container"] {
  grid-area: add;
  display: flex;
  flex-direction: column;
  padding: 0;
  gap: 2px;
}

.subtract-button {
  flex: 0.4;  /* 40% of height */
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.add-button {
  flex: 0.6;  /* 60% of height */
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
}
```

### 2. Running Column Enhancements

**Editable Running Items:**
- Each running item becomes clickable for editing
- Click triggers inline editing mode with input field
- Delete button (×) appears during editing
- Escape cancels editing, Enter confirms changes

**Visual Indicators:**
- Addition operations: Green "+" prefix
- Subtraction operations: Red "−" prefix  
- Hover states indicate clickable items
- Edit mode shows input field with save/cancel options

### 3. Operation Tracking System

**Enhanced Operation History:**
```javascript
class OperationHistoryManager {
  addOperation(value, type) {
    const operation = {
      id: generateUniqueId(),
      value: parseFloat(value),
      operation: type, // 'add' or 'subtract'
      timestamp: Date.now(),
      runningTotal: this.calculateRunningTotal()
    };
    this.operationHistory.push(operation);
    this.updateRunningDisplay();
  }

  editOperation(id, newValue) {
    const operation = this.operationHistory.find(op => op.id === id);
    if (operation) {
      operation.value = parseFloat(newValue);
      this.recalculateAllRunningTotals();
      this.updateRunningDisplay();
    }
  }

  deleteOperation(id) {
    this.operationHistory = this.operationHistory.filter(op => op.id !== id);
    this.recalculateAllRunningTotals();
    this.updateRunningDisplay();
  }
}
```

## Data Models

### Operation Model
```javascript
interface Operation {
  id: string;           // Unique identifier (UUID or timestamp-based)
  value: number;        // The numeric value
  operation: 'add' | 'subtract';  // Operation type
  timestamp: number;    // Creation timestamp for ordering
  runningTotal: number; // Running total after this operation
}
```

### Calculator State Model
```javascript
interface CalculatorState {
  // Existing properties
  currentValue: string;
  previousValue: number | null;
  operator: string | null;
  waitingForOperand: boolean;
  dollarMode: boolean;
  
  // Enhanced properties
  runningTotal: number;
  operationHistory: Operation[];  // Replaces addedNumbers array
  lastOperationValue: number | null;  // For repeat operations
}
```

## Error Handling

### Input Validation
- Validate numeric input during editing to prevent invalid values
- Handle edge cases like empty input, non-numeric characters
- Prevent division by zero in percentage calculations

### State Management
- Implement rollback mechanism for failed edit operations
- Validate operation history integrity after modifications
- Handle localStorage failures gracefully

### UI Error States
- Show error indicators for invalid edits
- Provide user feedback for failed operations
- Maintain calculator state consistency during errors

## Testing Strategy

### Unit Testing Focus Areas
1. **Operation History Management**
   - Test addition and subtraction operations
   - Verify running total calculations
   - Test edit and delete operations

2. **UI State Management**
   - Test button state changes
   - Verify display updates
   - Test edit mode transitions

3. **Data Persistence**
   - Test localStorage save/load operations
   - Verify state restoration after page reload
   - Test migration from old data format

### Integration Testing
1. **User Interaction Flows**
   - Complete calculation sequences with mixed operations
   - Edit operations and verify recalculations
   - Test keyboard and mouse interactions

2. **Visual Regression Testing**
   - Verify button layout changes
   - Test responsive behavior
   - Validate color scheme consistency

### Edge Case Testing
1. **Boundary Conditions**
   - Very large numbers in running total
   - Maximum number of operations
   - Rapid user interactions

2. **Error Recovery**
   - Invalid edit inputs
   - Storage quota exceeded
   - Corrupted state data

## Implementation Notes

### Backward Compatibility
- Migrate existing `addedNumbers` array to new `operationHistory` format
- Maintain existing keyboard shortcuts and behaviors
- Preserve current dollar mode functionality

### Performance Considerations
- Limit operation history to prevent memory issues (e.g., max 1000 operations)
- Optimize running total recalculations for large operation lists
- Use efficient DOM updates for running column changes

### Accessibility
- Ensure keyboard navigation works with new button layout
- Provide screen reader support for operation history
- Maintain focus management during edit operations

### Mobile Responsiveness
- Ensure split buttons are touch-friendly (minimum 44px touch targets)
- Test edit functionality on mobile devices
- Verify running column scrolling on small screens