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
        
        this.initializeEventListeners();
        this.updateRunningDisplay();
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
    
    handleNumber(number) {
        console.log(`Number pressed: ${number}`);
        
        if (this.waitingForOperand) {
            this.currentValue = number;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? number : this.currentValue + number;
        }
        
        this.updateDisplay();
    } 
   
    handleAction(action) {
        console.log(`Action pressed: ${action}`);
        
        switch (action) {
            case 'clear':
                this.clear();
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
 
    clear() {
        console.log('Clear pressed');
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.runningTotal = 0;
        this.addedNumbers = [];
        this.updateDisplay();
        this.updateRunningDisplay();
        this.clearOperatorHighlight();
    }
    
    toggleSign() {
        console.log('Toggle sign pressed');
        if (this.currentValue !== '0') {
            this.currentValue = this.currentValue.startsWith('-') 
                ? this.currentValue.slice(1) 
                : '-' + this.currentValue;
            this.updateDisplay();
        }
    }
    
    percentage() {
        console.log('Percentage pressed');
        const value = parseFloat(this.currentValue);
        this.currentValue = (value / 100).toString();
        this.updateDisplay();
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
    }   
 
    setOperator(nextOperator) {
        console.log(`Operator set: ${nextOperator}`);
        
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
            // If this is the first addition operation, track the first number
            if (nextOperator === 'add' && this.addedNumbers.length === 0) {
                this.addedNumbers.push(inputValue);
                this.runningTotal = inputValue;
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
        this.highlightOperator(nextOperator);
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
            this.clearOperatorHighlight();
        }
    }
    
    performCalculation() {
        const prev = this.previousValue;
        const current = parseFloat(this.currentValue);
        
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
    }
    
    updateDisplay() {
        // Format the display value
        let displayValue = this.currentValue;
        
        // Handle very long numbers
        if (displayValue.length > 12) {
            const num = parseFloat(displayValue);
            if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
                displayValue = num.toExponential(6);
            } else {
                displayValue = num.toPrecision(12).replace(/\.?0+$/, '');
            }
        }
        
        this.primaryDisplay.textContent = displayValue;
        
        // Update secondary display with operation
        if (this.previousValue !== null && this.operator) {
            const operatorSymbols = {
                'add': '+',
                'subtract': '−',
                'multiply': '×',
                'divide': '÷'
            };
            let prevDisplay = this.previousValue.toString();
            if (prevDisplay.length > 10) {
                prevDisplay = parseFloat(prevDisplay).toPrecision(6);
            }
            this.secondaryDisplay.textContent = `${prevDisplay} ${operatorSymbols[this.operator]}`;
        } else {
            this.secondaryDisplay.textContent = '';
        }
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
    
    updateRunningDisplay() {
        // Clear the running display
        this.runningElement.innerHTML = '';
        
        // Add each number that was added
        this.addedNumbers.forEach((number, index) => {
            const item = document.createElement('div');
            item.className = 'running-item';
            
            const numberSpan = document.createElement('span');
            numberSpan.className = 'running-number';
            numberSpan.textContent = `+${number}`;
            
            const totalSpan = document.createElement('span');
            totalSpan.className = 'running-total';
            
            // Calculate running total up to this point
            const runningSum = this.addedNumbers.slice(0, index + 1).reduce((sum, num) => sum + num, 0);
            totalSpan.textContent = `= ${runningSum}`;
            
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