const display = document.getElementById('display');
const numbers = document.getElementById('numbers');
const totalEl = document.getElementById('total');
const modeToggle = document.getElementById('modeToggle');
const keys = document.querySelectorAll('.key');

let total = 0;
let currentNumber = 0;
let currencyMode = false;
let inputString = '';
let numberHistory = [];

function formatValue(value) {
    return currencyMode ? `$${(value / 100).toFixed(2)}` : value.toString();
}

function updateDisplay() {
    display.textContent = formatValue(currentNumber);
    totalEl.textContent = formatValue(total);
}

function addNumber() {
    if (currentNumber !== 0) {
        total += currentNumber;
        
        const item = document.createElement('div');
        item.className = 'number-item';
        item.textContent = formatValue(currentNumber);
        
        const valueToStore = currentNumber;
        item.onclick = () => removeNumber(item, valueToStore);
        numbers.appendChild(item);
        
        numberHistory.push(currentNumber);
        currentNumber = 0;
        inputString = '';
        updateDisplay();
    }
}

function removeNumber(element, value) {
    total -= value;
    element.remove();
    const index = numberHistory.indexOf(value);
    if (index > -1) numberHistory.splice(index, 1);
    updateDisplay();
}

function editLastNumber() {
    if (numberHistory.length > 0) {
        const lastValue = numberHistory.pop();
        total -= lastValue;
        numbers.removeChild(numbers.lastElementChild);
        
        currentNumber = lastValue;
        inputString = Math.abs(lastValue).toString();
        if (lastValue < 0) inputString = '-' + inputString;
        updateDisplay();
    }
}

modeToggle.addEventListener('click', () => {
    currencyMode = !currencyMode;
    modeToggle.classList.toggle('active', currencyMode);
    updateDisplay();
});

keys.forEach(key => {
    key.addEventListener('click', () => {
        const keyValue = key.dataset.key;
        
        if (keyValue >= '0' && keyValue <= '9') {
            inputString += keyValue;
            currentNumber = parseInt(inputString) || 0;
            updateDisplay();
        } else if (keyValue === '-') {
            if (inputString === '') {
                inputString = '-';
                currentNumber = 0;
                updateDisplay();
            } else {
                inputString = inputString.startsWith('-') ? inputString.slice(1) : '-' + inputString;
                currentNumber = parseInt(inputString) || 0;
                updateDisplay();
            }
        } else if (keyValue === '+') {
            addNumber();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        inputString += e.key;
        currentNumber = parseInt(inputString) || 0;
        updateDisplay();
    } else if (e.key === 'Backspace') {
        if (inputString === '') {
            editLastNumber();
        } else {
            inputString = inputString.slice(0, -1);
            currentNumber = parseInt(inputString) || 0;
            updateDisplay();
        }
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === '+') {
        addNumber();
    } else if (e.key === '-') {
        if (inputString === '') {
            inputString = '-';
            currentNumber = 0;
            updateDisplay();
        } else {
            inputString = inputString.startsWith('-') ? inputString.slice(1) : '-' + inputString;
            currentNumber = parseInt(inputString) || 0;
            updateDisplay();
        }
    }
});

updateDisplay();

// Ensure page can receive keyboard events
document.body.setAttribute('tabindex', '0');
document.body.focus();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/quick-add/sw.js');
}