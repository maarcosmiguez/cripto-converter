// GLOBALS

const $ = {};
const search = {
  currency: [],
};

const API_KEY = "004ed04be319e56d8ffeb80f1c51267caccc548a";
const API_KEY_ALT = "f008d28043f1754f9f6952ab362208569dfb2bab"
const API_URL = "https://api.getgeoapi.com/v2/currency";
const CRIPTO_URL = "https://api.coinpaprika.com/v1/coins";

init();

function init() {
  initApp();
  dom();
  events();
  today();
  hideChart();
}

function initApp() {
  window.addEventListener("DOMContentLoaded", (event) => {
    const mainNav = document.body.querySelector("#mainNav");
    if (mainNav) {
      new bootstrap.ScrollSpy(document.body, {
        target: "#mainNav",
        offset: 74,
      });
    }

    const navbarToggler = document.body.querySelector(".navbar-toggler");
    const responsiveNavItems = [].slice.call(document.querySelectorAll("#navbarResponsive .nav-link"));
    responsiveNavItems.map(function (responsiveNavItem) {
      responsiveNavItem.addEventListener("click", () => {
        if (window.getComputedStyle(navbarToggler).display !== "none") {
          navbarToggler.click();
        }
      });
    });
  });
}

function dom() {
  $.form = document.querySelector("#converter");
  $.chart = document.querySelector("#chart")
  $.amount = document.querySelector("#amount");
  $.submitBt = document.querySelector("#submit-bt");
  $.sCurrency = document.querySelector("#s-currency");
  $.fCurrency = document.querySelector("#f-currency");
  $.date = document.querySelector("#date");
  $.btnchart = $.chart.querySelector("button");
  $.btnclose = document.querySelector(".btn-close");
  $.ctchart = $.chart.querySelector(".ct-chart");
  $.tchart = $.chart.querySelector(".t-chart");
  $.myCripto = document.querySelector(".myCripto");
  $.show = document.querySelector(".shows");

  $.result = document.querySelector("#result");
  $.loading = document.querySelector("#loading");
  $.error = document.querySelector("#error");
}

function events() {
  $.form.addEventListener("submit", submit);
  $.chart.addEventListener("click", chartData);
  $.btnclose.addEventListener("click", closeChart);
  $.btnchart.addEventListener("click", btCloseChart);
  $.btnchart.addEventListener("click", showChart);
}



function today() {
  var date = new Date();
  var month = date.getMonth() + 1; 
  var day = date.getDate(); 
  var year = date.getFullYear(); 
  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month; 
  $.date.value = year + "-" + month + "-" + day;
}

const notLoading = () => {
  $.loading.classList.add("hide");
  $.loading.classList.remove("d-flex", "justify-content-center")
  $.submitBt.removeAttribute("disabled");
  $.sCurrency.removeAttribute("disabled");
  $.fCurrency.removeAttribute("disabled");
};

const loading = function () {
  $.loading.classList.remove("hide");
  $.loading.classList.add("d-flex", "justify-content-center")
  $.submitBt.setAttribute("disabled", "true");
  $.sCurrency.setAttribute("disabled", "true");
  $.fCurrency.setAttribute("disabled", "true");
};

function hideChart(){
  $.chart.classList.add("hide");
  $.ctchart.classList.add("hide");
  $.tchart.classList.add("light-text");
  $.show.innerHTML = "will show";
}

function showChart(){
  $.chart.classList.remove("hide");
  $.ctchart.classList.remove("hide");
  $.tchart.classList.remove("light-text");
  $.show.innerHTML = "shows"
}

function btCloseChart(){
  $.btnclose.classList.remove("hide"); 
  $.btnchart.classList.add("hide");
  showChart();
}

function closeChart(){
  $.ctchart.classList.add("hide");
  $.btnclose.classList.add("hide"); 
  $.tchart.classList.add("light-text");
  $.show.innerHTML = "will show"
}

function error(m) {
  $.error.innerHTML = `
  <div class="alert alert-danger d-flex align-items-center" role="alert">
  <i class="bi bi-exclamation-circle-fill"></i>
    ${m}
  </div>
</div>`;
$.result.classList.add("hide");
}

function noError() {
  $.error.innerHTML = "";
  $.result.classList.remove("hide");
  hideChart();
}

function submit(e) {
  e.preventDefault();
  noError();
  loading();
  values();
  updateInfo();
}

function updateInfo(){
  $.ctchart.classList.add("hide");
  $.tchart.classList.add("light-text");
  $.myCripto.innerHTML = search.currency.f.toUpperCase();
  $.show.innerHTML = "will show"
}

function values() {
  const amount = $.amount.value;
  const s = $.sCurrency.value;
  const f = $.fCurrency.value;
  const date = $.date.value;

  search.currency = {
    amount: amount,
    s: s,
    f: f,
    date: date,
  };
  
  checks();

  Promise.all([APIconvert(), APIcripto()]).then(AJAXData).catch(mainError).finally(notLoading);
}

