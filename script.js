// --- VARIABLES GLOBALES ---
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let schedule = JSON.parse(localStorage.getItem('schedule')) || Array(5).fill().map(() => Array(4).fill(""));
let grades = JSON.parse(localStorage.getItem('grades')) || [];
let username = localStorage.getItem('username') || "";
let memo = localStorage.getItem('memo') || "";

// HABITUDES (Liste personnalisable)
let habits = JSON.parse(localStorage.getItem('habits')) || [
    { id: 1, text: "Boire de l'eau 💧", done: false },
    { id: 2, text: "Lire 10 pages 📖", done: false }
];
let lastHabitDate = localStorage.getItem('lastHabitDate') || new Date().toDateString();

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    checkDailyReset();
    updateBudgetUI();
    updateTasksUI();
    loadScheduleUI();
    updateGradesUI();
    updateHabitsUI();
    document.getElementById('quick-memo').value = memo;
    updateNextEvent();
});

// --- HABIT TRACKER (PERSONNALISABLE) ---
function checkDailyReset() {
    const today = new Date().toDateString();
    if (lastHabitDate !== today) {
        habits.forEach(h => h.done = false);
        lastHabitDate = today;
        saveData();
    }
}

function addHabit() {
    const input = document.getElementById('new-habit-text');
    const text = input.value.trim();
    if (text === "") return;

    habits.push({ id: Date.now(), text: text, done: false });
    saveData();
    updateHabitsUI();
    input.value = ""; // Vider l'input
}

function deleteHabit(id) {
    if(confirm("Supprimer cette habitude ?")) {
        habits = habits.filter(h => h.id !== id);
        saveData();
        updateHabitsUI();
    }
}

function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
        habit.done = !habit.done;
        saveData();
        updateHabitsUI();
    }
}

