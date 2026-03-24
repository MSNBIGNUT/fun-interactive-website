// ==================== 全局变量 ====================
let mouseX = 0, mouseY = 0;
let petX = window.innerWidth / 2, petY = window.innerHeight / 2;
let petState = 'idle'; // idle, sleepy, hungry, happy
let petThoughtTimer;
let keysPressed = {};

// 表情符号库
const rainEmojis = ['🍬', '⭐', '🐙', '🎈', '🌸', '💖', '🦄', '🍭', '✨', '🎵'];
const petEmojis = ['🐱', '🐶', '🐰', '🦊', '🐼'];
const petThoughts = ['好无聊...', '求摸摸~', '饿了！', '困了...', '嘿嘿~', '发呆了'];
const truthQuestions = [
    '你上次偷偷哭是什么时候？',
    '如果你能隐身一小时，你会做什么？',
    '你做过最尴尬的事是什么？',
    '你有没有偷偷讨厌过好朋友？',
    '你手机里最羞耻的照片是什么？',
    '你撒过最大的谎是什么？',
    '你有没有暗恋过老师/上司？',
    '你最后悔的一件事是什么？',
    '你有没有偷看过别人手机？',
    '你最奇怪的癖好是什么？'
];

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initGhostCursor();
    initRain();
    initPet();
    initTimeBackground();
    initGravity();
    initSecret();
    initClickEffects();
    
    // 隐藏默认鼠标
    document.body.style.cursor = 'none';
});

// ==================== 小幽灵鼠标 ====================
function initGhostCursor() {
    const ghost = document.getElementById('ghost-cursor');
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 幽灵跟随鼠标（带延迟）
        setTimeout(() => {
            ghost.style.left = (mouseX - 12) + 'px';
            ghost.style.top = (mouseY - 12) + 'px';
        }, 50);
    });
    
    // 点击时幽灵变化
    document.addEventListener('mousedown', () => {
        ghost.textContent = '👻';
        ghost.style.transform = 'scale(1.3)';
    });
    
    document.addEventListener('mouseup', () => {
        ghost.style.transform = 'scale(1)';
    });
}

// ==================== 奇怪的雨 ====================
function initRain() {
    setInterval(() => {
        createRainDrop();
    }, 300);
}

function createRainDrop() {
    const rainContainer = document.getElementById('rain-container');
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.textContent = rainEmojis[Math.floor(Math.random() * rainEmojis.length)];
    drop.style.left = Math.random() * 100 + '%';
    drop.style.animationDuration = (Math.random() * 2 + 2) + 's';
    rainContainer.appendChild(drop);
    
    // 清理
    setTimeout(() => drop.remove(), 4000);
}

// ==================== 点击效果（泡泡 + 星光） ====================
function initClickEffects() {
    document.addEventListener('click', (e) => {
        // 创建泡泡
        for (let i = 0; i < 3; i++) {
            createBubble(e.clientX, e.clientY);
        }
        
        // 撒星光
        for (let i = 0; i < 5; i++) {
            createStar(e.clientX, e.clientY);
        }
        
        // 播放音效（简单版本）
        playPopSound();
    });
}

function createBubble(x, y) {
    const container = document.getElementById('effects-container');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * 30 + 20;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = (x + Math.random() * 100 - 50) + 'px';
    bubble.style.top = (y + Math.random() * 100 - 50) + 'px';
    container.appendChild(bubble);
    
    setTimeout(() => bubble.remove(), 500);
}

function createStar(x, y) {
    const container = document.getElementById('effects-container');
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    star.style.left = (x + Math.random() * 150 - 75) + 'px';
    star.style.top = (y + Math.random() * 150 - 75) + 'px';
    container.appendChild(star);
    
    setTimeout(() => star.remove(), 1000);
}

function playPopSound() {
    // 简单的音频合成
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800 + Math.random() * 400;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // 音频不支持时忽略
    }
}

// ==================== 屏幕宠物 ====================
function initPet() {
    const pet = document.getElementById('pet');
    const thought = document.getElementById('pet-thought');
    
    // 随机选择宠物
    pet.textContent = petEmojis[Math.floor(Math.random() * petEmojis.length)];
    
    // 宠物跟随鼠标（缓慢）
    setInterval(() => {
        const dx = mouseX - petX;
        const dy = mouseY - petY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 100) {
            petX += dx * 0.02;
            petY += dy * 0.02;
        } else if (distance < 50 && distance > 0) {
            // 躲鼠标
            petX -= dx * 0.03;
            petY -= dy * 0.03;
        }
        
        pet.style.left = petX + 'px';
        pet.style.top = petY + 'px';
    }, 50);
    
    // 随机状态变化
    setInterval(() => {
        const states = ['idle', 'sleepy', 'happy'];
        petState = states[Math.floor(Math.random() * states.length)];
        
        if (petState === 'sleepy') {
            pet.textContent = '😴';
            showThought('Zzz...');
        } else if (petState === 'happy') {
            pet.textContent = '😺';
            showThought('开心~');
        } else {
            pet.textContent = petEmojis[Math.floor(Math.random() * petEmojis.length)];
        }
    }, 5000);
    
    // 点击宠物
    pet.addEventListener('click', () => {
        pet.textContent = '😻';
        showThought('好舒服~');
        petState = 'happy';
        
        // 撒更多星光
        for (let i = 0; i < 10; i++) {
            createStar(petX, petY);
        }
    });
    
    // 双击宠物 - 打哈欠
    pet.addEventListener('dblclick', () => {
        pet.textContent = '😮';
        showThought('啊~~~困了');
        setTimeout(() => {
            pet.textContent = petEmojis[Math.floor(Math.random() * petEmojis.length)];
        }, 1000);
    });
    
    // 随机打哈欠
    setInterval(() => {
        if (Math.random() > 0.7) {
            pet.textContent = '😮';
            showThought('哈~~~');
            setTimeout(() => {
                pet.textContent = petEmojis[Math.floor(Math.random() * petEmojis.length)];
            }, 1500);
        }
    }, 10000);
}

