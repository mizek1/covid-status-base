const api = axios.create({
  baseURL: 'https://api.covid19api.com',
});

var chart = new Chart(document.getElementById('linhas'), {});

function formatNumber(number) {
  return number.toLocaleString('pt');
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

function formatDateToDisplay(date) {
  let data = new Date(date);
  data.setDate(data.getDate() + 1);
  let dataFormatted =
    data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();
  return dataFormatted;
}

async function getCountries() {
  try {
    const res = await api.get('/countries');
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

async function getDataByCountry(country, status, dateStart, dateEnd) {
  try {
    dateStart = new Date(dateStart);
    dateStart.setDate(dateStart.getDate() - 1);
    const res = await api.get(
      `/country/${country}/status/${status}?from=${dateStart.toISOString()}&to=${dateEnd.toISOString()}`
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
}

async function getTotalByCountry(country) {
  try {
    const res = await api.get(`total/country/${country}`);
    return _.last(res.data);
  } catch (error) {
    console.error(error);
  }
}

function buildGraphic(array, label, color) {
  chart.destroy();

  const labels = _.map(array, 'date');
  const data = {
    labels: labels,
    datasets: [
      {
        label,
        data: _.map(array, 'cases'),
        fill: false,
        borderColor: color,
        tension: 0,
      },
      {
        label: 'Média',
        data: _.map(array, 'avg'),
        fill: false,
        borderColor: '#4a148c',
        tension: 0,
      },
    ],
  };
  const config = {
    type: 'line',
    data: data,
  };

  chart = new Chart(document.getElementById('linhas'), config);
}

function buildKPIs(confirmed, deaths, recovered) {
  document.getElementById('kpiconfirmed').innerText = formatNumber(confirmed);
  document.getElementById('kpideaths').innerText = formatNumber(deaths);
  document.getElementById('kpirecovered').innerText = formatNumber(recovered);
}

async function applyFilters() {
  const dateStart = new Date(document.getElementById('date_start').value);
  const dateEnd = new Date(document.getElementById('date_end').value);
  const status = document.getElementById('selType').value.toLowerCase();
  const country = document.getElementById('cmbCountry').value;
  const data = await getDataByCountry(country, status, dateStart, dateEnd);
  var dataGraphic = [];
  data.forEach((_, index) => {
    if (data[index + 1] === undefined) return;
    dataGraphic.push({
      date: formatDateToDisplay(data[index + 1].Date),
      cases: data[index + 1].Cases - data[index].Cases,
    });
  });
  const avg =
    _.reduce(
      _.map(dataGraphic, 'cases'),
      function (sum, n) {
        return sum + n;
      },
      0
    ) / dataGraphic.length;
  const { Confirmed, Deaths, Recovered } = await getTotalByCountry(country);
  dataGraphic = dataGraphic.map((element) => {
    return (element = { ...element, avg });
  });
  buildKPIs(Confirmed, Deaths, Recovered);
  if (status == 'confirmed')
    buildGraphic(dataGraphic, 'Casos confirmados', '#FFC300');
  if (status == 'deaths')
    buildGraphic(dataGraphic, 'Número de mortes', '#F44336');
  if (status == 'recovered')
    buildGraphic(dataGraphic, 'Recuperados', '#03A9F4');
}

async function loadInitialData() {
  const countries = await getCountries();
  for (country of _.sortBy(countries, 'Country')) {
    var option = document.createElement('option');
    option.text = country.Country;
    option.value = country.Slug;
    document.getElementById('cmbCountry').appendChild(option);
  }
  document.getElementById('filtro').addEventListener('click', applyFilters);
}

loadInitialData();
