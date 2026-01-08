// --- CHARGEMENT DES DONNÉES ---
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
// Emploi du temps : tableau de 5 jours, avec 4 créneaux chacun
let schedule = JSON.parse(localStorage.getItem('schedule')) || Array(5).fill().map(() => Array(4).fill(""));
let username = localStorage.getItem('username') || "";

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    updateBudgetUI();
    updateTasksUI();
    loadScheduleUI();
});

// --- SYSTÈME DE COMPTE (Login) ---
function checkLogin() {
    if (username) {
        // Si utilisateur déjà connecté
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-interface').style.display = 'flex';
        updateUserDisplay();
    } else {
        // Sinon afficher écran de connexion
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app-interface').style.display = 'none';
    }
}

function loginUser() {
    const input = document.getElementById('username-input').value;
    if (input.trim() !== "") {
        username = input;
        localStorage.setItem('username', username);
        checkLogin();
    }
}

function logoutUser() {
    if(confirm("Se déconnecter ?")) {
        localStorage.removeItem('username');
        username = "";
        location.reload(); // Recharge la page
    }
}

function updateUserDisplay() {
    document.getElementById('display-username').innerText = username;
    document.getElementById('dashboard-username').innerText = username;
}

// --- NAVIGATION ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active-section'));
    document.getElementById(sectionId).classList.remove('hidden');
    document.getElementById(sectionId).classList.add('active-section');
    
    // Menu active state (visuel simple)
    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
}

// --- EMPLOI DU TEMPS (NOUVEAU) ---
function loadScheduleUI() {
    // On remplit les inputs avec les données sauvegardées
    const inputs = document.querySelectorAll('.schedule-grid input');
    inputs.forEach(input => {
        const day = input.dataset.day;
        const slot = input.dataset.slot;
        if (schedule[day] && schedule[day][slot]) {
            input.value = schedule[day][slot];
        }
    });
}

function saveSchedule() {
    // On récupère toutes les valeurs des inputs
    const inputs = document.querySelectorAll('.schedule-grid input');
    inputs.forEach(input => {
        const day = input.dataset.day;
        const slot = input.dataset.slot;
        schedule[day][slot] = input.value;
    });
    
    localStorage.setItem('schedule', JSON.stringify(schedule));
    
    // Bonus : Mettre à jour le "Prochain Cours" sur l'accueil (Simulé simple)
    // Prend le premier cours rempli du lundi pour l'exemple
    const next = schedule[0][0] || "Aucun";
    document.getElementById('next-course').innerText = next;
}

// --- BUDGET ---
function addMoney() { processTransaction('income'); }
function removeMoney() { processTransaction('expense'); }

function processTransaction(type) {
    const name = document.getElementById('trans-name').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    if (name === "" || isNaN(amount)) return;

    transactions.push({ id: Date.now(), name, amount, type });
    saveData();
    updateBudgetUI();
    document.getElementById('trans-name').value = "";
    document.getElementById('trans-amount').value = "";
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateBudgetUI();
}

function updateBudgetUI() {
    const list = document.getElementById('transaction-history');
    list.innerHTML = "";
    let bal = 0, inc = 0, exp = 0;

    transactions.forEach(t => {
        if (t.type === 'income') { bal += t.amount; inc += t.amount; }
        else { bal -= t.amount; exp += t.amount; }

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${t.name}</span>
            <span class="${t.type === 'income' ? 'text-green' : 'text-red'}">
                ${t.type === 'income' ? '+' : '-'} ${t.amount} €
            </span>
            <button onclick="deleteTransaction(${t.id})" class="delete-btn"><i class="fa-solid fa-trash"></i></button>
        `;
        list.prepend(li);
    });

    document.getElementById('main-balance').innerText = bal.toFixed(2) + " €";
    document.getElementById('dashboard-balance').innerText = bal.toFixed(2) + " €";
    document.getElementById('total-income').innerText = "+" + inc.toFixed(2) + " €";
    document.getElementById('total-expense').innerText = "-" + exp.toFixed(2) + " €";
}

// --- TÂCHES ---
function addTask() {
    const txt = document.getElementById('new-task').value;
    if (txt === "") return;
    tasks.push({ id: Date.now(), text: txt });
    saveData();
    updateTasksUI();
    document.getElementById('new-task').value = "";
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
    updateTasksUI();
}

function updateTasksUI() {
    const list = document.getElementById('todo-list');
    list.innerHTML = "";
    tasks.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `${t.text} <button onclick="deleteTask(${t.id})" class="delete-btn"><i class="fa-solid fa-check"></i></button>`;
        list.appendChild(li);
    });
    document.getElementById('pending-tasks').innerText = tasks.length;
}

// --- DATA & TIMER ---
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

let timerInterval, timeLeft = 25 * 60;
function startTimer() {
    if(timerInterval) return;
    timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft / 60), s = timeLeft % 60;
        document.getElementById('timer').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        if(timeLeft <= 0) { clearInterval(timerInterval); alert("Pause !"); }
    }, 1000);
}
function resetTimer() {
    clearInterval(timerInterval); timerInterval = null; timeLeft = 25 * 60;
    document.getElementById('timer').innerText = "25:00";
}