function showThought(text) {
    const thought = document.getElementById('pet-thought');
    thought.textContent = text;
    thought.style.display = 'block';
    thought.style.left = (petX + 50) + 'px';
    thought.style.top = (petY - 20) + 'px';
    
    setTimeout(() => {
        thought.style.display = 'none';
    }, 2000);
}

// ==================== 时间背景 ====================
function initTimeBackground() {
    const bg = document.getElementById('background');
    
    function updateBackground() {
        const hour = new Date().getHours();
        bg.className = '';
        
        if (hour >= 5 && hour < 12) {
            bg.classList.add('morning');
        } else if (hour >= 12 && hour < 17) {
            bg.classList.add('noon');
        } else if (hour >= 17 && hour < 22) {
            bg.classList.add('evening');
        } else {
            bg.classList.add('night');
        }
    }
    
    updateBackground();
    setInterval(updateBackground, 60000); // 每分钟检查
}

// ==================== 情绪垃圾桶 ====================
function burnWorry() {
    const input = document.getElementById('worry-input');
    const worry = input.value.trim();
    
    if (!worry) return;
    
    const paper = document.getElementById('burning-paper');
    paper.innerHTML = `<div class="burning-text">🔥 "${worry}" 正在燃烧...</div>`;
    
    setTimeout(() => {
        paper.innerHTML = '✨ 烦恼消失了！感觉好多了吧~';
        input.value = '';
        
        // 更多特效
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createStar(window.innerWidth / 2, window.innerHeight / 2);
            }, i * 50);
        }
    }, 2000);
}

// ==================== 真心话生成器 ====================
function generateTruth() {
    const result = document.getElementById('truth-result');
    const question = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
    
    result.style.opacity = 0;
    setTimeout(() => {
        result.textContent = '🎲 ' + question;
        result.style.opacity = 1;
    }, 300);
}

// ==================== 跳舞文字 ====================
function createDancingText(text) {
    const container = document.getElementById('dance-container');
    container.innerHTML = '';
    
    if (!text) return;
    
    const letters = text.split('');
    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.className = 'dancing-letter';
        span.textContent = letter;
        span.style.left = (index * 30) + 'px';
        span.style.top = '20px';
        span.style.color = `hsl(${index * 30}, 70%, 50%)`;
        
        // 躲鼠标
        span.addEventListener('mousemove', (e) => {
            const dx = (Math.random() - 0.5) * 100;
            const dy = (Math.random() - 0.5) * 100;
            span.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`;
        });
        
        // 点击弹跳
        span.addEventListener('click', () => {
            span.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                span.style.animation = '';
            }, 500);
        });
        
        container.appendChild(span);
    });
}

// 添加弹跳动画
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-30px); }
    }
`;
document.head.appendChild(style);

// ==================== 反重力 ====================
function initGravity() {
    const boxes = document.querySelectorAll('.float-box');
    
    boxes.forEach(box => {
        let isDragging = false;
        let velocityX = 0, velocityY = 0;
        let posX = Math.random() * 200;
        let posY = Math.random() * 200;
        
        box.style.left = posX + 'px';
        box.style.top = posY + 'px';
        
        box.addEventListener('mousedown', (e) => {
            isDragging = true;
            velocityX = 0;
            velocityY = 0;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = box.parentElement.getBoundingClientRect();
            posX = e.clientX - rect.left - 30;
            posY = e.clientY - rect.top - 30;
            
            box.style.left = posX + 'px';
            box.style.top = posY + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // 给一个向上的初速度（反重力）
                velocityY = -5 - Math.random() * 5;
                velocityX = (Math.random() - 0.5) * 10;
            }
        });
        
        // 物理模拟
        function animate() {
            if (!isDragging) {
                velocityY += 0.2; // 重力（但很弱）
                velocityX *= 0.99; // 空气阻力
                velocityY *= 0.99;
                
                posX += velocityX;
                posY += velocityY;
                
                // 边界碰撞
                const rect = box.parentElement.getBoundingClientRect();
                if (posX < 0 || posX > rect.width - 60) {
                    velocityX *= -0.8;
                    posX = Math.max(0, Math.min(posX, rect.width - 60));
                }
                if (posY < 0 || posY > rect.height - 60) {
                    velocityY *= -0.8;
                    posY = Math.max(0, Math.min(posY, rect.height - 60));
                }
                
                box.style.left = posX + 'px';
                box.style.top = posY + 'px';
            }
            requestAnimationFrame(animate);
        }
        animate();
    });
}

// ==================== 隐藏彩蛋 ====================
function initSecret() {
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
        
        // 检查 CTL 组合
        if (keysPressed['c'] && keysPressed['t'] && keysPressed['l']) {
            showSecret();
            // 重置
            keysPressed = {};
        }
    });
    
    document.addEventListener('keyup', (e) => {
        delete keysPressed[e.key.toLowerCase()];
    });
}

function showSecret() {
    const panel = document.getElementById('secret-panel');
    panel.style.display = 'block';
    
    // 庆祝效果
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createRainDrop();
        }, i * 50);
    }
}

function closeSecret() {
    document.getElementById('secret-panel').style.display = 'none';
}
