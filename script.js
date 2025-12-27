/**
 * NeoCalc - Ultimate Scientific Calculator
 * Enhanced with BODMAS Support & Keyboard Fix
 */

class NeoCalc {
    constructor() {
        this.currentExpression = '0';
        this.result = '';
        this.memory = 0;
        this.isMemorySet = false;
        this.history = [];
        this.isDegreeMode = true;
        this.isScientificOpen = false;
        this.lastResult = null;
        
        this.loadSavedData();
        this.init();
    }
    
    loadSavedData() {
        const savedTheme = localStorage.getItem('calc-theme');
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
        
        const savedMemory = localStorage.getItem('calc-memory');
        if (savedMemory) {
            this.memory = parseFloat(savedMemory);
            this.isMemorySet = this.memory !== 0;
        }
        
        const savedMode = localStorage.getItem('calc-degree-mode');
        if (savedMode === 'radians') {
            this.isDegreeMode = false;
        }
        
        const savedExpression = localStorage.getItem('calc-expression');
        if (savedExpression) {
            this.currentExpression = savedExpression;
        }
        
        const savedHistory = localStorage.getItem('calc-history');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }
    }
    
    saveData() {
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('calc-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('calc-memory', this.memory.toString());
        localStorage.setItem('calc-degree-mode', this.isDegreeMode ? 'degrees' : 'radians');
        localStorage.setItem('calc-expression', this.currentExpression);
        const historyToSave = this.history.slice(-3);
        localStorage.setItem('calc-history', JSON.stringify(historyToSave));
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupKeyboard();
        this.updateDisplay();
        this.showToast('Welcome to NeoCalc! BODMAS Activated', 'success');
    }
    
    cacheElements() {
        this.body = document.body;
        this.modeToggle = document.getElementById('mode-toggle');
        this.modeIcon = this.modeToggle.querySelector('i');
        this.modeText = this.modeToggle.querySelector('span');
        
        this.currentInputElement = document.getElementById('current-input');
        this.resultElement = document.getElementById('result');
        this.historyElement = document.getElementById('history');
        this.memoryDisplay = document.getElementById('memory-display');
        this.memoryIndicator = document.getElementById('memory-indicator');
        this.modeIndicator = document.getElementById('mode-indicator');
        
        this.helpBtn = document.getElementById('help-btn');
        this.advancedToggle = document.getElementById('advanced-toggle');
        this.scientificPanel = document.getElementById('scientific-panel');
        this.closeScientific = document.getElementById('close-scientific');
        this.helpModal = document.getElementById('help-modal');
        this.closeHelp = document.getElementById('close-help');
        
        this.numberButtons = document.querySelectorAll('.number-btn');
        this.operatorButtons = document.querySelectorAll('.operator-btn');
        this.clearBtn = document.getElementById('clear');
        this.clearEntryBtn = document.getElementById('clear-entry');
        this.backspaceBtn = document.getElementById('backspace');
        this.decimalBtn = document.getElementById('decimal');
        this.signBtn = document.getElementById('sign');
        this.equalsBtn = document.getElementById('equals');
        
        this.memoryButtons = {
            mc: document.getElementById('mc'),
            mr: document.getElementById('mr'),
            mPlus: document.getElementById('m-plus'),
            mMinus: document.getElementById('m-minus'),
            ms: document.getElementById('ms'),
            mClear: document.getElementById('m-clear')
        };
        
        this.quickButtons = {
            sqrt: document.getElementById('sqrt-btn'),
            square: document.getElementById('square-btn'),
            inverse: document.getElementById('inverse-btn'),
            percent: document.getElementById('percent-btn'),
            exp: document.getElementById('exp-btn')
        };
        
        this.scientificButtons = document.querySelectorAll('.sci-btn');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
    }
    
    bindEvents() {
        this.modeToggle.addEventListener('click', () => this.toggleTheme());
        
        this.helpBtn.addEventListener('click', () => this.openHelp());
        this.advancedToggle.addEventListener('click', () => this.toggleScientific());
        this.closeScientific.addEventListener('click', () => this.closeScientificPanel());
        this.closeHelp.addEventListener('click', () => this.closeHelpModal());
        
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal || e.target.classList.contains('modal-overlay')) {
                this.closeHelpModal();
            }
        });
        
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });
        
        this.numberButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const num = btn.getAttribute('data-num');
                this.inputNumber(num);
            });
        });
        
        this.operatorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const op = btn.getAttribute('data-op');
                this.inputOperator(op);
            });
        });
        
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.clearEntryBtn.addEventListener('click', () => this.clearEntry());
        this.backspaceBtn.addEventListener('click', () => this.backspace());
        this.decimalBtn.addEventListener('click', () => this.inputDecimal());
        this.signBtn.addEventListener('click', () => this.toggleSign());
        this.equalsBtn.addEventListener('click', () => this.calculate());
        
        Object.entries(this.memoryButtons).forEach(([key, btn]) => {
            btn.addEventListener('click', () => this.handleMemory(key));
        });
        
        Object.entries(this.quickButtons).forEach(([key, btn]) => {
            btn.addEventListener('click', () => this.handleQuickFunction(key));
        });
        
        this.scientificButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const func = btn.getAttribute('data-func');
                this.handleScientific(func);
                this.closeScientificPanel();
            });
        });
        
        setInterval(() => this.saveData(), 5000);
        window.addEventListener('beforeunload', () => this.saveData());
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Don't interfere with input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }
            
            // Prevent default only for calculator keys
            const calculatorKeys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','.',',','(',')','%','^','Enter','=','Escape','Delete','Backspace'];
            if (calculatorKeys.includes(e.key)) {
                e.preventDefault();
            }
            
            // Numbers
            if (e.key >= '0' && e.key <= '9') {
                this.inputNumber(e.key);
            }
            
            // Operators
            if (e.key === '+') this.inputOperator('+');
            if (e.key === '-') this.inputOperator('-');
            if (e.key === '*') this.inputOperator('*');
            if (e.key === '/') this.inputOperator('/');
            if (e.key === '(') this.inputOperator('(');
            if (e.key === ')') this.inputOperator(')');
            if (e.key === '%') this.percentage();
            if (e.key === '^') this.inputOperator('^');
            
            // Decimal point
            if (e.key === '.' || e.key === ',') this.inputDecimal();
            
            // Special keys
            if (e.key === 'Enter' || e.key === '=') this.calculate();
            if (e.key === 'Escape' || e.key === 'Delete') this.clearAll();
            if (e.key === 'Backspace') this.backspace();
            
            // Quick shortcuts with modifiers
            if ((e.key === 'm' || e.key === 'M') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.toggleScientific();
            }
            if ((e.key === 'h' || e.key === 'H') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.openHelp();
            }
            if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.toggleTheme();
            }
            if (e.key === 's' && e.altKey) this.squareRoot();
            if (e.key === 'q' && e.altKey) this.square();
            if (e.key === 'i' && e.altKey) this.inverse();
            
            // Memory functions with keyboard
            if (e.key === 'r' && e.shiftKey) this.handleMemory('mr');
            if (e.key === 'c' && e.shiftKey) this.handleMemory('mc');
            if (e.key === 's' && e.shiftKey) this.handleMemory('ms');
        });
    }
    
    // ========== THEME FUNCTIONS ==========
    toggleTheme() {
        const isDark = this.body.classList.contains('dark-mode');
        
        if (isDark) {
            this.body.classList.remove('dark-mode');
            this.body.classList.add('light-mode');
            this.modeIcon.classList.remove('fa-moon');
            this.modeIcon.classList.add('fa-sun');
            this.modeText.textContent = 'Light';
            this.showToast('Switched to Light Mode', 'info');
        } else {
            this.body.classList.remove('light-mode');
            this.body.classList.add('dark-mode');
            this.modeIcon.classList.remove('fa-sun');
            this.modeIcon.classList.add('fa-moon');
            this.modeText.textContent = 'Dark';
            this.showToast('Switched to Dark Mode', 'info');
        }
        
        this.saveData();
    }
    
    // ========== PANEL CONTROLS ==========
    toggleScientific() {
        this.isScientificOpen = !this.isScientificOpen;
        this.scientificPanel.classList.toggle('active', this.isScientificOpen);
        
        if (this.isScientificOpen) {
            this.showToast('Scientific Functions Panel Opened', 'info');
        }
    }
    
    closeScientificPanel() {
        this.isScientificOpen = false;
        this.scientificPanel.classList.remove('active');
    }
    
    openHelp() {
        this.helpModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeHelpModal() {
        this.helpModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    switchTab(button) {
        const tabId = button.getAttribute('data-tab');
        
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });
    }
    
    // ========== DISPLAY FUNCTIONS ==========
    updateDisplay() {
        // Format current expression for display
        let displayExpression = this.currentExpression;
        
        // Replace operators with display symbols
        displayExpression = displayExpression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/\^/g, '^');
        
        this.currentInputElement.value = displayExpression;
        
        if (this.history.length > 0) {
            this.historyElement.textContent = this.history.slice(-1)[0];
        } else {
            this.historyElement.textContent = 'Ready to calculate';
        }
        
        const formattedMemory = this.formatNumber(this.memory.toFixed(2));
        this.memoryDisplay.textContent = formattedMemory;
        this.memoryIndicator.querySelector('span').textContent = `M: ${formattedMemory}`;
        this.modeIndicator.querySelector('span').textContent = this.isDegreeMode ? 'DEG' : 'RAD';
        
        if (this.result !== '') {
            this.resultElement.textContent = `= ${this.formatNumber(this.result)}`;
        } else {
            this.resultElement.textContent = '';
        }
    }
    
    formatNumber(num) {
        if (num === '' || num === null || isNaN(num) || num === undefined) return '0';
        
        if (typeof num === 'string' && num.includes('.')) {
            num = num.replace(/(\.\d*?)0+$/, '$1');
            if (num.endsWith('.')) {
                num = num.slice(0, -1);
            }
        }
        
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return parts.length > 1 ? parts.join('.') : parts[0];
    }
    
    addHistory(entry) {
        this.history.push(entry);
        if (this.history.length > 3) {
            this.history.shift();
        }
        this.saveData();
    }
    
    // ========== PARENTHESES FIX ==========
    inputNumber(num) {
        if (this.currentExpression === '0' || this.lastResult !== null) {
            this.currentExpression = num;
            this.lastResult = null;
        } else {
            this.currentExpression += num;
        }
        this.result = '';
        this.updateDisplay();
        this.saveData();
    }
    
    inputOperator(op) {
        const lastChar = this.currentExpression.slice(-1);
        
        if (this.lastResult !== null) {
            this.currentExpression = this.lastResult + op;
            this.lastResult = null;
        } else if (op === '(') {
            // Handle opening parenthesis
            if (lastChar === ')' || !isNaN(lastChar) || lastChar === '.') {
                // Add multiplication before opening parenthesis if needed
                this.currentExpression += '*' + op;
            } else if (lastChar === '(' || lastChar === '' || '+-*/^'.includes(lastChar)) {
                // Can add opening parenthesis directly
                this.currentExpression += op;
            } else {
                this.currentExpression += op;
            }
        } else if (op === ')') {
            // Handle closing parenthesis
            const openCount = (this.currentExpression.match(/\(/g) || []).length;
            const closeCount = (this.currentExpression.match(/\)/g) || []).length;
            
            // Only add closing parenthesis if we have more opening ones
            if (openCount > closeCount && !'+-*/^('.includes(lastChar)) {
                this.currentExpression += op;
            }
        } else {
            // Handle other operators
            if ('+-*/^'.includes(lastChar)) {
                // Replace last operator
                this.currentExpression = this.currentExpression.slice(0, -1) + op;
            } else if (lastChar === '(' && op !== '(') {
                // Can't put operator right after opening parenthesis (except another '(')
                if (op !== '-') {
                    return; // Don't add operator
                } else {
                    // Allow negative sign after opening parenthesis
                    this.currentExpression += op;
                }
            } else if (lastChar === ')' && '+-*/^'.includes(op)) {
                // Can add operator after closing parenthesis
                this.currentExpression += op;
            } else {
                this.currentExpression += op;
            }
        }
        
        this.result = '';
        this.updateDisplay();
        this.saveData();
    }
    
    inputDecimal() {
        if (this.lastResult !== null) {
            this.currentExpression = '0.';
            this.lastResult = null;
        } else {
            // Get last number/expression segment
            const segments = this.currentExpression.split(/[\+\-\*\/\(\)\^]/);
            const lastSegment = segments[segments.length - 1];
            
            // Check if last segment already has decimal
            if (!lastSegment.includes('.')) {
                // If last segment is empty or ends with operator, add '0.' 
                if (lastSegment === '' || '+-*/^('.includes(this.currentExpression.slice(-1))) {
                    this.currentExpression += '0.';
                } else {
                    this.currentExpression += '.';
                }
            }
        }
        this.result = '';
        this.updateDisplay();
        this.saveData();
    }
    
    // ========== BODMAS EXPRESSION EVALUATION ==========
    
    // Main evaluation function with BODMAS
    evaluateExpression(expression) {
        try {
            // Clean the expression
            expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
            
            // Check for balanced parentheses
            if (!this.hasBalancedParentheses(expression)) {
                throw new Error('Unbalanced parentheses');
            }
            
            // Handle empty parentheses
            expression = expression.replace(/\(\)/g, '(0)');
            
            // Evaluate using BODMAS
            let result = this.evaluateBODMAS(expression);
            
            // Round to avoid floating point errors
            result = Math.round(result * 100000000) / 100000000;
            
            return result.toString();
        } catch (error) {
            console.error('Evaluation error:', error);
            throw new Error('Invalid expression');
        }
    }
    
    hasBalancedParentheses(expression) {
        let balance = 0;
        for (let char of expression) {
            if (char === '(') balance++;
            if (char === ')') balance--;
            if (balance < 0) return false; // More closing than opening
        }
        return balance === 0;
    }
    
    // Preprocess trigonometric and other functions
    preprocessFunctions(expression) {
        // Replace trig functions with their calculated values
        expression = expression.replace(/sin\(([^)]+)\)/g, (match, angle) => {
            const num = parseFloat(angle);
            const rad = this.isDegreeMode ? num * Math.PI / 180 : num;
            return Math.sin(rad);
        });
        
        expression = expression.replace(/cos\(([^)]+)\)/g, (match, angle) => {
            const num = parseFloat(angle);
            const rad = this.isDegreeMode ? num * Math.PI / 180 : num;
            return Math.cos(rad);
        });
        
        expression = expression.replace(/tan\(([^)]+)\)/g, (match, angle) => {
            const num = parseFloat(angle);
            const rad = this.isDegreeMode ? num * Math.PI / 180 : num;
            return Math.tan(rad);
        });
        
        expression = expression.replace(/sqrt\(([^)]+)\)/g, (match, num) => {
            return Math.sqrt(parseFloat(num));
        });
        
        expression = expression.replace(/log\(([^)]+)\)/g, (match, num) => {
            return Math.log10(parseFloat(num));
        });
        
        expression = expression.replace(/ln\(([^)]+)\)/g, (match, num) => {
            return Math.log(parseFloat(num));
        });
        
        expression = expression.replace(/π/g, Math.PI.toString());
        expression = expression.replace(/e/g, Math.E.toString());
        
        // Handle power (^) operator
        expression = expression.replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, (match, base, exp) => {
            return Math.pow(parseFloat(base), parseFloat(exp));
        });
        
        // Handle percentage
        expression = expression.replace(/(\d+(?:\.\d+)?)%/g, (match, num) => {
            return (parseFloat(num) / 100).toString();
        });
        
        return expression;
    }
    
    // BODMAS evaluation using Shunting Yard Algorithm
    evaluateBODMAS(expression) {
        // Remove spaces
        expression = expression.replace(/\s+/g, '');
        
        // Handle implicit multiplication: 2(3+4) -> 2*(3+4)
        expression = expression.replace(/(\d)(\()/g, '$1*$2');
        expression = expression.replace(/(\))(\d)/g, '$1*$2');
        expression = expression.replace(/(\))(\()/g, '$1*$2');
        
        // Operator precedence
        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3
        };
        
        // Stack for operators and output queue
        const outputQueue = [];
        const operatorStack = [];
        
        // Tokenize the expression
        const tokens = this.tokenizeExpression(expression);
        
        // Shunting Yard Algorithm
        for (let token of tokens) {
            if (!isNaN(token) && token !== '') {
                // Number
                outputQueue.push(parseFloat(token));
            } else if (token in precedence) {
                // Operator
                while (operatorStack.length > 0 && 
                       operatorStack[operatorStack.length - 1] !== '(' &&
                       precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            } else if (token === '(') {
                operatorStack.push(token);
            } else if (token === ')') {
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop());
                }
                if (operatorStack[operatorStack.length - 1] === '(') {
                    operatorStack.pop();
                } else {
                    throw new Error('Mismatched parentheses');
                }
            }
        }
        
        // Pop remaining operators
        while (operatorStack.length > 0) {
            if (operatorStack[operatorStack.length - 1] === '(') {
                throw new Error('Mismatched parentheses');
            }
            outputQueue.push(operatorStack.pop());
        }
        
        // Evaluate RPN (Reverse Polish Notation)
        const evalStack = [];
        
        for (let token of outputQueue) {
            if (typeof token === 'number') {
                evalStack.push(token);
            } else {
                const b = evalStack.pop();
                const a = evalStack.pop();
                
                if (a === undefined || b === undefined) {
                    throw new Error('Invalid expression');
                }
                
                switch (token) {
                    case '+': evalStack.push(a + b); break;
                    case '-': evalStack.push(a - b); break;
                    case '*': evalStack.push(a * b); break;
                    case '/': 
                        if (b === 0) throw new Error('Division by zero');
                        evalStack.push(a / b); 
                        break;
                    case '^': evalStack.push(Math.pow(a, b)); break;
                }
            }
        }
        
        if (evalStack.length !== 1) {
            throw new Error('Invalid expression');
        }
        
        return evalStack[0];
    }
    
    // Tokenize expression into numbers and operators
    tokenizeExpression(expression) {
        const tokens = [];
        let currentNumber = '';
        
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            
            if ((char >= '0' && char <= '9') || char === '.') {
                currentNumber += char;
            } else {
                if (currentNumber !== '') {
                    tokens.push(currentNumber);
                    currentNumber = '';
                }
                
                if (char === '+' || char === '-' || char === '*' || char === '/' || char === '^' || char === '(' || char === ')') {
                    // Handle negative numbers
                    if (char === '-' && (i === 0 || '+-*/^('.includes(expression[i-1]))) {
                        currentNumber += '-';
                    } else {
                        tokens.push(char);
                    }
                }
            }
        }
        
        if (currentNumber !== '') {
            tokens.push(currentNumber);
        }
        
        return tokens;
    }
    
    // ========== BASIC CALCULATOR FUNCTIONS ==========
    toggleSign() {
        try {
            if (this.result !== '') {
                const value = parseFloat(this.result);
                if (!isNaN(value)) {
                    this.currentExpression = (-value).toString();
                    this.result = '';
                }
            } else {
                // For negative numbers in expression
                if (this.currentExpression.startsWith('-')) {
                    this.currentExpression = this.currentExpression.substring(1);
                } else {
                    this.currentExpression = '-' + this.currentExpression;
                }
            }
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid operation');
        }
    }
    
    calculate() {
        try {
            if (this.currentExpression === '' || this.currentExpression === '0') {
                return;
            }
            
            // Check for trailing operators
            const lastChar = this.currentExpression.slice(-1);
            if ('+-*/^'.includes(lastChar)) {
                this.showError('Invalid expression: trailing operator');
                return;
            }
            
            // Check for empty parentheses
            if (this.currentExpression.includes('()')) {
                this.showError('Invalid expression: empty parentheses');
                return;
            }
            
            // Evaluate the expression with BODMAS
            const calculatedResult = this.evaluateExpression(this.currentExpression);
            
            this.result = calculatedResult;
            this.lastResult = calculatedResult;
            
            // Add to history
            this.addHistory(`${this.currentExpression} = ${calculatedResult}`);
            
            this.updateDisplay();
            this.saveData();
            this.showToast('Calculated with BODMAS', 'success');
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    clearAll() {
        this.currentExpression = '0';
        this.result = '';
        this.lastResult = null;
        this.updateDisplay();
        this.saveData();
        this.showToast('Cleared', 'info');
    }
    
    clearEntry() {
        if (this.lastResult !== null) {
            this.currentExpression = '0';
            this.lastResult = null;
        } else {
            this.currentExpression = '0';
        }
        this.result = '';
        this.updateDisplay();
        this.saveData();
        this.showToast('Entry Cleared', 'info');
    }
    
    backspace() {
        if (this.lastResult !== null) {
            this.currentExpression = '0';
            this.lastResult = null;
        } else if (this.currentExpression.length > 1) {
            this.currentExpression = this.currentExpression.slice(0, -1);
            
            // If we removed everything, set to '0'
            if (this.currentExpression === '') {
                this.currentExpression = '0';
            }
        } else {
            this.currentExpression = '0';
        }
        this.result = '';
        this.updateDisplay();
        this.saveData();
    }
    
    percentage() {
        try {
            // Evaluate current expression and divide by 100
            const currentValue = this.evaluateExpression(this.currentExpression);
            const result = currentValue / 100;
            
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`${currentValue}% = ${result}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Percentage Calculated', 'info');
        } catch (error) {
            this.showError('Invalid percentage operation');
        }
    }
    
    // ========== MEMORY FUNCTIONS ==========
    handleMemory(action) {
        let currentValue;
        
        if (this.result !== '') {
            currentValue = parseFloat(this.result);
        } else {
            try {
                currentValue = this.evaluateExpression(this.currentExpression);
            } catch (error) {
                currentValue = parseFloat(this.currentExpression) || 0;
            }
        }
        
        if (isNaN(currentValue)) {
            this.showToast('Invalid value for memory operation', 'error');
            return;
        }
        
        switch (action) {
            case 'mc':
                this.memory = 0;
                this.isMemorySet = false;
                this.showToast('Memory Cleared', 'success');
                break;
                
            case 'mr':
                if (this.isMemorySet) {
                    this.currentExpression = this.memory.toString();
                    this.result = '';
                    this.lastResult = null;
                    this.showToast('Memory Recalled', 'info');
                } else {
                    this.showToast('Memory is empty', 'warning');
                }
                break;
                
            case 'mPlus':
                this.memory += currentValue;
                this.isMemorySet = true;
                this.showToast(`Added ${this.formatNumber(currentValue.toString())} to Memory`, 'info');
                break;
                
            case 'mMinus':
                this.memory -= currentValue;
                this.isMemorySet = true;
                this.showToast(`Subtracted ${this.formatNumber(currentValue.toString())} from Memory`, 'info');
                break;
                
            case 'ms':
                this.memory = currentValue;
                this.isMemorySet = true;
                this.showToast('Value Stored in Memory', 'success');
                break;
                
            case 'mClear':
                this.showToast(`Memory: ${this.formatNumber(this.memory.toString())}`, 'info');
                break;
        }
        
        this.updateDisplay();
        this.saveData();
    }
    
    // ========== QUICK FUNCTIONS ==========
    handleQuickFunction(func) {
        const methods = {
            sqrt: () => this.squareRoot(),
            square: () => this.square(),
            inverse: () => this.inverse(),
            percent: () => this.percentage(),
            exp: () => this.exponential()
        };
        
        if (methods[func]) {
            methods[func]();
        }
    }
    
    squareRoot() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            if (value < 0) {
                this.showError('Cannot calculate square root of negative number');
                return;
            }
            
            const result = Math.sqrt(value);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`√${value} = ${result}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Square Root Calculated', 'info');
        } catch (error) {
            this.showError('Invalid square root operation');
        }
    }
    
    square() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const result = value * value;
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`(${value})² = ${result}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Square Calculated', 'info');
        } catch (error) {
            this.showError('Invalid square operation');
        }
    }
    
    inverse() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            if (value === 0) {
                this.showError('Cannot calculate inverse of zero');
                return;
            }
            
            const result = 1 / value;
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`1/(${value}) = ${result}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Inverse Calculated', 'info');
        } catch (error) {
            this.showError('Invalid inverse operation');
        }
    }
    
    exponential() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const result = Math.exp(value);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`e^${value} = ${result}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Exponential Calculated', 'info');
        } catch (error) {
            this.showError('Invalid exponential operation');
        }
    }
    
    // ========== SCIENTIFIC FUNCTIONS ==========
    handleScientific(func) {
        const methods = {
            sin: () => this.sine(),
            cos: () => this.cosine(),
            tan: () => this.tangent(),
            asin: () => this.arcsine(),
            acos: () => this.arccosine(),
            atan: () => this.arctangent(),
            log: () => this.log10(),
            ln: () => this.ln(),
            exp: () => this.exponential(),
            pi: () => this.pi(),
            e: () => this.e(),
            rand: () => this.random(),
            sqrt: () => this.squareRoot(),
            square: () => this.square(),
            cube: () => this.cube(),
            power: () => this.power(),
            fact: () => this.factorial(),
            mod: () => this.modulus(),
            deg: () => this.setDegrees(),
            rad: () => this.setRadians(),
            grad: () => this.setGrads(),
            hyp: () => this.hypotenuse(),
            abs: () => this.absolute(),
            floor: () => this.floor()
        };
        
        if (methods[func]) {
            methods[func]();
        }
    }
    
    sine() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const angle = this.isDegreeMode ? value * Math.PI / 180 : value;
            const result = Math.sin(angle);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`sin(${value}${this.isDegreeMode ? '°' : 'rad'}) = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid sine operation');
        }
    }
    
    cosine() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const angle = this.isDegreeMode ? value * Math.PI / 180 : value;
            const result = Math.cos(angle);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`cos(${value}${this.isDegreeMode ? '°' : 'rad'}) = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid cosine operation');
        }
    }
    
    tangent() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const angle = this.isDegreeMode ? value * Math.PI / 180 : value;
            const result = Math.tan(angle);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`tan(${value}${this.isDegreeMode ? '°' : 'rad'}) = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid tangent operation');
        }
    }
    
    arcsine() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            if (value < -1 || value > 1) {
                this.showError('Invalid input for arcsin (must be between -1 and 1)');
                return;
            }
            
            const result = Math.asin(value);
            const resultDegrees = result * 180 / Math.PI;
            this.currentExpression = this.isDegreeMode ? resultDegrees.toString() : result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`sin⁻¹(${value}) = ${this.formatNumber(this.currentExpression)}${this.isDegreeMode ? '°' : 'rad'}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid arcsine operation');
        }
    }
    
    arccosine() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            if (value < -1 || value > 1) {
                this.showError('Invalid input for arccos (must be between -1 and 1)');
                return;
            }
            
            const result = Math.acos(value);
            const resultDegrees = result * 180 / Math.PI;
            this.currentExpression = this.isDegreeMode ? resultDegrees.toString() : result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`cos⁻¹(${value}) = ${this.formatNumber(this.currentExpression)}${this.isDegreeMode ? '°' : 'rad'}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid arccosine operation');
        }
    }
    
    arctangent() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const result = Math.atan(value);
            const resultDegrees = result * 180 / Math.PI;
            this.currentExpression = this.isDegreeMode ? resultDegrees.toString() : result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`tan⁻¹(${value}) = ${this.formatNumber(this.currentExpression)}${this.isDegreeMode ? '°' : 'rad'}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid arctangent operation');
        }
    }
    
    log10() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            if (value <= 0) {
                this.showError('Invalid input for log (must be positive)');
                return;
            }
            
            const result = Math.log10(value);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`log(${value}) = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid logarithm operation');
        }
    }
    
    ln() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            if (value <= 0) {
                this.showError('Invalid input for ln (must be positive)');
                return;
            }
            
            const result = Math.log(value);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`ln(${value}) = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
        } catch (error) {
            this.showError('Invalid natural logarithm operation');
        }
    }
    
    pi() {
        this.currentExpression = Math.PI.toString();
        this.result = '';
        this.lastResult = null;
        this.addHistory('π entered');
        this.updateDisplay();
        this.saveData();
    }
    
    e() {
        this.currentExpression = Math.E.toString();
        this.result = '';
        this.lastResult = null;
        this.addHistory('e entered');
        this.updateDisplay();
        this.saveData();
    }
    
    random() {
        const result = Math.random();
        this.currentExpression = result.toString();
        this.result = '';
        this.lastResult = null;
        this.addHistory(`Random: ${this.formatNumber(result.toString())}`);
        this.updateDisplay();
        this.saveData();
    }
    
    cube() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const result = value * value * value;
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`(${this.formatNumber(value.toString())})³ = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Cube Calculated', 'info');
        } catch (error) {
            this.showError('Invalid cube operation');
        }
    }
    
    power() {
        this.inputOperator('^');
    }
    
    factorial() {
        try {
            let value;
            if (this.result !== '') {
                value = parseInt(this.result);
            } else {
                value = parseInt(this.evaluateExpression(this.currentExpression));
            }
            
            if (isNaN(value) || value < 0 || value > 100) {
                this.showError('Invalid input for factorial (0-100 only)');
                return;
            }
            
            let result = 1;
            for (let i = 2; i <= value; i++) {
                result *= i;
            }
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`(${value})! = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Factorial Calculated', 'info');
        } catch (error) {
            this.showError('Invalid factorial operation');
        }
    }
    
    modulus() {
        try {
            this.showToast('Use % operator for modulus', 'info');
        } catch (error) {
            this.showError('Invalid modulus operation');
        }
    }
    
    setDegrees() {
        this.isDegreeMode = true;
        this.modeIndicator.querySelector('span').textContent = 'DEG';
        this.saveData();
        this.showToast('Angle mode set to Degrees', 'info');
    }
    
    setRadians() {
        this.isDegreeMode = false;
        this.modeIndicator.querySelector('span').textContent = 'RAD';
        this.saveData();
        this.showToast('Angle mode set to Radians', 'info');
    }
    
    setGrads() {
        this.showToast('Grads mode not implemented', 'warning');
    }
    
    hypotenuse() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            if (value <= 0) {
                this.showError('Invalid input for hypotenuse');
                return;
            }
            
            const result = Math.sqrt(value * value + 1);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`hyp(${value}, 1) = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Hypotenuse Calculated', 'info');
        } catch (error) {
            this.showError('Invalid hypotenuse operation');
        }
    }
    
    absolute() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const result = Math.abs(value);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`|${value}| = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Absolute Value Calculated', 'info');
        } catch (error) {
            this.showError('Invalid absolute value operation');
        }
    }
    
    floor() {
        try {
            let value;
            if (this.result !== '') {
                value = parseFloat(this.result);
            } else {
                value = this.evaluateExpression(this.currentExpression);
            }
            
            const result = Math.floor(value);
            this.currentExpression = result.toString();
            this.result = '';
            this.lastResult = null;
            this.addHistory(`⌊${value}⌋ = ${this.formatNumber(result.toString())}`);
            this.updateDisplay();
            this.saveData();
            this.showToast('Floor Value Calculated', 'info');
        } catch (error) {
            this.showError('Invalid floor operation');
        }
    }
    
    // ========== UTILITY FUNCTIONS ==========
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00b894' : 
                        type === 'error' ? '#e74c3c' : 
                        type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    showError(message) {
        this.resultElement.textContent = `Error: ${message}`;
        this.showToast(message, 'error');
        setTimeout(() => {
            this.resultElement.textContent = '';
        }, 3000);
    }
}

// Add toast animations to head
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new NeoCalc();
    
    // Make calculator globally accessible for debugging
    window.calculator = calculator;
});