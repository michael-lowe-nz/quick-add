# Implementation Plan

- [x] 1. Update HTML structure for split add/subtract buttons
  - Modify the existing add button HTML to create a container with two separate buttons
  - Add data attributes for subtract and add actions
  - Ensure proper accessibility attributes for both buttons
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Implement CSS styling for split button layout
  - Create flexbox layout for the button container to split vertically
  - Style the subtract button with red/orange color scheme (top 40%)
  - Style the add button maintaining current orange scheme (bottom 60%)
  - Add hover and active states for both buttons with distinct visual feedback
  - Ensure minimum touch target sizes for mobile accessibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Refactor data model to support operation history
  - Replace the addedNumbers array with operationHistory array structure
  - Create Operation interface with id, value, operation type, timestamp, and runningTotal
  - Implement data migration function to convert existing addedNumbers to new format
  - Update saveState and loadState methods to handle new data structure
  - _Requirements: 1.1, 1.4, 4.4_

- [x] 4. Implement subtraction operation functionality
  - Add subtract case to handleAction method
  - Create performSubtraction method that updates operation history
  - Update performCalculation method to handle subtract operations
  - Implement running total calculation for subtraction operations
  - Add keyboard support for minus key triggering subtraction
  - _Requirements: 1.1, 1.2, 1.4, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Update running display to show operation history
  - Modify updateRunningDisplay to render operations with proper prefixes
  - Add visual indicators for addition (+) and subtraction (−) operations
  - Implement color coding for different operation types
  - Update running total display for each operation entry
  - Maintain chronological order and auto-scroll functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Implement editable running items functionality
  - Add click event listeners to running items for edit mode activation
  - Create inline editing interface with input field and action buttons
  - Implement save and cancel functionality for edits
  - Add delete button and functionality for removing operations
  - Handle escape and enter key events during editing
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 7. Implement running total recalculation system
  - Create recalculateAllRunningTotals method to update totals after edits
  - Update main display when running total changes
  - Ensure proper state management during recalculation
  - Handle edge cases like empty operation history
  - _Requirements: 3.3, 3.4_

- [ ] 8. Add error handling and validation
  - Implement input validation for edited values
  - Add error states and user feedback for invalid operations
  - Handle localStorage failures gracefully
  - Implement rollback mechanism for failed edit operations
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Update event listeners and keyboard support
  - Modify existing event listeners to handle new button structure
  - Add event delegation for dynamically created edit interfaces
  - Ensure keyboard navigation works with split buttons
  - Test and verify all keyboard shortcuts function correctly
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Integrate and test complete functionality
  - Test mixed addition and subtraction operations
  - Verify running total accuracy across all operations
  - Test editing and deletion of operations
  - Ensure proper state persistence and restoration
  - Verify responsive behavior and mobile compatibility
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 3.3, 3.4_