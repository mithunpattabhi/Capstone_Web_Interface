const dropZone = document.getElementById('dropZone');
const videoInput = document.getElementById('videoInput');
const analyzeBtn = document.getElementById('analyzeBtn');

const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');

let selectedFile = null;

// Drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => videoInput.click());
videoInput.addEventListener('change', handleFileSelect);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        selectedFile = files[0];
        dropZone.querySelector('h3').textContent = selectedFile.name;
        dropZone.querySelector('p').textContent = 'Ready to analyze';
        analyzeBtn.disabled = false;
    }
}

analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show loading
    uploadSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.error) {
            alert('Error: ' + data.error);
            resetApp();
            return;
        }

        displayResults(data);
    } catch (err) {
        alert('An error occurred during analysis.');
        resetApp();
    }
});

function displayResults(data) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    const finalPrediction = document.getElementById('finalPrediction');
    const mainResultCard = document.getElementById('mainResultCard');
    
    finalPrediction.textContent = data.prediction;
    document.getElementById('confidenceBadge').textContent = data.confidence;

    // Set colors based on prediction
    mainResultCard.classList.remove('danger', 'success');
    if (data.prediction === 'Fall' || data.prediction === 'Aggression') {
        mainResultCard.classList.add('danger');
    } else {
        mainResultCard.classList.add('success');
    }

    // Populate Metrics
    document.getElementById('envMode').textContent = data.mode;
    document.getElementById('brightnessVal').textContent = 'Brightness: ' + data.brightness;

    document.getElementById('audioStatus').textContent = data.audio_detected ? `Volume: ${data.audio_volume}` : 'No Audio';
    const audioOverride = document.getElementById('audioOverride');
    if (data.audio_override_triggered) {
        audioOverride.classList.remove('hidden');
    } else {
        audioOverride.classList.add('hidden');
    }

    document.getElementById('yoloStatus').textContent = data.yolo_override_triggered ? 'Anomalous Pose' : 'Stable Pose';
    const yoloOverride = document.getElementById('yoloOverride');
    if (data.yolo_override_triggered) {
        yoloOverride.classList.remove('hidden');
    } else {
        yoloOverride.classList.add('hidden');
    }
}

function resetApp() {
    selectedFile = null;
    videoInput.value = '';
    dropZone.querySelector('h3').textContent = 'Drag & Drop Video Here';
    dropZone.querySelector('p').textContent = 'or click to browse from your computer';
    analyzeBtn.disabled = true;
    
    resultsSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
}
