document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const displayHistory = document.getElementById('display-history');
    const displayMain = document.getElementById('display-main');
    const keysContainer = document.querySelector('.calculator-keys');

    // Calculator State
    let currentInput = '0';
    let firstOperand = null;
    let operator = null;
    let historyExpression = '';
    let shouldResetInput = false;
    let isErrorState = false;

    // Operator display map
    const operatorSymbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    };

    // Initialize display
    updateDisplay();

    // Event Delegation for Button Clicks
    keysContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        // Visual click feedback
        btn.classList.add('keyboard-press');
        setTimeout(() => btn.classList.remove('keyboard-press'), 100);

        handleButtonPress(btn);
    });

    // Keyboard Input Listeners
    const KEY_MAP = {
        '0': 'key-0',
        '1': 'key-1',
        '2': 'key-2',
        '3': 'key-3',
        '4': 'key-4',
        '5': 'key-5',
        '6': 'key-6',
        '7': 'key-7',
        '8': 'key-8',
        '9': 'key-9',
        '.': 'key-decimal',
        '+': 'key-add',
        '-': 'key-subtract',
        '*': 'key-multiply',
        '/': 'key-divide',
        'Enter': 'key-equals',
        '=': 'key-equals',
        'Backspace': 'key-backspace',
        'Escape': 'key-clear',
        'c': 'key-clear',
        'C': 'key-clear',
        '%': 'key-percent'
    };

    document.addEventListener('keydown', (e) => {
        const btnId = KEY_MAP[e.key];
        if (btnId) {
            e.preventDefault();
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.add('keyboard-active');
                btn.classList.add('keyboard-press');
                handleButtonPress(btn);
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        const btnId = KEY_MAP[e.key];
        if (btnId) {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('keyboard-active');
                btn.classList.remove('keyboard-press');
            }
        }
    });

    // Core Logic Handler
    function handleButtonPress(btn) {
        if (isErrorState && !btn.dataset.action === 'clear') {
            // Force clear if in error state
            resetCalculator();
            return;
        }

        const number = btn.dataset.number;
        const op = btn.dataset.operator;
        const action = btn.dataset.action;

        if (number !== undefined) {
            inputDigit(number);
        } else if (op !== undefined) {
            inputOperator(op);
        } else if (action !== undefined) {
            switch (action) {
                case 'clear':
                    resetCalculator();
                    break;
                case 'backspace':
                    handleBackspace();
                    break;
                case 'percent':
                    handlePercent();
                    break;
                case 'equals':
                    handleEquals();
                    break;
            }
        }
        updateDisplay();
    }

    // State Mutators
    function inputDigit(digit) {
        if (isErrorState) {
            resetCalculator();
        }

        if (shouldResetInput) {
            currentInput = digit;
            shouldResetInput = false;
        } else {
            if (currentInput === '0') {
                currentInput = digit;
            } else {
                // Limit display characters to prevent overflow
                if (currentInput.replace('.', '').length < 15) {
                    currentInput += digit;
                }
            }
        }
    }

    function inputOperator(nextOperator) {
        if (isErrorState) return;

        const valValue = parseFloat(currentInput);

        // Operator switching (user clicked another operator right after an operator)
        if (operator && shouldResetInput) {
            operator = nextOperator;
            // Update the last operator in the history expression
            historyExpression = historyExpression.slice(0, -1) + operatorSymbols[nextOperator];
            return;
        }

        if (firstOperand === null) {
            firstOperand = valValue;
            historyExpression = formatValue(firstOperand) + ' ' + operatorSymbols[nextOperator];
        } else if (operator) {
            const result = performCalculation(firstOperand, valValue, operator);
            
            if (isErrorState) return; // Error handled inside performCalculation

            firstOperand = result;
            currentInput = String(result);
            historyExpression = historyExpression + ' ' + formatValue(valValue) + ' ' + operatorSymbols[nextOperator];
        }

        operator = nextOperator;
        shouldResetInput = true;
    }

    function handleEquals() {
        if (isErrorState || !operator) return;

        const valValue = parseFloat(currentInput);
        const result = performCalculation(firstOperand, valValue, operator);

        if (isErrorState) return;

        historyExpression = historyExpression + ' ' + formatValue(valValue) + ' =';
        currentInput = String(result);
        firstOperand = null;
        operator = null;
        shouldResetInput = true;
    }

    function handleBackspace() {
        if (isErrorState) {
            resetCalculator();
            return;
        }

        // If we just clicked equals or an operator, backspace acts as clear or is ignored
        if (shouldResetInput) {
            historyExpression = '';
            return;
        }

        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === '-' || currentInput === '-0') {
                currentInput = '0';
            }
        } else {
            currentInput = '0';
        }
    }

    function handlePercent() {
        if (isErrorState) return;
        const val = parseFloat(currentInput);
        const result = val / 100;
        currentInput = String(result);
    }

    function resetCalculator() {
        currentInput = '0';
        firstOperand = null;
        operator = null;
        historyExpression = '';
        shouldResetInput = false;
        isErrorState = false;
    }

    // Mathematical Calculation
    function performCalculation(operand1, operand2, op) {
        let result = 0;
        switch (op) {
            case '+':
                result = operand1 + operand2;
                break;
            case '-':
                result = operand1 - operand2;
                break;
            case '*':
                result = operand1 * operand2;
                break;
            case '/':
                if (operand2 === 0) {
                    isErrorState = true;
                    currentInput = 'Cannot divide by 0';
                    return 0;
                }
                result = operand1 / operand2;
                break;
            default:
                return operand2;
        }
        
        // Clean floating point precision issues
        return cleanFloatingPoint(result);
    }

    // Helper to clean floats (e.g., 0.1 + 0.2 -> 0.3)
    function cleanFloatingPoint(num) {
        return parseFloat(num.toPrecision(14));
    }

    // Format numbers for presentation
    function formatValue(num) {
        if (isNaN(num) || !isFinite(num)) {
            return 'Error';
        }
        const str = num.toString();
        // If it's a huge number or very small decimal, format using exponential
        if (str.replace('.', '').length > 12) {
            return num.toExponential(5);
        }
        return str;
    }

    // UI Updater
    function updateDisplay() {
        if (isErrorState) {
            displayMain.textContent = currentInput;
            displayMain.classList.add('error-state');
            displayHistory.textContent = historyExpression;
        } else {
            displayMain.classList.remove('error-state');
            displayMain.textContent = formatMainDisplay(currentInput);
            displayHistory.textContent = historyExpression;
        }
    }

    // Add thousand separators for readable user view (e.g. 12,345.67)
    function formatMainDisplay(inputStr) {
        if (inputStr === '0') return '0';
        
        // Don't format unfinished decimals or strings that aren't clean numbers
        const parts = inputStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

        // Add commas to integer part
        const isNegative = integerPart.startsWith('-');
        if (isNegative) {
            integerPart = integerPart.slice(1);
        }

        // Format integer
        let formattedInt = '';
        if (integerPart.length > 0 && !isNaN(integerPart)) {
            // Standard regex for adding grouping commas
            formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } else {
            formattedInt = integerPart;
        }

        return (isNegative ? '-' : '') + formattedInt + decimalPart;
    }
});