function mainError(){
  $.error.innerHTML = `
  <div class="alert alert-danger d-flex align-items-center" role="alert">
  <i class="bi bi-exclamation-circle-fill"></i>
    Please complete all fields correctly.
  </div>
</div>`;
  $.result.classList.add("hide");
}

function checks() {
  if (search.currency.amount === "") {
    error("Write an amount");
    $.result.classList.add("hide");
    notLoading();
    hideChart();
    return;
  }
  else if (search.currency.amount == 0) {
  error("We can not convert an inexistent amount, dude");
  $.result.classList.add("hide");
  notLoading();
  hideChart();
  return;
}
}

function AJAXData(data) {
  pushConverted(data);
}

function APIconvert() {
  const historicoUrl = `${API_URL}/historical/${search.currency.date}`;
  const historicoParams = {
    api_key: API_KEY,
    from: "USD",
    to: search.currency.s,
    amount: search.currency.amount,
  };

  return fetch(buildUrl(historicoUrl, historicoParams)).then(apiToJson);
}

function APIcripto() {
  const myDate = restar5Dias(search.currency.date);
  const coin_id = search.currency.f;
  const coinpaprikaUrl = `https://api.coinpaprika.com/v1/coins/${coin_id}/ohlcv/historical`;
  const coinpaprikaParams = {
    start: myDate,
    end: search.currency.date,
    quote: "usd",
  };
  return fetch(buildUrl(coinpaprikaUrl, coinpaprikaParams)).then(apiToJson);
}

function chartData(evento) {
  evento.preventDefault();
  values();
  const myDate2 = restar5Dias(search.currency.date);

  fetch (`https://api.coinpaprika.com/v1/coins/${search.currency.f}/ohlcv/historical?start=${myDate2}&end=${search.currency.date}`)
      .then(apiToJson)
      .then(pushChart)
}

function restar5Dias(fecha) {
  const dateUsuario = new Date(fecha);
  dateUsuario.setDate(dateUsuario.getDate() - 5);
  const fechaFromateada = formatearFecha(dateUsuario);
  return fechaFromateada;
}

function formatearFecha(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var formatedMonth = `${month}`.padStart(2, "0");
  var formatedDay = day.toString().padStart(2, "0");

  return `${year}-${formatedMonth}-${formatedDay}`;
}

function obtenerDiaDeFecha(objDia) {
  const date = objDia.time_close.split("T")[0];
  const dateDay = date.split("-")[2];
  return dateDay
}

function obtenerCloseAndRound(objDia) {
    return Math.round(objDia.close);
}

function pushChart(dataApi) {

  const dataLabels = dataApi.map(obtenerDiaDeFecha);
  const closeData = dataApi.map(obtenerCloseAndRound);

 var datos = {
    labels: dataLabels,
    series: [closeData],
  };

  new Chartist.Line(".ct-chart", datos);
}

function pushConverted(dataApi) {
  const currencyData = dataApi[0];
  const criptoData = dataApi[1];
  const dia = criptoData.length - 1;
  const diaActual = criptoData[dia];
  caclAmount(diaActual, currencyData.rates[search.currency.s]);
}

function caclAmount(datoCripto, datoCurrent) {
  const preR = datoCripto.close * datoCurrent.rate * search.currency.amount;
  const finalResult = preR.toFixed(2);
  let criptoSplit = search.currency.f.split("-");
  let criptoPop = criptoSplit.shift();
  const criptoF = criptoPop.toUpperCase();
  const dataS = `${search.currency.amount} ${criptoF}`;
  const dataF = `${finalResult} ${search.currency.s}`;

  $.result.innerHTML = `
  <h4 class="font-alt text-secondary">${dataS} = ${dataF}</h4>
  `;
  $.result.classList.add("card", "card-body");
  showBtChart();
}

function showBtChart(){
  $.btnchart.classList.remove("hide");
  $.chart.classList.remove("hide");
}

function getCurrencies() {
  loading();

  fetch(`${API_URL}/list?api_key=${API_KEY}`).then(apiToJson).then(pushCurrencies).catch(error).finally(notLoading);
}

function getCriptos() {
  fetch(CRIPTO_URL).then(apiToJson).then(pushCriptos).catch(error);
}

function pushCurrencies(dataApi) {
  const monedasNoSort = Object.keys(dataApi.currencies);
  const monedas = monedasNoSort.sort();
  let optionsHtml = "<option selected disabled>Choose your currency</option>";
  for (let monedaId of monedas) {
    optionsHtml += `<option value="${monedaId}">${dataApi.currencies[monedaId]}</option>`;
  }

  $.sCurrency.innerHTML = optionsHtml;
}

function pushCriptos(dataApi) {
  const criptos = dataApi.splice(0, 20);
  let optionsHtml = "<option selected disabled>Choose your cryptocurrency</option>";
  criptos.forEach((cripto) => {
    optionsHtml += `<option value="${cripto.id}">${cripto.name}</option>`;
  });

  $.fCurrency.innerHTML = optionsHtml;
}

getCurrencies();
getCriptos();