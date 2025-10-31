// main.js
const display = document.getElementById('display');
const keys = document.querySelector('.keys');

let lastWasEval = false;    // ayuda a reemplazar pantalla tras evaluar
let parenOpen = 0;

function insert(value) {
  if (lastWasEval && /[0-9.()]/.test(value)) {
    // si se hizo una evaluación y el usuario escribe un número o paréntesis, reiniciamos
    display.value = '';
  }
  lastWasEval = false;
  display.value += value;
}

function clearAll() {
  display.value = '';
  parenOpen = 0;
  lastWasEval = false;
}

function backspace() {
  display.value = display.value.slice(0, -1);
}

function toggleParen() {
  // inserta '(' si paréntesis abierto es 0 o el último carácter es operador, si no inserta ')'
  const val = display.value;
  const last = val.slice(-1);
  if (parenOpen === 0 || /[+\-*/(]/.test(last) || val === '') {
    insert('(');
    parenOpen++;
  } else {
    if (parenOpen > 0) {
      insert(')');
      parenOpen--;
    } else {
      insert('(');
      parenOpen++;
    }
  }
}

function safeEvaluate(expr) {
  // normaliza símbolos visuales a operadores JS
  expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

  // valida que sólo contenga caracteres permitidos (números, operadores, puntos, paréntesis y espacios)
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
    throw new Error('Expresión inválida');
  }

  // evita secuencias problemáticas como "**" o "*/" al evaluarlo (aunque "**" es válido en JS, lo prevenimos si lo deseas)
  if (/[^\d.)]\s*[+\-*/]{2,}/.test(expr)) {
    throw new Error('Operador inválido');
  }

  // Evaluación controlada
  // Usamos Function en vez de eval por un poco más de control; validamos antes.
  // Nota: para cálculos muy seguros/avanzados usa un parser matemático.
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${expr})`)();
  if (typeof result === 'number' && !Number.isFinite(result)) {
    throw new Error('Resultado no finito');
  }
  return result;
}

function evaluate() {
  const expr = display.value.trim();
  if (!expr) return;
  try {
    const result = safeEvaluate(expr);
    display.value = String(result);
    lastWasEval = true;
    parenOpen = 0;
  } catch (err) {
    display.value = 'Error';
    lastWasEval = true;
    setTimeout(() => {
      display.value = '';
      lastWasEval = false;
    }, 900);
  }
}

// manejo de clicks en botones
keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const val = btn.dataset.value;
  const action = btn.dataset.action;

  if (val !== undefined) {
    insert(val);
    return;
  }

  if (action) {
    if (action === 'clear') clearAll();
    else if (action === 'back') backspace();
    else if (action === 'equals') evaluate();
    else if (action === 'paren') toggleParen();
  }
});

// soporte de teclado
window.addEventListener('keydown', (e) => {
  const key = e.key;

  if ((/^[0-9]$/).test(key)) {
    insert(key);
    e.preventDefault();
    return;
  }

  if (key === '.') { insert('.'); e.preventDefault(); return; }
  if (key === '+' || key === '-' || key === '*' || key === '/') { insert(key); e.preventDefault(); return; }
  if (key === 'Enter' || key === '=') { evaluate(); e.preventDefault(); return; }
  if (key === 'Backspace') { backspace(); e.preventDefault(); return; }
  if (key === 'Escape') { clearAll(); e.preventDefault(); return; }
  if (key === '(' || key === ')') { insert(key); e.preventDefault(); return; }
  // también permitimos coma como punto decimal si viene de algunas configuraciones
  if (key === ',') { insert('.'); e.preventDefault(); return; }
});
