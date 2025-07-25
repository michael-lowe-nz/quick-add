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

function animateValueChange(element) {
    // Add a subtle scale animation to indicate value change
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'transform 0.15s cubic-bezier(0.4, 0.0, 0.2, 1)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 150);
}

function addNumber() {
    if (currentNumber !== 0) {
        total += currentNumber;
        
        const item = document.createElement('div');
        item.className = 'number-item';
        item.textContent = formatValue(currentNumber);
        
        const valueToStore = currentNumber;
        item.onclick = () => removeNumber(item, valueToStore);
        
        // Add staggered animation delay for multiple items
        const itemCount = numbers.children.length;
        item.style.animationDelay = `${itemCount * 0.05}s`;
        
        numbers.appendChild(item);
        
        // Smooth scroll to bottom to show new item
        setTimeout(() => {
            numbers.scrollTop = numbers.scrollHeight;
        }, 100);
        
        numberHistory.push(currentNumber);
        currentNumber = 0;
        inputString = '';
        updateDisplay();
        
        // Add subtle animation to total when it changes
        animateValueChange(totalEl);
    }
}

function removeNumber(element, value) {
    total -= value;
    
    // Add removal animation
    element.style.transform = 'translateX(100%)';
    element.style.opacity = '0';
    element.style.transition = 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
    
    setTimeout(() => {
        element.remove();
    }, 300);
    
    const index = numberHistory.indexOf(value);
    if (index > -1) numberHistory.splice(index, 1);
    updateDisplay();
    
    // Add subtle animation to total when it changes
    animateValueChange(totalEl);
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
    
    // Add haptic feedback if supported
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // Animate display and total changes
    animateValueChange(display);
    animateValueChange(totalEl);
    
    // Update all number items with animation
    const items = numbers.querySelectorAll('.number-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            const value = numberHistory[index];
            item.textContent = formatValue(value);
            animateValueChange(item);
        }, index * 50);
    });
    
    updateDisplay();
});

keys.forEach(key => {
    key.addEventListener('click', () => {
        const keyValue = key.dataset.key;
        
        // Add haptic feedback for key presses
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        if (keyValue >= '0' && keyValue <= '9') {
            inputString += keyValue;
            currentNumber = parseInt(inputString) || 0;
            updateDisplay();
            animateValueChange(display);
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
            animateValueChange(display);
        } else if (keyValue === '+') {
            addNumber();
        }
    });
    
    // Add touch start and end events for better mobile feedback
    key.addEventListener('touchstart', (e) => {
        e.preventDefault();
        key.style.transform = 'scale(0.95)';
    });
    
    key.addEventListener('touchend', (e) => {
        e.preventDefault();
        setTimeout(() => {
            key.style.transform = '';
        }, 100);
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        inputString += e.key;
        currentNumber = parseInt(inputString) || 0;
        updateDisplay();
        animateValueChange(display);
        
        // Animate corresponding key button
        const keyButton = document.querySelector(`[data-key="${e.key}"]`);
        if (keyButton) {
            animateKeyPress(keyButton);
        }
    } else if (e.key === 'Backspace') {
        if (inputString === '') {
            editLastNumber();
        } else {
            inputString = inputString.slice(0, -1);
            currentNumber = parseInt(inputString) || 0;
            updateDisplay();
            animateValueChange(display);
        }
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === '+') {
        addNumber();
        const addButton = document.querySelector('[data-key="+"]');
        if (addButton) {
            animateKeyPress(addButton);
        }
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
        animateValueChange(display);
        
        const minusButton = document.querySelector('[data-key="-"]');
        if (minusButton) {
            animateKeyPress(minusButton);
        }
    }
});

function animateKeyPress(keyElement) {
    keyElement.style.transform = 'scale(0.95)';
    keyElement.style.transition = 'transform 0.1s cubic-bezier(0.4, 0.0, 0.2, 1)';
    
    setTimeout(() => {
        keyElement.style.transform = '';
    }, 100);
}

updateDisplay();

// Ensure page can receive keyboard events
document.body.setAttribute('tabindex', '0');
document.body.focus();

// Handle orientation changes and viewport adjustments
function handleOrientationChange() {
    // Force a layout recalculation after orientation change
    setTimeout(() => {
        // Update viewport height for mobile browsers
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Scroll to top to ensure proper layout
        window.scrollTo(0, 0);
        
        // Ensure numbers container scrolls to bottom if it has content
        if (numbers.children.length > 0) {
            setTimeout(() => {
                numbers.scrollTop = numbers.scrollHeight;
            }, 100);
        }
    }, 100);
}

// Set initial viewport height
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

// Listen for orientation changes
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

// Handle viewport changes for mobile browsers (address bar hiding/showing)
let lastHeight = window.innerHeight;
window.addEventListener('resize', () => {
    const currentHeight = window.innerHeight;
    if (Math.abs(currentHeight - lastHeight) > 100) {
        handleOrientationChange();
        lastHeight = currentHeight;
    }
});

// Prevent zoom on double tap for better mobile experience
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Improve touch scrolling performance
if ('scrollBehavior' in document.documentElement.style) {
    numbers.style.scrollBehavior = 'smooth';
}

// Add visual feedback for device orientation
function updateOrientationClass() {
    const isLandscape = window.innerWidth > window.innerHeight;
    document.body.classList.toggle('landscape', isLandscape);
    document.body.classList.toggle('portrait', !isLandscape);
}

updateOrientationClass();
window.addEventListener('orientationchange', () => {
    setTimeout(updateOrientationClass, 100);
});
window.addEventListener('resize', updateOrientationClass);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/quick-add/sw.js');
}