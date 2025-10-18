# Requirements Document

## Introduction

This feature enhances the existing calculator application by adding subtraction functionality with visual tracking, number editing capabilities, and the ability to remove numbers from the running total. The implementation will maintain consistency with the existing addition functionality while providing clear visual distinction for subtraction operations.

## Requirements

### Requirement 1

**User Story:** As a calculator user, I want to subtract numbers from my running total, so that I can perform mixed addition and subtraction operations.

#### Acceptance Criteria

1. WHEN the user clicks the subtract button THEN the system SHALL perform subtraction operation on the current value
2. WHEN a subtraction operation is performed THEN the system SHALL update the running total by subtracting the entered value
3. WHEN subtraction operations are performed THEN the system SHALL display negative values in the running column with a minus prefix
4. WHEN the user performs multiple subtractions THEN the system SHALL maintain an accurate running total across all operations
5. IF the running total becomes negative THEN the system SHALL display the negative value correctly in both running column and main display

### Requirement 2

**User Story:** As a calculator user, I want a visually distinct subtract button, so that I can easily differentiate between addition and subtraction operations.

#### Acceptance Criteria

1. WHEN the calculator loads THEN the system SHALL display a subtract button that is smaller than the add button
2. WHEN the calculator loads THEN the subtract button SHALL occupy the top portion of the current add button space
3. WHEN the calculator loads THEN the subtract button SHALL have a different color scheme to indicate subtraction
4. WHEN the user hovers over the subtract button THEN the system SHALL provide visual feedback distinct from the add button
5. WHEN the subtract button is active THEN the system SHALL highlight it differently from the add button

### Requirement 3

**User Story:** As a calculator user, I want to edit or remove individual numbers from my running total, so that I can correct mistakes without starting over.

#### Acceptance Criteria

1. WHEN the user clicks on a number in the running column THEN the system SHALL allow editing of that specific entry
2. WHEN a number is being edited THEN the system SHALL provide a way to delete the entry entirely
3. WHEN a number is edited THEN the system SHALL recalculate the running total automatically
4. WHEN a number is removed THEN the system SHALL update all subsequent running totals in the display
5. WHEN editing is cancelled THEN the system SHALL restore the original value and running totals

### Requirement 4

**User Story:** As a calculator user, I want the running column to clearly show both additions and subtractions, so that I can track my calculation history.

#### Acceptance Criteria

1. WHEN additions are performed THEN the system SHALL display them with a plus prefix in the running column
2. WHEN subtractions are performed THEN the system SHALL display them with a minus prefix in the running column
3. WHEN the running total changes THEN the system SHALL update the running total display for each entry
4. WHEN operations are mixed THEN the system SHALL maintain chronological order in the running column
5. WHEN the running column is full THEN the system SHALL auto-scroll to show the most recent operations

### Requirement 5

**User Story:** As a calculator user, I want keyboard support for subtraction operations, so that I can use the calculator efficiently with keyboard input.

#### Acceptance Criteria

1. WHEN the user presses the minus key (-) THEN the system SHALL trigger the subtraction operation
2. WHEN the user presses the minus key during number entry THEN the system SHALL perform subtraction with the current value
3. WHEN keyboard shortcuts are used THEN the system SHALL provide the same functionality as clicking the subtract button
4. WHEN the subtract operation is triggered via keyboard THEN the system SHALL provide the same visual feedback as mouse interaction