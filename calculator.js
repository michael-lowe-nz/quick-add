class Calculator {
    constructor() {
        this.primaryDisplay = document.getElementById('primaryDisplay');
        this.secondaryDisplay = document.getElementById('secondaryDisplay');
        this.runningElement = document.querySelector('.running');

        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.runningTotal = 0;
        this.addedNumbers = [];
        this.lastAddedValue = null; // Track the last added value for repeat addition
        this.dollarMode = false; // Track if we're in dollar mode

        this.initializeEventListeners();
        this.initializeResizeHandle();
        this.initializeDollarToggle();
        this.loadState(); // Load saved state from localStorage
        this.updateDisplay();
        this.updateRunningDisplay();
        this.updateClearButton();
        this.updateButtonStates();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.key[data-number]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleNumber(e.target.dataset.number);
            });
        });

        // Operator buttons
        document.querySelectorAll('.key[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleAction(e.target.dataset.action);
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    initializeResizeHandle() {
        const resizeHandle = document.getElementById('resizeHandle');
        const calculator = document.querySelector('.calculator');
        let isResizing = false;
        let startY = 0;
        let startHeight = 0;

        const startResize = (e) => {
            isResizing = true;
            startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

            // Get current display height percentage
            const computedStyle = getComputedStyle(calculator);
            const currentHeight = computedStyle.getPropertyValue('--display-height') || '35%';
            startHeight = parseFloat(currentHeight);

            document.body.style.cursor = 'row-resize';
            e.preventDefault();
        };

        const doResize = (e) => {
            if (!isResizing) return;

            const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            const deltaY = currentY - startY;
            const calculatorHeight = calculator.offsetHeight;

            // Convert pixel change to percentage
            const deltaPercent = (deltaY / calculatorHeight) * 100;
            let newHeight = startHeight + deltaPercent;

            // Constrain between 20% and 70%
            newHeight = Math.max(20, Math.min(70, newHeight));

            calculator.style.setProperty('--display-height', `${newHeight}%`);
            e.preventDefault();
        };

        const stopResize = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';

                // Save the new height to localStorage
                const currentHeight = getComputedStyle(calculator).getPropertyValue('--display-height');
                try {
                    localStorage.setItem('calculatorDisplayHeight', currentHeight);
                } catch (error) {
                    console.warn('Could not save display height:', error);
                }
            }
        };

        // Mouse events
        resizeHandle.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);

        // Touch events for mobile
        resizeHandle.addEventListener('touchstart', startResize, { passive: false });
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('touchend', stopResize);

        // Load saved height on initialization
        try {
            const savedHeight = localStorage.getItem('calculatorDisplayHeight');
            if (savedHeight) {
                calculator.style.setProperty('--display-height', savedHeight);
            }
        } catch (error) {
            console.warn('Could not load display height:', error);
        }
    }

    initializeDollarToggle() {
        const dollarToggle = document.getElementById('dollarToggle');

        dollarToggle.addEventListener('click', () => {
            this.toggleDollarMode();
        });
    }

    handleNumber(number) {
        console.log(`Number pressed: ${number}`);

        if (this.waitingForOperand) {
            this.currentValue = number;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? number : this.currentValue + number;
        }

        this.updateDisplay();
        this.updateClearButton();
        this.saveState(); // Save state after number input
    }

    handleAction(action) {
        console.log(`Action pressed: ${action}`);

        switch (action) {
            case 'clear':
                this.handleClearButton();
                break;
            case 'sign':
                this.toggleSign();
                break;
            case 'percent':
                this.percentage();
                break;
            case 'decimal':
                this.decimal();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.setOperator(action);
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    handleKeyboard(e) {
        const key = e.key;

        // Numbers
        if (key >= '0' && key <= '9') {
            this.handleNumber(key);
        }

        // Operators
        switch (key) {
            case '+':
                this.handleAction('add');
                break;
            case '-':
                this.handleAction('subtract');
                break;
            case '*':
                this.handleAction('multiply');
                break;
            case '/':
                e.preventDefault();
                this.handleAction('divide');
                break;
            case '=':
            case 'Enter':
                this.handleAction('equals');
                break;
            case '.':
                this.handleAction('decimal');
                break;
            case 'Escape':
                this.handleAction('clear');
                break;
            case 'Backspace':
                this.backspace();
                break;
        }
    }

    handleClearButton() {
        const clearButton = document.querySelector('[data-action="clear"]');
        const isAllClear = clearButton.textContent === 'AC';

        if (isAllClear) {
            this.allClear();
        } else {
            // If it's showing "C", clear current entry first
            // If current entry is already 0, then do full clear
            if (this.currentValue === '0') {
                this.allClear();
            } else {
                this.clearCurrentEntry();
            }
        }
    }

    allClear() {
        console.log('All Clear pressed');
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.runningTotal = 0;
        this.addedNumbers = [];
        this.lastAddedValue = null;
        this.updateDisplay();
        this.updateRunningDisplay();
        this.clearOperatorHighlight();
        this.updateClearButton();
        this.saveState(); // Save state after clearing

        // Note: We don't reset the display height on clear - it should persist
    }

    clearCurrentEntry() {
        console.log('Clear current entry');
        this.currentValue = '0';
        this.updateDisplay();
        this.updateClearButton();
        this.saveState();
    }

    saveState() {
        const state = {
            currentValue: this.currentValue,
            previousValue: this.previousValue,
            operator: this.operator,
            waitingForOperand: this.waitingForOperand,
            runningTotal: this.runningTotal,
            addedNumbers: this.addedNumbers,
            lastAddedValue: this.lastAddedValue,
            dollarMode: this.dollarMode
        };

        try {
            localStorage.setItem('calculatorState', JSON.stringify(state));
        } catch (error) {
            console.warn('Could not save calculator state:', error);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('calculatorState');
            if (savedState) {
                const state = JSON.parse(savedState);

                this.currentValue = state.currentValue || '0';
                this.previousValue = state.previousValue || null;
                this.operator = state.operator || null;
                this.waitingForOperand = state.waitingForOperand || false;
                this.runningTotal = state.runningTotal || 0;
                this.addedNumbers = state.addedNumbers || [];
                this.lastAddedValue = state.lastAddedValue || null;
                this.dollarMode = state.dollarMode || false;

                // Update dollar toggle appearance if in dollar mode
                if (this.dollarMode) {
                    const dollarToggle = document.getElementById('dollarToggle');
                    if (dollarToggle) {
                        dollarToggle.classList.add('active');
                    }
                }

                // Update button states based on loaded mode
                this.updateButtonStates();

                // Restore operator highlight if there's an active operator
                if (this.operator) {
                    this.highlightOperator(this.operator);
                }

                console.log('Calculator state loaded from localStorage');
            }
        } catch (error) {
            console.warn('Could not load calculator state:', error);
        }
    }

    toggleDollarMode() {
        console.log('Dollar mode toggled');
        this.dollarMode = !this.dollarMode;

        // Update the dollar toggle appearance
        const dollarToggle = document.getElementById('dollarToggle');
        if (dollarToggle) {
            if (this.dollarMode) {
                dollarToggle.classList.add('active');
            } else {
                dollarToggle.classList.remove('active');
            }
        }

        // Update button states based on mode
        this.updateButtonStates();
        this.updateDisplay();
        this.saveState(); // Save state after dollar mode toggle
    }

    parseDollarValue(value) {
        const numValue = parseFloat(value) || 0;

        // If the input contains a decimal point, treat it as already in dollar format
        // e.g., "5.25" should be $5.25, not $0.0525
        if (value.toString().includes('.')) {
            return numValue;
        }

        // For whole numbers, convert cents to dollars (e.g., "525" becomes $5.25)
        return numValue / 100;
    }

    formatNumberWithCommas(value) {
        // Format number with commas for thousands separators
        const num = parseFloat(value);
        if (isNaN(num)) return value;

        // Preserve the original string format to maintain trailing zeros
        const originalStr = value.toString();
        const parts = originalStr.split('.');

        // Add commas to the integer part
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        return parts.join('.');
    }

    formatDollarDisplay(value) {
        // Format number as currency for display
        const numValue = parseFloat(value) || 0;
        const formatted = this.formatNumberWithCommas(numValue.toFixed(2));
        return '$' + formatted;
    }

    toggleSign() {
        console.log('Toggle sign pressed');
        if (this.currentValue !== '0') {
            this.currentValue = this.currentValue.startsWith('-')
                ? this.currentValue.slice(1)
                : '-' + this.currentValue;
            this.updateDisplay();
            this.saveState(); // Save state after sign toggle
        }
    }

    percentage() {
        console.log('Percentage pressed');
        const value = parseFloat(this.currentValue);
        this.currentValue = (value / 100).toString();
        this.updateDisplay();
        this.saveState(); // Save state after percentage
    }

    decimal() {
        console.log('Decimal pressed');

        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
        this.updateClearButton();
        this.saveState(); // Save state after decimal
    }

    setOperator(nextOperator) {
        console.log(`Operator set: ${nextOperator}`);

        // Handle repeated addition - if + is pressed again without new input
        if (nextOperator === 'add' && this.operator === 'add' && this.waitingForOperand && this.lastAddedValue !== null) {
            console.log('Repeating last addition');
            this.currentValue = String(this.lastAddedValue);
            this.waitingForOperand = false;
            const newValue = this.performCalculation();
            this.currentValue = String(newValue);
            this.previousValue = newValue;
            this.waitingForOperand = true;
            this.updateDisplay();
            this.updateClearButton();
            this.saveState(); // Save state after repeated addition
            return;
        }

        const inputValue = this.dollarMode ? this.parseDollarValue(this.currentValue) : parseFloat(this.currentValue);

        if (this.previousValue === null) {
            this.previousValue = inputValue;
            // If this is the first addition operation, track the first number
            if (nextOperator === 'add' && this.addedNumbers.length === 0) {
                this.addedNumbers.push(inputValue);
                this.runningTotal = inputValue;
                this.lastAddedValue = inputValue;
                this.updateRunningDisplay();
            }
        } else if (this.operator) {
            // Perform calculation with current values before setting new operator
            const newValue = this.performCalculation();

            this.currentValue = String(newValue);
            this.previousValue = newValue;
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateDisplay();
        this.updateClearButton();
        this.highlightOperator(nextOperator);
        this.saveState(); // Save state after setting operator
    }

    calculate() {
        console.log('Calculate pressed');

        const inputValue = parseFloat(this.currentValue);

        if (this.previousValue !== null && this.operator) {
            const newValue = this.performCalculation();
            this.currentValue = String(newValue);
            this.previousValue = null;
            this.operator = null;
            this.waitingForOperand = true;
            this.updateDisplay();
            this.updateClearButton();
            this.clearOperatorHighlight();
            this.saveState(); // Save state after calculation
        }
    }

    performCalculation() {
        const prev = this.previousValue;
        const current = this.dollarMode ? this.parseDollarValue(this.currentValue) : parseFloat(this.currentValue);

        if (prev === null || this.operator === null) {
            return current;
        }

        let result;

        switch (this.operator) {
            case 'add':
                result = prev + current;
                // Track the number being added
                this.addedNumbers.push(current);
                this.runningTotal += current;
                this.lastAddedValue = current; // Store for repeat addition
                this.updateRunningDisplay();
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    alert('Cannot divide by zero');
                    return prev;
                }
                result = prev / current;
                break;
            default:
                return current;
        }

        // Round to avoid floating point precision issues
        result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

        console.log(`${prev} ${this.operator} ${current} = ${result}`);
        return result;
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
        this.updateClearButton();
        this.saveState(); // Save state after backspace
    }

    updateDisplay() {
        // Format the display value
        let displayValue = this.currentValue;

        // Handle dollar mode formatting
        if (this.dollarMode && !this.waitingForOperand) {
            // Show the dollar formatted version
            const dollarValue = this.parseDollarValue(this.currentValue);
            displayValue = this.formatDollarDisplay(dollarValue);
        } else if (this.dollarMode && this.waitingForOperand && this.previousValue !== null) {
            // Show previous value in dollar format when waiting for operand
            displayValue = this.formatDollarDisplay(this.previousValue);
        } else {
            // Handle very long numbers
            if (displayValue.length > 12) {
                const num = parseFloat(displayValue);
                if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
                    displayValue = num.toExponential(6);
                } else {
                    displayValue = num.toPrecision(12).replace(/\.?0+$/, '');
                }
            }

            // Add comma formatting for regular numbers (not during input with decimal)
            if (!displayValue.includes('.') || displayValue.endsWith('.')) {
                const num = parseFloat(displayValue);
                if (!isNaN(num) && Math.abs(num) >= 1000) {
                    const baseNumber = displayValue.endsWith('.') ?
                        displayValue.slice(0, -1) : displayValue;
                    const formatted = this.formatNumberWithCommas(baseNumber);
                    displayValue = displayValue.endsWith('.') ? formatted + '.' : formatted;
                }
            } else {
                // For numbers with decimals, format if the whole part is >= 1000
                const num = parseFloat(displayValue);
                if (!isNaN(num) && Math.abs(num) >= 1000) {
                    displayValue = this.formatNumberWithCommas(displayValue);
                }
            }
        }

        this.primaryDisplay.textContent = displayValue;

        // Dynamically adjust font size based on content length
        this.adjustFontSize();

        // Update secondary display with operation
        if (this.previousValue !== null && this.operator) {
            const operatorSymbols = {
                'add': '+',
                'subtract': '−',
                'multiply': '×',
                'divide': '÷'
            };
            let prevDisplay = this.dollarMode ?
                this.formatDollarDisplay(this.previousValue) :
                this.formatNumberWithCommas(this.previousValue.toString());

            if (!this.dollarMode && prevDisplay.length > 10) {
                prevDisplay = parseFloat(this.previousValue).toPrecision(6);
            }
            this.secondaryDisplay.textContent = `${prevDisplay} ${operatorSymbols[this.operator]}`;
        } else {
            this.secondaryDisplay.textContent = '';
        }
    }

    adjustFontSize() {
        const text = this.primaryDisplay.textContent;
        const length = text.length;
        const containerWidth = this.primaryDisplay.offsetWidth;

        // Calculate font size based on text length and container width
        let fontSize;

        // Base font sizes for different screen sizes
        const isMobile = window.innerWidth <= 480;
        const isSmallMobile = window.innerWidth <= 320;

        if (length <= 8) {
            fontSize = isMobile ? '36px' : '48px';
        } else if (length <= 10) {
            fontSize = isMobile ? '32px' : '40px';
        } else if (length <= 12) {
            fontSize = isMobile ? '28px' : '32px';
        } else if (length <= 15) {
            fontSize = isMobile ? '24px' : '28px';
        } else if (length <= 18) {
            fontSize = isSmallMobile ? '18px' : isMobile ? '20px' : '24px';
        } else if (length <= 22) {
            fontSize = isSmallMobile ? '16px' : isMobile ? '18px' : '20px';
        } else {
            // For very long numbers, calculate based on container width
            const maxWidth = containerWidth * 0.95; // Use 95% of container width
            const estimatedCharWidth = isSmallMobile ? 8 : isMobile ? 10 : 12;
            const calculatedSize = Math.floor(maxWidth / length * estimatedCharWidth);
            fontSize = Math.max(calculatedSize, isSmallMobile ? 12 : 14) + 'px';
        }

        this.primaryDisplay.style.fontSize = fontSize;
    }

    highlightOperator(operator) {
        // Clear previous highlights
        this.clearOperatorHighlight();

        // Highlight current operator
        const operatorButton = document.querySelector(`[data-action="${operator}"]`);
        if (operatorButton) {
            operatorButton.classList.add('active');
        }
    }

    clearOperatorHighlight() {
        document.querySelectorAll('.key.operator').forEach(button => {
            button.classList.remove('active');
        });
    }

    updateClearButton() {
        const clearButton = document.querySelector('[data-action="clear"]');

        // Show "AC" if we're in completely initial state
        // Show "C" if user has entered something or there's an operation in progress
        const shouldShowAC = (
            this.currentValue === '0' &&
            this.previousValue === null &&
            this.operator === null &&
            this.addedNumbers.length === 0 &&
            this.waitingForOperand === false
        );

        clearButton.textContent = shouldShowAC ? 'AC' : 'C';
    }

    updateButtonStates() {
        const doubleZeroButton = document.querySelector('[data-number="00"]');
        const decimalButton = document.querySelector('[data-action="decimal"]');

        if (doubleZeroButton && decimalButton) {
            if (this.dollarMode) {
                // In dollar mode: emphasize 00, but keep decimal available
                doubleZeroButton.style.opacity = '1';
                decimalButton.style.opacity = '0.8'; // Slightly dimmed but still usable
                decimalButton.style.pointerEvents = 'auto'; // Enable clicking
            } else {
                // In normal mode: emphasize decimal, de-emphasize 00
                doubleZeroButton.style.opacity = '0.5';
                decimalButton.style.opacity = '1';
                decimalButton.style.pointerEvents = 'auto'; // Enable clicking
            }
        }
    }

    updateRunningDisplay() {
        // Clear the running display
        this.runningElement.innerHTML = '';

        // Add each number that was added
        this.addedNumbers.forEach((number, index) => {
            const item = document.createElement('div');
            item.className = 'running-item';

            const numberSpan = document.createElement('span');
            numberSpan.className = 'running-number';

            // Format number display based on dollar mode
            const displayNumber = this.dollarMode ?
                this.formatDollarDisplay(number) :
                this.formatNumberWithCommas(number.toString());
            numberSpan.textContent = `+${displayNumber}`;

            const totalSpan = document.createElement('span');
            totalSpan.className = 'running-total';

            // Calculate running total up to this point
            const runningSum = this.addedNumbers.slice(0, index + 1).reduce((sum, num) => sum + num, 0);
            const displayTotal = this.dollarMode ?
                this.formatDollarDisplay(runningSum) :
                this.formatNumberWithCommas(runningSum.toString());
            totalSpan.textContent = `= ${displayTotal}`;

            item.appendChild(numberSpan);
            item.appendChild(totalSpan);
            this.runningElement.appendChild(item);
        });

        // Auto-scroll to bottom to show latest additions
        this.runningElement.scrollTop = this.runningElement.scrollHeight;
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Calculator initialized');
    new Calculator();
});