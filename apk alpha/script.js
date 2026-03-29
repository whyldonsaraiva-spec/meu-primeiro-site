// --- CONFIGURAÇÃO INICIAL ---

// Referências para os elementos do HTML
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');

// Nossa lista de tarefas (Carrega do navegador se já existir algo salvo)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Variável para guardar a referência ao nosso gráfico
let progressChart;

// --- FUNÇÕES DE LÓGICA ---

// 1. Função para adicionar uma tarefa
function addTask() {
  const text = taskInput.value.trim();
  
  if (text !== "") {
    const newTask = {
      id: Date.now(), // Usamos o tempo atual como um ID único
      text: text,
      completed: false
    };

    tasks.push(newTask);
    taskInput.value = ""; // Limpa o campo de texto
    
    saveAndRender();
  } else {
    alert("Por favor, digite uma tarefa!");
  }
}

// 2. Função para marcar tarefa como feita
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  
  saveAndRender();
}

// 3. Função para deletar uma tarefa
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveAndRender();
}

// 4. Salvar as tarefas no navegador e atualizar a tela
function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
  updateChart();
  updateCounters();
}

// 5. Mostrar as tarefas na tela
function renderTasks() {
  taskList.innerHTML = "";
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.onclick = () => toggleTask(task.id);
    
    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
      <span>${task.text}</span>
      <button class="delete-btn" onclick="event.stopPropagation(); deleteTask(${task.id})">🗑️</button>
    `;
    
    taskList.appendChild(li);
  });
}

// 6. Atualizar os números do resumo
function updateCounters() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  
  totalTasksSpan.textContent = total;
  completedTasksSpan.textContent = completed;
}

// --- CONFIGURAÇÃO DO GRÁFICO (Chart.js) ---

function updateChart() {
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Se o gráfico ainda não foi criado, criamos ele. 
  // Se já existir, apenas atualizamos os dados.
  if (!progressChart) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
      type: 'doughnut', // Estilo de "rosquinha" (donut)
      data: {
        labels: ['Pendentes', 'Concluídas'],
        datasets: [{
          data: [pendingCount, completedCount],
          backgroundColor: ['#e9ecef', '#2ecc71'], // Cores do gráfico
          hoverOffset: 4,
          borderWidth: 0
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Outfit', size: 14 } }
          }
        },
        cutout: '70%', // Espaço no meio da rosquinha
        responsive: true,
        maintainAspectRatio: false
      }
    });
  } else {
    // Se já tiver gráfico, só mudamos os números dele
    progressChart.data.datasets[0].data = [pendingCount, completedCount];
    progressChart.update();
  }
}

// --- EVENTOS ---

// Quando o botão de adicionar é clicado
addTaskBtn.addEventListener('click', addTask);

// Quando a tecla "Enter" é apertada
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

// Inicialização (Ao carregar o site pela primeira vez)
saveAndRender();
