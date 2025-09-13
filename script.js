// Customizable configuration
const config = {
    question: "¿Te gustaría salir conmigo? <3",
    successMessage: "¡Lo sabía! 😊",
    successGif: "https://farm4.static.flickr.com/3262/2720527056_ce94a0ffb4_o.gif",
    yesButtonGrowthRate: 2, // Yes button growth factor
    noButtonShrinkFactor: 0.9 // No button shrink factor
};

// Global variables
let noButtonClicks = 0;
let yesButtonSize = 1;
let noButtonScale = 1;

// DOM elements
const proposalSection = document.getElementById('proposal-section');
const successSection = document.getElementById('success-section');
const questionText = document.getElementById('question-text');
const successMessage = document.getElementById('success-message');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const successGif = document.getElementById('success-gif');

// Load custom configuration from external file
function loadConfig() {
    fetch('config/config.json')
        .then(response => response.json())
        .then(data => {
            Object.assign(config, data);
            updateContent();
        })
        .catch(error => {
            console.log('Using default configuration');
            updateContent();
        });
}

// Update content with current configuration
function updateContent() {
    questionText.textContent = config.question;
    successMessage.textContent = config.successMessage;
    
    if (config.successGif) {
        successGif.src = config.successGif;
    }
}

// Move No button randomly around screen, avoiding Yes button
function moveNoButton() {
    noBtn.style.position = 'fixed';
    
    const yesRect = document.querySelector('.yes-btn').getBoundingClientRect();
    const noBtnRect = noBtn.getBoundingClientRect();
    const noBtnWidth = noBtnRect.width;
    const noBtnHeight = noBtnRect.height;
    
    // Adjust margin based on screen size for better mobile experience
    const margin = window.innerWidth < 480 ? 15 : 20;
    const minDistance = window.innerWidth < 480 ? 60 : 80; // Minimum distance from Yes button
    
    let tries = 0;
    let maxTries = 100;
    let found = false;
    let newX, newY;
    
    // Find a position that doesn't collide with Yes button
    while (!found && tries < maxTries) {
        newX = Math.random() * (window.innerWidth - noBtnWidth - margin * 2) + margin;
        newY = Math.random() * (window.innerHeight - noBtnHeight - margin * 2) + margin;
        
        const testRect = {
            left: newX,
            right: newX + noBtnWidth,
            top: newY,
            bottom: newY + noBtnHeight
        };
        
        // Check collision with Yes button with minimum distance
        if (
            testRect.right < yesRect.left - minDistance ||
            testRect.left > yesRect.right + minDistance ||
            testRect.bottom < yesRect.top - minDistance ||
            testRect.top > yesRect.bottom + minDistance
        ) {
            found = true;
        }
        tries++;
    }
    
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';
    
    // Add bounce animation and random rotation
    noBtn.style.animation = 'bounce 0.5s ease';
    setTimeout(() => {
        noBtn.style.animation = '';
    }, 500);
    const rotation = (Math.random() - 0.5) * 20;
    noBtn.style.transform = `scale(${noButtonScale}) rotate(${rotation}deg)`;
}

// Make Yes button grow and change color intensity
function growYesButton() {
    yesButtonSize *= config.yesButtonGrowthRate;
    yesBtn.style.transform = `scale(${yesButtonSize})`;
    const intensity = Math.min(255, 107 + (noButtonClicks * 20));
    yesBtn.style.background = `linear-gradient(45deg, #ff${intensity.toString(16)}9d, #ff8fab)`;
    yesBtn.style.boxShadow = `0 8px 25px rgba(255, 107, 157, 0.8), 0 0 20px rgba(255, 107, 157, 0.5)`;
}

// Shrink No button each time it's clicked
function shrinkNoButton() {
    noButtonScale = Math.max(0.3, noButtonScale * config.noButtonShrinkFactor);
    noBtn.style.transform = `scale(${noButtonScale})`;
    noBtn.style.fontSize = `${22 * noButtonScale}px`;
}

// Handle Yes button click - show success screen
function handleYesClick() {
    proposalSection.classList.add('hidden');
    document.querySelector('.buttons-container').classList.add('hide-buttons');
    noBtn.style.display = 'none';
    successSection.classList.remove('hidden');
    createConfetti();
    playSuccessSound();
}

// Handle No button click - make it harder to click
function handleNoClick() {
    noButtonClicks++;
    shrinkNoButton();
    moveNoButton();
    growYesButton();
    
    // Change No button text progressively
    const noTexts = [
        "¿Seguro?",
        "¿De verdad?",
        "Piénsalo bien",
        "¿Estás segura?",
        "Última oportunidad",
        "Por favor",
        "Te lo pido",
        "❤️",
        "No me hagas esto",
        "😢"
    ];
    if (noButtonClicks < noTexts.length) {
        noBtn.textContent = noTexts[noButtonClicks];
    }
}

// Create falling confetti animation
function createConfetti() {
    const colors = ['#ff6b9d', '#ff8fab', '#ffb6c1', '#ff69b4', '#ff1493'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);
        
        // Falling animation
        const animation = confetti.animate([
            { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => {
            document.body.removeChild(confetti);
        };
    }
}

// Play success sound (optional)
function playSuccessSound() {
    // Add audio file here if desired
    // const audio = new Audio('config/success.mp3');
    // audio.play().catch(e => console.log('Audio not available'));
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
`;
document.head.appendChild(style);

// Event listeners
yesBtn.addEventListener('click', handleYesClick);
noBtn.addEventListener('click', handleNoClick);

// Add touch support for better mobile experience
yesBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    yesBtn.style.transform = `scale(${yesButtonSize * 1.05})`;
});

yesBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    yesBtn.style.transform = `scale(${yesButtonSize})`;
    handleYesClick();
});

noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    noBtn.style.transform = `scale(${noButtonScale * 1.05})`;
});

noBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    noBtn.style.transform = `scale(${noButtonScale})`;
    handleNoClick();
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    
    // Add entrance animation
    proposalSection.style.opacity = '0';
    proposalSection.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        proposalSection.style.transition = 'all 0.5s ease';
        proposalSection.style.opacity = '1';
        proposalSection.style.transform = 'translateY(0)';
    }, 100);
});

// Prevent No button from being selected with keyboard
noBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
    }
});

// Add dramatic hover effect to Yes button
yesBtn.addEventListener('mouseenter', () => {
    yesBtn.style.transform = `scale(${yesButtonSize * 1.1})`;
});

yesBtn.addEventListener('mouseleave', () => {
    yesBtn.style.transform = `scale(${yesButtonSize})`;
});

// Ensure No button stays visible when window is resized
window.addEventListener('resize', () => {
    if (noBtn.style.position === 'fixed') {
        const rect = noBtn.getBoundingClientRect();
        if (rect.right < 0 || rect.left > window.innerWidth || 
            rect.bottom < 0 || rect.top > window.innerHeight) {
            moveNoButton();
        }
    }
});

// Change success GIF on load
if (successGif) {
    successGif.src = "https://media1.tenor.com/m/Q00qNDfVO-cAAAAd/pucca-garu.gif";
} 