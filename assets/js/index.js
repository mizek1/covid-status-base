const api = axios.create({
  baseURL: 'https://api.covid19api.com',
});

function formatNumber(number) {
  return number.toLocaleString('pt');
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

async function getSummary() {
  try {
    const res = await api.get('/summary');
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

function buildKPIs(confirmed, death, recovered, date) {
  document.getElementById('confirmed').innerText = formatNumber(confirmed);
  document.getElementById('death').innerText = formatNumber(death);
  document.getElementById('recovered').innerText = formatNumber(recovered);
  document.getElementById(
    'date'
  ).innerText = `Data de atualização: ${formatDate(date)}`;
}

function buildPieChart(confirmed, death, recovered) {
  const data = {
    labels: ['Confirmados', 'Recuperados', 'Mortes'],
    datasets: [
      {
        data: [confirmed, recovered, death],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
        ],
        hoverOffset: 4,
      },
    ],
  };

  const config = {
    type: 'pie',
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Distribuição de novos casos',
        },
      },
    },
  };

  new Chart(document.getElementById('pizza'), config);
}

function buildBarChart(APIdata) {
  const top10DeathsByCountry = _.reverse(
    _.sortBy(APIdata, ['TotalDeaths'])
  ).slice(0, 10);

  const data = {
    labels: _.map(top10DeathsByCountry, 'Country'),
    datasets: [
      {
        label: 'Total de mortes',
        data: _.map(top10DeathsByCountry, 'TotalDeaths'),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Total de mortes por país',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  new Chart(document.getElementById('barras'), config);
}

async function loadInitialData() {
  const data = await getSummary();
  const {
    TotalConfirmed,
    TotalDeaths,
    TotalRecovered,
    Date: LastUpdate,
    NewConfirmed,
    NewDeaths,
    NewRecovered,
  } = data.Global;
  buildKPIs(TotalConfirmed, TotalDeaths, TotalRecovered, LastUpdate);
  buildPieChart(NewConfirmed, NewDeaths, NewRecovered);
  buildBarChart(data.Countries);
}

loadInitialData();
