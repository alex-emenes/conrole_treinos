/*
 * Controle de Treino - script principal
 *
 * Este script fornece as funcionalidades para:
 *  - Registrar treinos com data, horário, exercício, séries, repetições, carga, descanso, RPE e observações.
 *  - Calcular automaticamente o volume (séries × repetições × carga) e a duração da sessão.
 *  - Salvar os registros em localStorage para persistência no navegador.
 *  - Listar e exibir as entradas salvas em uma tabela ordenada por data (mais recente primeiro).
 *  - Gerar um resumo com volume total por data e progresso de carga por exercício.
 *  - Exportar os dados para CSV e limpar todos os registros.
 */

// Chave usada no localStorage para armazenar os registros
const STORAGE_KEY = 'controleTreinoEntries';

/*
 * Conjunto padrão de entradas com base no plano de treino ABCDEF fornecido pelo usuário.
 * Essas entradas são carregadas automaticamente se não houver registros salvos.
 * Datas assumidas a partir de 2 de março de 2026 (segunda‑feira) em ordem A–F.
 * Carga (weight) é inicializada como 0 para que o usuário preencha posteriormente.
 */
const defaultEntries = [
  {"date":"2026-03-02","start":"18:00","end":"19:00","exercise":"Supino reto barra","sets":4,"reps":6,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pausa 1s no peito"},
  {"date":"2026-03-02","start":"18:00","end":"19:00","exercise":"Supino inclinado halter","sets":3,"reps":8,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Controle descida"},
  {"date":"2026-03-02","start":"18:00","end":"19:00","exercise":"Crucifixo cabo","sets":3,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Última drop"},
  {"date":"2026-03-02","start":"18:00","end":"19:00","exercise":"Paralelas","sets":3,"reps":10,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Peso se possível"},
  {"date":"2026-03-02","start":"18:00","end":"19:00","exercise":"Tríceps corda","sets":3,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Rest-pause"},
  {"date":"2026-03-02","start":"18:00","end":"19:00","exercise":"Tríceps overhead","sets":2,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Alongar"},
  {"date":"2026-03-03","start":"18:00","end":"19:00","exercise":"Barra fixa","sets":4,"reps":8,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Peso se possível"},
  {"date":"2026-03-03","start":"18:00","end":"19:00","exercise":"Remada curvada","sets":4,"reps":8,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Tronco firme"},
  {"date":"2026-03-03","start":"18:00","end":"19:00","exercise":"Puxada alta","sets":3,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Escápula"},
  {"date":"2026-03-03","start":"18:00","end":"19:00","exercise":"Remada baixa","sets":3,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Contração"},
  {"date":"2026-03-03","start":"18:00","end":"19:00","exercise":"Rosca barra","sets":3,"reps":8,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pesado"},
  {"date":"2026-03-03","start":"18:00","end":"19:00","exercise":"Rosca inclinada","sets":2,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Myo-reps"},
  {"date":"2026-03-04","start":"18:00","end":"19:00","exercise":"Agachamento","sets":4,"reps":6,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Profundo"},
  {"date":"2026-03-04","start":"18:00","end":"19:00","exercise":"Leg press","sets":3,"reps":10,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Sem travar"},
  {"date":"2026-03-04","start":"18:00","end":"19:00","exercise":"Hack / Front","sets":3,"reps":8,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Tensão"},
  {"date":"2026-03-04","start":"18:00","end":"19:00","exercise":"Extensora","sets":3,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Drop"},
  {"date":"2026-03-04","start":"18:00","end":"19:00","exercise":"Panturrilha pé","sets":4,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pausa topo"},
  {"date":"2026-03-05","start":"18:00","end":"19:00","exercise":"Desenvolvimento","sets":4,"reps":6,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pesado"},
  {"date":"2026-03-05","start":"18:00","end":"19:00","exercise":"Elevação lateral","sets":4,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Controle"},
  {"date":"2026-03-05","start":"18:00","end":"19:00","exercise":"Posterior máquina","sets":3,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Contração"},
  {"date":"2026-03-05","start":"18:00","end":"19:00","exercise":"Remada alta","sets":3,"reps":10,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Deltóide"},
  {"date":"2026-03-05","start":"18:00","end":"19:00","exercise":"Face pull","sets":2,"reps":20,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Saúde"},
  {"date":"2026-03-06","start":"18:00","end":"19:00","exercise":"Terra romeno","sets":4,"reps":8,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Alongar"},
  {"date":"2026-03-06","start":"18:00","end":"19:00","exercise":"Mesa flexora","sets":3,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Controle"},
  {"date":"2026-03-06","start":"18:00","end":"19:00","exercise":"Hip thrust","sets":4,"reps":10,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pausa topo"},
  {"date":"2026-03-06","start":"18:00","end":"19:00","exercise":"Flexora sentado","sets":2,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pump"},
  {"date":"2026-03-06","start":"18:00","end":"19:00","exercise":"Panturrilha sentado","sets":4,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Lento"},
  {"date":"2026-03-07","start":"18:00","end":"19:00","exercise":"Supino inclinado barra","sets":4,"reps":8,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pesado"},
  {"date":"2026-03-07","start":"18:00","end":"19:00","exercise":"Chest press","sets":3,"reps":10,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Estável"},
  {"date":"2026-03-07","start":"18:00","end":"19:00","exercise":"Fly low-to-high","sets":3,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Clavicular"},
  {"date":"2026-03-07","start":"18:00","end":"19:00","exercise":"Peck deck","sets":3,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Drop"},
  {"date":"2026-03-07","start":"18:00","end":"19:00","exercise":"Flexão carga","sets":2,"reps":12,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Pump"},
  {"date":"2026-03-07","start":"18:00","end":"19:00","exercise":"Crunch cabo","sets":3,"reps":15,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"Core"},
  {"date":"2026-03-07","start":"18:00","end":"19:00","exercise":"Prancha","sets":3,"reps":1,"weight":0,"volume":0,"rest":"","duration":"01:00","rpe":"","notes":"30–45s"}
];

// Carrega as entradas do localStorage
function loadEntries() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Erro ao parsear localStorage:', e);
    return [];
  }
}

// Salva as entradas no localStorage
function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Calcula o volume (séries × repetições × carga)
function calculateVolume(sets, reps, weight) {
  const s = parseFloat(sets);
  const r = parseFloat(reps);
  const w = parseFloat(weight);
  if (isNaN(s) || isNaN(r) || isNaN(w)) return 0;
  return s * r * w;
}

// Calcula a duração de uma sessão (HH:MM) a partir dos horários de início e fim
function calculateDuration(start, end) {
  if (!start || !end) return '';
  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);
  let diffMs = endDate - startDate;
  // Se o horário de fim for no dia seguinte (atravessou a meia-noite)
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Adiciona uma nova entrada ao array
function addEntry(entry) {
  const entries = loadEntries();
  entries.push(entry);
  // Ordena por data e início em ordem decrescente
  entries.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start}:00`);
    const dateB = new Date(`${b.date}T${b.start}:00`);
    return dateB - dateA;
  });
  saveEntries(entries);
  return entries;
}

// Converte uma entrada em array de valores para CSV
function entryToCsvRow(entry) {
  return [
    entry.date,
    entry.start,
    entry.end,
    entry.exercise,
    entry.sets,
    entry.reps,
    entry.weight,
    entry.volume,
    entry.rest,
    entry.duration,
    entry.rpe,
    entry.notes ? entry.notes.replace(/\n/g, ' ') : ''
  ];
}

// Gera CSV do array de entradas
function generateCsv(entries) {
  const header = [
    'Data',
    'Inicio',
    'Fim',
    'Exercicio',
    'Series',
    'Repeticoes',
    'Carga (kg)',
    'Volume',
    'Descanso (s)',
    'Duracao',
    'RPE',
    'Observacoes'
  ];
  const rows = entries.map(entryToCsvRow);
  const csvLines = [header.join(','), ...rows.map(r => r.join(','))];
  return csvLines.join('\n');
}

// Atualiza a tabela de entradas na página
function renderEntriesTable(entries) {
  const tbody = document.getElementById('entries-body');
  tbody.innerHTML = '';
  entries.forEach((entry) => {
    const tr = document.createElement('tr');
    const columns = [
      entry.date,
      entry.start,
      entry.end,
      entry.exercise,
      entry.sets,
      entry.reps,
      entry.weight,
      entry.volume,
      entry.rest || '',
      entry.duration || '',
      entry.rpe || '',
      entry.notes || ''
    ];
    columns.forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// Cria um resumo com volume por data e progressão por exercício
function renderSummary(entries) {
  const summaryDiv = document.getElementById('summary');
  // Apaga conteúdo anterior
  summaryDiv.innerHTML = '';
  if (!entries || entries.length === 0) {
    summaryDiv.textContent = 'Nenhum registro salvo.';
    return;
  }
  // Volume total por data
  const volumeByDate = {};
  // Progressão por exercício: {exercise: {max: weight, last: weight}}
  const progressByExercise = {};
  entries.forEach((entry) => {
    // Volume por data
    const date = entry.date;
    const vol = parseFloat(entry.volume) || 0;
    volumeByDate[date] = (volumeByDate[date] || 0) + vol;
    // Progressão por exercício
    const ex = entry.exercise;
    const w = parseFloat(entry.weight);
    if (!progressByExercise[ex]) {
      progressByExercise[ex] = { max: w, last: w, lastDate: entry.date };
    } else {
      // Atualiza carga máxima se necessário
      if (w > progressByExercise[ex].max) progressByExercise[ex].max = w;
      // Atualiza a última carga com base na data
      // Como a lista está ordenada de mais recente para mais antiga, o primeiro registro encontrado é o mais recente
      if (entry.date >= progressByExercise[ex].lastDate) {
        progressByExercise[ex].last = w;
        progressByExercise[ex].lastDate = entry.date;
      }
    }
  });
  // Cria HTML para volume por data
  const volumeSection = document.createElement('div');
  const volumeTitle = document.createElement('h3');
  volumeTitle.textContent = 'Volume por data';
  volumeSection.appendChild(volumeTitle);
  const volTable = document.createElement('table');
  volTable.classList.add('summary-table');
  const volThead = document.createElement('thead');
  volThead.innerHTML = '<tr><th>Data</th><th>Volume total</th></tr>';
  volTable.appendChild(volThead);
  const volTbody = document.createElement('tbody');
  // Ordena datas ascendente para exibir cronologicamente
  Object.keys(volumeByDate)
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach((date) => {
      const tr = document.createElement('tr');
      const tdDate = document.createElement('td');
      tdDate.textContent = date;
      const tdVol = document.createElement('td');
      tdVol.textContent = volumeByDate[date].toFixed(2);
      tr.appendChild(tdDate);
      tr.appendChild(tdVol);
      volTbody.appendChild(tr);
    });
  volTable.appendChild(volTbody);
  volumeSection.appendChild(volTable);

  // Cria HTML para progressão por exercício
  const progressSection = document.createElement('div');
  const progressTitle = document.createElement('h3');
  progressTitle.textContent = 'Progresso por exercício';
  progressSection.appendChild(progressTitle);
  const progTable = document.createElement('table');
  progTable.classList.add('summary-table');
  progTable.innerHTML = '<thead><tr><th>Exercício</th><th>Carga máxima</th><th>Última carga</th></tr></thead>';
  const progTbody = document.createElement('tbody');
  Object.keys(progressByExercise).forEach((ex) => {
    const tr = document.createElement('tr');
    const tdEx = document.createElement('td');
    tdEx.textContent = ex;
    const tdMax = document.createElement('td');
    tdMax.textContent = progressByExercise[ex].max.toFixed(2);
    const tdLast = document.createElement('td');
    tdLast.textContent = progressByExercise[ex].last.toFixed(2);
    tr.appendChild(tdEx);
    tr.appendChild(tdMax);
    tr.appendChild(tdLast);
    progTbody.appendChild(tr);
  });
  progTable.appendChild(progTbody);
  progressSection.appendChild(progTable);

  // Adiciona seções ao resumo
  summaryDiv.appendChild(volumeSection);
  summaryDiv.appendChild(progressSection);
}

// Inicialização do aplicativo
function init() {
  // Carrega entradas existentes
  let entries = loadEntries();
  // Se não houver entradas, popula com o plano padrão
  if (!entries || entries.length === 0) {
    entries = defaultEntries.map((e) => ({ ...e }));
    // Computa o volume e salva
    entries = entries.map((entry) => {
      const vol = calculateVolume(entry.sets, entry.reps, entry.weight);
      return { ...entry, volume: vol.toFixed(2) };
    });
    saveEntries(entries);
  }
  renderEntriesTable(entries);
  renderSummary(entries);

  // Manipula envio do formulário
  const form = document.getElementById('workout-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const exercise = document.getElementById('exercise').value.trim();
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value;
    const rest = document.getElementById('rest').value;
    const rpe = document.getElementById('rpe').value;
    const notes = document.getElementById('notes').value.trim();
    // Validação básica
    if (!date || !start || !end || !exercise || !sets || !reps || !weight) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    // Calcula volume e duração
    const volume = calculateVolume(sets, reps, weight);
    const duration = calculateDuration(start, end);
    const entry = {
      date,
      start,
      end,
      exercise,
      sets: parseInt(sets, 10),
      reps: parseInt(reps, 10),
      weight: parseFloat(weight),
      volume: volume.toFixed(2),
      rest: rest ? parseInt(rest, 10) : '',
      duration,
      rpe: rpe ? parseInt(rpe, 10) : '',
      notes
    };
    const updated = addEntry(entry);
    renderEntriesTable(updated);
    renderSummary(updated);
    form.reset();
  });

  // Botão para baixar CSV
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', function () {
    const entries = loadEntries();
    if (!entries || entries.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    const csv = generateCsv(entries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `treinos_${timestamp}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Botão para limpar dados
  const clearBtn = document.getElementById('clear-btn');
  clearBtn.addEventListener('click', function () {
    if (confirm('Tem certeza de que deseja apagar todos os registros?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderEntriesTable([]);
      renderSummary([]);
    }
  });
}

// Executa a função de inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);