function updateHabitsUI() {
    const list = document.getElementById('habits-list');
    list.innerHTML = "";
    habits.forEach(h => {
        const div = document.createElement('div');
        div.className = `habit-item ${h.done ? 'habit-done' : ''}`;
        
        // Structure: Zone cliquable (checkbox + texte) ET Bouton poubelle séparé
        div.innerHTML = `
            <div class="habit-content" onclick="toggleHabit(${h.id})">
                <input type="checkbox" ${h.done ? 'checked' : ''}>
                <span>${h.text}</span>
            </div>
            <button onclick="deleteHabit(${h.id})" class="delete-habit-btn">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        list.appendChild(div);
    });
}

// --- NEXT EVENT ---
function updateNextEvent() {
    const now = new Date();
    const currentDayJS = now.getDay();
    const currentHour = now.getHours();
    const eventDisplay = document.getElementById('next-event');

    if (currentDayJS === 0 || currentDayJS === 6) {
        eventDisplay.innerText = "C'est le Week-end ! 🎉";
        return;
    }

    const todayIndex = currentDayJS - 1;
    const todaySchedule = schedule[todayIndex];
    const slotEndHours = [10, 12, 16, 18];
    const slotNames = ["08h-10h", "10h-12h", "14h-16h", "16h-18h"];
    let foundEvent = "Rien de prévu auj. 💤";

    for (let i = 0; i < 4; i++) {
        if (todaySchedule[i] && todaySchedule[i].trim() !== "" && currentHour < slotEndHours[i]) {
            foundEvent = `${todaySchedule[i]} \n(${slotNames[i]})`;
            break;
        }
    }
    if (currentHour >= 18) foundEvent = "Journée terminée ! 🌙";
    eventDisplay.innerText = foundEvent;
}

// --- LOGIN ---
function checkLogin() {
    if (username) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-interface').style.display = 'flex';
        document.getElementById('display-username').innerText = username;
        document.getElementById('dashboard-username').innerText = username;
    } else {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-interface').style.display = 'none';
    }
}
function loginUser() {
    const input = document.getElementById('username-input').value;
    if (input.trim()) { username = input; localStorage.setItem('username', username); checkLogin(); }
}
function logoutUser() {
    if(confirm("Déconnexion ?")) { localStorage.removeItem('username'); location.reload(); }
}

// --- NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section', 'hidden'));
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('active-section');
    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
}

// --- SCHEDULE & MEMO ---
function loadScheduleUI() {
    document.querySelectorAll('.schedule-grid input').forEach(input => {
        const d = input.dataset.day, s = input.dataset.slot;
        if (schedule[d] && schedule[d][s]) input.value = schedule[d][s];
    });
}
function saveSchedule() {
    document.querySelectorAll('.schedule-grid input').forEach(input => {
        schedule[input.dataset.day][input.dataset.slot] = input.value;
    });
    localStorage.setItem('schedule', JSON.stringify(schedule));
    updateNextEvent();
}
function saveMemo() {
    const val = document.getElementById('quick-memo').value;
    localStorage.setItem('memo', val);
}

// --- GRADES ---
function addGrade() {
    const subj = document.getElementById('grade-subject').value;
    const val = parseFloat(document.getElementById('grade-value').value);
    const coef = parseFloat(document.getElementById('grade-coef').value) || 1;
    if(!subj || isNaN(val)) return alert("Infos manquantes !");
    grades.push({ id: Date.now(), subject: subj, value: val, coef: coef });
    saveData(); updateGradesUI();
    document.getElementById('grade-subject').value=""; document.getElementById('grade-value').value="";
}
function deleteGrade(id) { grades = grades.filter(g => g.id !== id); saveData(); updateGradesUI(); }
function updateGradesUI() {
    const list = document.getElementById('grades-list'); list.innerHTML = "";
    let pts = 0, cfs = 0;
    grades.forEach(g => {
        pts += g.value * g.coef; cfs += g.coef;
        list.innerHTML += `<li><span>${g.subject} <small>(x${g.coef})</small></span><span style="color:#3b82f6;font-weight:bold;">${g.value}/20</span><button onclick="deleteGrade(${g.id})" class="delete-btn"><i class="fa-solid fa-trash"></i></button></li>`;
    });
    const avg = cfs > 0 ? (pts / cfs).toFixed(2) : "--";
    document.getElementById('global-average').innerText = avg + "/20";
    document.getElementById('dashboard-average').innerText = avg + "/20";
}

// --- BUDGET ---
function addMoney() { processTx('income'); }
function removeMoney() { processTx('expense'); }
function processTx(type) {
    const name = document.getElementById('trans-name').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    if (!name || isNaN(amount)) return;
    transactions.push({ id: Date.now(), name, amount, type });
    saveData(); updateBudgetUI();
    document.getElementById('trans-name').value=""; document.getElementById('trans-amount').value="";
}
function deleteTransaction(id) { transactions = transactions.filter(t => t.id !== id); saveData(); updateBudgetUI(); }
function updateBudgetUI() {
    const list = document.getElementById('transaction-history'); list.innerHTML = "";
    let bal = 0, inc = 0, exp = 0;
    transactions.forEach(t => {
        if(t.type === 'income') { bal += t.amount; inc += t.amount; } else { bal -= t.amount; exp += t.amount; }
        const li = document.createElement('li');
        li.innerHTML = `<span>${t.name}</span><span class="${t.type==='income'?'text-green':'text-red'}">${t.type==='income'?'+':'-'} ${t.amount}€</span><button onclick="deleteTransaction(${t.id})" class="delete-btn"><i class="fa-solid fa-trash"></i></button>`;
        list.prepend(li);
    });
    document.getElementById('main-balance').innerText = bal.toFixed(2)+" €";
    document.getElementById('dashboard-balance').innerText = bal.toFixed(2)+" €";
    document.getElementById('total-income').innerText = "+"+inc.toFixed(2)+" €";
    document.getElementById('total-expense').innerText = "-"+exp.toFixed(2)+" €";
}

// --- TASKS & COMMON ---
function addTask() { 
    const txt = document.getElementById('new-task').value; 
    if(!txt) return; tasks.push({ id: Date.now(), text: txt }); saveData(); updateTasksUI(); 
    document.getElementById('new-task').value=""; 
}
function deleteTask(id) { tasks = tasks.filter(t => t.id !== id); saveData(); updateTasksUI(); }
function updateTasksUI() {
    const list = document.getElementById('todo-list'); list.innerHTML = "";
    tasks.forEach(t => list.innerHTML += `<li>${t.text} <button onclick="deleteTask(${t.id})" class="delete-btn"><i class="fa-solid fa-check"></i></button></li>`);
}
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('grades', JSON.stringify(grades));
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('lastHabitDate', lastHabitDate);
}

// --- TIMER ---
let timerInterval, timeLeft = 25 * 60;
function startTimer() {
    if(timerInterval) return;
    timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft/60), s = timeLeft%60;
        document.getElementById('timer').innerText = `${m}:${s<10?'0'+s:s}`;
        if(timeLeft<=0) { clearInterval(timerInterval); alert("Pause !"); }
    }, 1000);
}
function resetTimer() { clearInterval(timerInterval); timerInterval = null; timeLeft=25*60; document.getElementById('timer').innerText="25:00"; }