// DOM Elements
const predictionForm = document.getElementById('prediction-form');
const resultContainer = document.getElementById('result-container');
const loadingIndicator = document.getElementById('loading-indicator');
const resultValue = document.getElementById('result-value');
const reInput = document.getElementById('re-input');
const rctInput = document.getElementById('rct-input');
const reSlider = document.getElementById('re-slider');
const rctSlider = document.getElementById('rct-slider');
const degradationValue = document.getElementById('degradation-value');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const historyList = document.getElementById('history-list');

// Initialize dark/light theme
function initTheme() {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  document.body.classList.toggle('dark-theme', isDarkTheme);
  updateThemeToggle(isDarkTheme);
}

// Update theme toggle button
function updateThemeToggle(isDark) {
  themeIcon.textContent = isDark ? '🌙' : '☀️';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

// Toggle theme
function toggleTheme() {
  const isDarkTheme = document.body.classList.toggle('dark-theme');
  localStorage.setItem('darkTheme', isDarkTheme);
  updateThemeToggle(isDarkTheme);
}

// Initialize sliders and inputs
function initInputs() {
  if (reSlider && reInput) {
    reSlider.addEventListener('input', () => {
      reInput.value = reSlider.value;
      updateDegradation();
    });

    reInput.addEventListener('input', () => {
      reSlider.value = reInput.value;
      updateDegradation();
    });
  }

  if (rctSlider && rctInput) {
    rctSlider.addEventListener('input', () => {
      rctInput.value = rctSlider.value;
      updateDegradation();
    });

    rctInput.addEventListener('input', () => {
      rctSlider.value = rctInput.value;
      updateDegradation();
    });
  }
}

// Update degradation value (Re * Rct)
function updateDegradation() {
  if (reInput && rctInput && degradationValue) {
    const re = parseFloat(reInput.value) || 0;
    const rct = parseFloat(rctInput.value) || 0;
    const degradation = re * rct;
    degradationValue.textContent = degradation.toFixed(2);
  }
}

// Format date for display
function formatDate(date) {
  return new Date(date).toLocaleString();
}

// Save prediction to history
function savePrediction(data) {
  let history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
  const prediction = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    re: data.input.Re,
    rct: data.input.Rct,
    degradation: data.input.degradation,
    rul: data.predicted_RUL
  };
  
  // Add to beginning of array
  history.unshift(prediction);
  
  // Limit history to 20 items
  if (history.length > 20) {
    history = history.slice(0, 20);
  }
  
  localStorage.setItem('predictionHistory', JSON.stringify(history));
  
  // Update UI if on history page
  if (historyList) {
    loadHistory();
  }
}

// Load prediction history
function loadHistory() {
  if (!historyList) return;
  
  const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="text-center">No prediction history available.</p>';
    return;
  }
  
  historyList.innerHTML = '';
  
  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'card mb-4';
    historyItem.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${formatDate(item.timestamp)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Re:</span>
        <span class="detail-value">${item.re} Ω</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Rct:</span>
        <span class="detail-value">${item.rct} Ω</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Degradation:</span>
        <span class="detail-value">${item.degradation.toFixed(2)} Ω²</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Predicted RUL:</span>
        <span class="detail-value" style="color: var(--color-primary);">${item.rul.toFixed(2)} cycles</span>
      </div>
    `;
    historyList.appendChild(historyItem);
  });
}

// Submit prediction form
async function submitPrediction(event) {
  event.preventDefault();
  
  const re = parseFloat(reInput.value);
  const rct = parseFloat(rctInput.value);
  
  if (isNaN(re) || isNaN(rct)) {
    alert('Please enter valid numerical values for Re and Rct');
    return;
  }
  
  // Show loading indicator
  resultContainer.style.display = 'none';
  loadingIndicator.style.display = 'block';
  
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Re: re, Rct: rct }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Update result display
      resultValue.textContent = data.predicted_RUL.toFixed(2);
      document.getElementById('input-re').textContent = data.input.Re;
      document.getElementById('input-rct').textContent = data.input.Rct;
      document.getElementById('input-degradation').textContent = data.input.degradation.toFixed(2);
      
      // Save to history
      savePrediction(data);
      
      // Show result
      resultContainer.style.display = 'block';
    } else {
      alert(`Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    alert(`Network error: ${error.message}`);
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();
  
  // Theme toggle event listener
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Initialize inputs
  initInputs();
  updateDegradation();
  
  // Form submission
  if (predictionForm) {
    predictionForm.addEventListener('submit', submitPrediction);
  }
  
  // Load history
  loadHistory();
});