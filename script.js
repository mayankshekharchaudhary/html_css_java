/* =========================================================
   THEME
========================================================= */
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const knob = document.getElementById('themeKnob');
  if(knob) knob.textContent = theme === 'light' ? '☀️' : '🌙';
  try{ localStorage.setItem('cea-theme', theme); }catch(e){}
  if(window._energyChart){ updateChartTheme(); }
}
(function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem('cea-theme'); }catch(e){}
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(saved || (prefersLight ? 'light' : 'dark'));
})();

document.addEventListener('click', function(e){
  if(e.target && e.target.closest && e.target.closest('#themeToggle')){
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
  }
});

/* =========================================================
   INTRO SPLASH -> LOGIN
========================================================= */
window.addEventListener('load', function(){
  const splash = document.getElementById('introSplash');
  const login = document.getElementById('loginScreen');

  requestAnimationFrame(()=> splash.classList.add('playing'));

  setTimeout(function(){
    splash.classList.add('leaving');
    login.classList.add('visible');
    setTimeout(()=> splash.remove(), 650);
  }, 2200);
});

/* =========================================================
   LOGIN
========================================================= */
document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  const errorBox = document.getElementById('loginError');
  const card = document.querySelector('.login-card');

  if(!email || !pass){
    errorBox.classList.add('show');
    card.classList.remove('login-shake');
    void card.offsetWidth;
    card.classList.add('login-shake');
    return;
  }

  errorBox.classList.remove('show');
  const loginScreen = document.getElementById('loginScreen');
  loginScreen.classList.remove('visible');

  setTimeout(function(){
    loginScreen.classList.add('hidden');
    document.getElementById('app').classList.add('visible');
    initChart();
  }, 500);
});

document.getElementById('logoutBtn').addEventListener('click', function(){
  document.getElementById('app').classList.remove('visible');
  document.getElementById('loginScreen').classList.remove('hidden');
  requestAnimationFrame(()=> document.getElementById('loginScreen').classList.add('visible'));
  document.getElementById('loginForm').reset();
});

/* =========================================================
   DASHBOARD LOGIC
========================================================= */
function openDashboard(){
  document.getElementById('dashboard').scrollIntoView({ behavior:'smooth' });
}

const hours = ["12 AM","1 AM","2 AM","3 AM","4 AM","5 AM","6 AM","7 AM","8 AM","9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM"];
const actualEnergy = [105,98,92,88,82,75,73,81,78,96,112,135,160,178,214,195,165,120,95,90,125,155,132,110];
const expectedEnergy = [100,96,91,86,80,76,74,78,82,92,105,120,138,150,158,152,135,115,98,94,108,120,115,105];
const anomalyIndexes = [11,14,20]; // 11 AM, 2 PM, 9 PM

function themeColors(){
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    grid: light ? '#e1e9ee' : '#122b3c',
    text: light ? '#425a68' : '#8194a2',
    actual: light ? '#1c72e0' : '#2e9cff',
    expected: light ? '#00a884' : '#00e6b0',
    anomaly: light ? '#d92c48' : '#ff3e5c'
  };
}

function initChart(){
  const ctx = document.getElementById('energyCanvas');
  if(!ctx || window._energyChart) return;
  const c = themeColors();

  window._energyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        {
          label:'Actual',
          data:actualEnergy,
          borderColor:c.actual,
          backgroundColor:c.actual,
          pointRadius:3,
          tension:0.35,
          borderWidth:2
        },
        {
          label:'Expected',
          data:expectedEnergy,
          borderColor:c.expected,
          backgroundColor:c.expected,
          borderDash:[6,4],
          pointRadius:0,
          tension:0.35,
          borderWidth:2
        },
        {
          label:'Anomaly',
          data:actualEnergy.map((v,i)=> anomalyIndexes.includes(i) ? v : null),
          borderColor:c.anomaly,
          backgroundColor:c.anomaly,
          pointRadius:6,
          pointHoverRadius:7,
          showLine:false
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ color:c.grid }, ticks:{ color:c.text, maxTicksLimit:8 } },
        y:{ grid:{ color:c.grid }, ticks:{ color:c.text }, title:{ display:true, text:'Energy Usage (kWh)', color:c.text } }
      }
    }
  });
}

function updateChartTheme(){
  const c = themeColors();
  const chart = window._energyChart;
  chart.data.datasets[0].borderColor = c.actual;
  chart.data.datasets[0].backgroundColor = c.actual;
  chart.data.datasets[1].borderColor = c.expected;
  chart.data.datasets[1].backgroundColor = c.expected;
  chart.data.datasets[2].borderColor = c.anomaly;
  chart.data.datasets[2].backgroundColor = c.anomaly;
  chart.options.scales.x.grid.color = c.grid;
  chart.options.scales.x.ticks.color = c.text;
  chart.options.scales.y.grid.color = c.grid;
  chart.options.scales.y.ticks.color = c.text;
  chart.options.scales.y.title.color = c.text;
  chart.update();
}

const buildingData = {
  all:{ waste:"1,248", anomalies:"12", peak:"2:00 PM" },
  academic:{ waste:"412", anomalies:"4", peak:"1:00 PM" },
  hostel:{ waste:"348", anomalies:"3", peak:"9:00 PM" },
  library:{ waste:"276", anomalies:"2", peak:"6:00 PM" },
  lab:{ waste:"198", anomalies:"2", peak:"2:00 PM" },
  sports:{ waste:"142", anomalies:"1", peak:"5:00 PM" }
};

function changeBuilding(){
  const selected = document.getElementById('buildingSelect').value;
  const data = buildingData[selected];
  document.getElementById('wasteValue').textContent = data.waste;
  document.getElementById('anomalyValue').textContent = data.anomalies;
  document.getElementById('peakValue').textContent = data.peak;
}

/* NAV ACTIVE STATE */
const sections = document.querySelectorAll('#app section');
const navLinks = document.querySelectorAll('#app nav a');
window.addEventListener('scroll', function(){
  let current = '';
  sections.forEach(function(section){
    const sectionTop = section.offsetTop - 120;
    if(window.scrollY >= sectionTop) current = section.getAttribute('id');
  });
  navLinks.forEach(function(link){
    link.classList.remove('active');
    if(link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});