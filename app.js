"use strict";

const QUICK_CITIES = [
  { name: "上海", admin1: "上海市", country: "中国", latitude: 31.22222, longitude: 121.45806, timezone: "Asia/Shanghai" },
  { name: "北京", admin1: "北京市", country: "中国", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai" },
  { name: "成都", admin1: "四川省", country: "中国", latitude: 30.5728, longitude: 104.0668, timezone: "Asia/Shanghai" },
  { name: "广州", admin1: "广东省", country: "中国", latitude: 23.1291, longitude: 113.2644, timezone: "Asia/Shanghai" },
  { name: "深圳", admin1: "广东省", country: "中国", latitude: 22.5431, longitude: 114.0579, timezone: "Asia/Shanghai" },
  { name: "杭州", admin1: "浙江省", country: "中国", latitude: 30.2741, longitude: 120.1551, timezone: "Asia/Shanghai" },
  { name: "奥斯陆", admin1: "奥斯陆", country: "挪威", latitude: 59.9139, longitude: 10.7522, timezone: "Europe/Oslo" },
  { name: "斯德哥尔摩", admin1: "斯德哥尔摩", country: "瑞典", latitude: 59.3293, longitude: 18.0686, timezone: "Europe/Stockholm" },
  { name: "赫尔辛基", admin1: "新地区", country: "芬兰", latitude: 60.1699, longitude: 24.9384, timezone: "Europe/Helsinki" },
  { name: "哥本哈根", admin1: "首都大区", country: "丹麦", latitude: 55.6761, longitude: 12.5683, timezone: "Europe/Copenhagen" },
  { name: "雷克雅未克", admin1: "首都区", country: "冰岛", latitude: 64.1466, longitude: -21.9426, timezone: "Atlantic/Reykjavik" },
  { name: "特罗姆瑟", admin1: "特罗姆斯", country: "挪威", latitude: 69.6492, longitude: 18.9553, timezone: "Europe/Oslo" }
];

const WEATHER_CODES = {
  0: { label: "晴朗", group: "clear" },
  1: { label: "大致晴朗", group: "clear" },
  2: { label: "多云", group: "cloudy" },
  3: { label: "阴天", group: "cloudy" },
  45: { label: "有雾", group: "fog" },
  48: { label: "雾凇", group: "fog" },
  51: { label: "毛毛雨", group: "rain" },
  53: { label: "细雨", group: "rain" },
  55: { label: "密毛毛雨", group: "rain" },
  56: { label: "冻毛毛雨", group: "rain" },
  57: { label: "强冻毛毛雨", group: "rain" },
  61: { label: "小雨", group: "rain" },
  63: { label: "中雨", group: "rain" },
  65: { label: "大雨", group: "rain" },
  66: { label: "冻雨", group: "rain" },
  67: { label: "强冻雨", group: "rain" },
  71: { label: "小雪", group: "snow" },
  73: { label: "中雪", group: "snow" },
  75: { label: "大雪", group: "snow" },
  77: { label: "米雪", group: "snow" },
  80: { label: "阵雨", group: "rain" },
  81: { label: "较强阵雨", group: "rain" },
  82: { label: "强阵雨", group: "rain" },
  85: { label: "阵雪", group: "snow" },
  86: { label: "强阵雪", group: "snow" },
  95: { label: "雷暴", group: "thunder" },
  96: { label: "雷暴伴冰雹", group: "thunder" },
  99: { label: "强雷暴伴冰雹", group: "thunder" }
};

const AQI_LEVELS = [
  { max: 20, label: "优" },
  { max: 40, label: "良" },
  { max: 60, label: "中等" },
  { max: 80, label: "较差" },
  { max: 100, label: "差" },
  { max: Infinity, label: "极差" }
];

const state = {
  city: null,
  forecast: null,
  air: null,
  fetchController: null,
  loadSeq: 0,
  clockTimer: null,
  refreshTimer: null,
  searchController: null,
  searchSeq: 0,
  toastTimer: null,
  broadcastSession: 0,
  broadcastTimer: null,
  broadcastEndTimer: null,
  broadcastSegments: null,
  broadcastFull: "",
  broadcastReportedChar: 0,
  broadcastDurationMs: 0,
  broadcastStartedAt: 0,
  previousTemperature: null
};

const $ = (id) => document.getElementById(id);

const els = {
  body: document.body,
  headerCity: $("headerCity"),
  headerRegion: $("headerRegion"),
  openCity: $("openCity"),
  cityName: $("cityName"),
  coordinates: $("coordinates"),
  localDate: $("localDate"),
  localTime: $("localTime"),
  localSeconds: $("localSeconds"),
  timezone: $("timezone"),
  condition: $("condition"),
  feels: $("feels"),
  temperature: $("temperature"),
  highTemp: $("highTemp"),
  lowTemp: $("lowTemp"),
  rainChance: $("rainChance"),
  observedAt: $("observedAt"),
  startBroadcast: $("startBroadcast"),
  broadcastDuration: $("broadcastDuration"),
  dialTicks: $("dialTicks"),
  windNeedle: $("windNeedle"),
  weatherGlyphLarge: $("weatherGlyphLarge"),
  dialCondition: $("dialCondition"),
  windSpeed: $("windSpeed"),
  windDirection: $("windDirection"),
  humidity: $("humidity"),
  windSpeedMetric: $("windSpeedMetric"),
  rainMetric: $("rainMetric"),
  visibility: $("visibility"),
  hourlyScroller: $("hourlyScroller"),
  hourlyRange: $("hourlyRange"),
  sunriseHead: $("sunriseHead"),
  sunsetHead: $("sunsetHead"),
  forecast: $("forecast"),
  aqiValue: $("aqiValue"),
  aqiCategory: $("aqiCategory"),
  aqiMarker: $("aqiMarker"),
  pm25Bar: $("pm25Bar"),
  pm25Value: $("pm25Value"),
  pm10Bar: $("pm10Bar"),
  pm10Value: $("pm10Value"),
  ozoneBar: $("ozoneBar"),
  ozoneValue: $("ozoneValue"),
  pressure: $("pressure"),
  cloudCover: $("cloudCover"),
  windGust: $("windGust"),
  uvIndex: $("uvIndex"),
  sunrise: $("sunrise"),
  sunset: $("sunset"),
  daylightDot: $("daylightDot"),
  lastUpdated: $("lastUpdated"),
  cityDialog: $("cityDialog"),
  closeCity: $("closeCity"),
  citySearch: $("citySearch"),
  quickCities: $("quickCities"),
  searchResults: $("searchResults"),
  broadcastDock: $("broadcastDock"),
  dockCity: $("dockCity"),
  stopBroadcast: $("stopBroadcast"),
  broadcastProgress: $("broadcastProgress"),
  transcript: $("transcript"),
  waveform: $("waveform"),
  broadcastStatus: $("broadcastStatus"),
  toast: $("toast")
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function cityKey(city) {
  return `${Number(city.latitude).toFixed(3)},${Number(city.longitude).toFixed(3)}`;
}

function getInitialCity() {
  const params = new URLSearchParams(window.location.search);
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));

  if (Number.isFinite(lat) && Number.isFinite(lon) && params.get("name")) {
    return {
      name: params.get("name"),
      admin1: params.get("admin1") || "",
      country: params.get("country") || "",
      timezone: params.get("timezone") || "",
      latitude: lat,
      longitude: lon
    };
  }

  try {
    const stored = JSON.parse(localStorage.getItem("vaer.city.v1") || "null");
    if (stored && Number.isFinite(Number(stored.latitude)) && Number.isFinite(Number(stored.longitude))) {
      return stored;
    }
  } catch {
    /* Local storage can be unavailable in private browsing. */
  }

  return { ...QUICK_CITIES[0] };
}

function normalizeCity(city) {
  return {
    name: String(city.name || "未知地点"),
    admin1: city.admin1 || "",
    country: city.country || "",
    timezone: city.timezone || "UTC",
    latitude: Number(city.latitude),
    longitude: Number(city.longitude)
  };
}

function weatherInfo(code, isDay) {
  const info = WEATHER_CODES[code] || { label: "天气变化", group: "cloudy" };
  return { ...info, isDay: Boolean(isDay) };
}

function iconSvg(code, isDay = true) {
  const info = weatherInfo(code, isDay);
  let content = "";

  if (code === 0) {
    content = isDay ? sunIcon() : moonIcon();
  } else if (code === 1) {
    content = isDay ? partlyIcon(false) : moonCloudIcon();
  } else if (code === 2) {
    content = isDay ? partlyIcon(true) : moonCloudIcon();
  } else if (code === 3) {
    content = `<path d="M14 37h25a7.4 7.4 0 0 0 1-14.7A11.8 11.8 0 0 0 17.5 19 7.6 7.6 0 0 0 14 37Z"/><path d="M24 47h24a7 7 0 0 0 0-14 11.3 11.3 0 0 0-21-1.8A8.1 8.1 0 0 0 24 47Z"/>`;
  } else if (info.group === "fog") {
    content = `<path d="M15 24h34M11 33h29M18 42h35M24 51h18"/>`;
  } else if (info.group === "snow") {
    content = `${cloudIcon("M18 39h27a8 8 0 0 0 0-16 13 13 0 0 0-24.4-3A8.9 8.9 0 0 0 18 39Z")}<path d="M23 46v9M19 50.5h8M20 47.5l6 6M26 47.5l-6 6M41 46v7M37.5 49.5h7M38.6 47l5 5M43.6 47l-5 5"/>`;
  } else if (info.group === "rain") {
    content = `${cloudIcon("M18 38h27a8 8 0 0 0 0-16 13 13 0 0 0-24.4-3A8.9 8.9 0 0 0 18 38Z")}<path d="m23 43-3 8M33 43l-3 8M43 43l-3 8"/>`;
  } else if (info.group === "thunder") {
    content = `${cloudIcon("M18 38h27a8 8 0 0 0 0-16 13 13 0 0 0-24.4-3A8.9 8.9 0 0 0 18 38Z")}<path d="m31 41-6 11h6l-3 9 10-13h-6l4-7Z"/>`;
  } else {
    content = cloudIcon("M18 39h27a8 8 0 0 0 0-16 13 13 0 0 0-24.4-3A8.9 8.9 0 0 0 18 39Z");
  }

  return `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
}

function sunIcon() {
  return `<circle cx="32" cy="32" r="8.8"/><path d="M32 10v5M32 49v5M10 32h5M49 32h5M16.6 16.6l3.5 3.5M43.9 43.9l3.5 3.5M47.4 16.6l-3.5 3.5M20.1 43.9l-3.5 3.5"/>`;
}

function moonIcon() {
  return `<path d="M41 13.6a18.4 18.4 0 1 0 9 30.7 15.6 15.6 0 0 1-9-30.7Z"/><path d="M47.5 18.5v4M45.5 20.5h4"/>`;
}

function partlyIcon(fullCloud) {
  if (fullCloud) {
    return `<circle cx="23" cy="22" r="6.4"/><path d="M23 10v4M23 30v4M11 22h4M31 22h4M15 14l2.8 2.8M29 26l2.8 2.8M31 14l-2.8 2.8M17 26l-2.8 2.8"/><path d="M24 47h25a7.4 7.4 0 0 0 1-14.7 12 12 0 0 0-22.3-2.8A7.8 7.8 0 0 0 24 47Z"/>`;
  }
  return `<circle cx="24" cy="22" r="6.2"/><path d="M24 11v3.8M35 22h-3.8M13.2 22H17M16.2 14.8l2.7 2.7M31.1 29.7l2.7 2.7M31.8 14.8l-2.7 2.7"/><path d="M23 46h26a7.4 7.4 0 0 0 1-14.7 12.2 12.2 0 0 0-22.5-2.7A8 8 0 0 0 23 46Z"/>`;
}

function moonCloudIcon() {
  return `<path d="M37 13.2a11 11 0 1 0 6 18.5 9.5 9.5 0 0 1-6-18.5Z"/><path d="M20 47h26a7.5 7.5 0 0 0 1-15 12.2 12.2 0 0 0-22.5-2.7A8 8 0 0 0 20 47Z"/>`;
}

function cloudIcon(path) {
  return `<path d="${path}"/>`;
}

function coordinateString(city) {
  const lat = Number(city.latitude);
  const lon = Number(city.longitude);
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${latDir} · ${Math.abs(lon).toFixed(2)}° ${lonDir}`;
}

function windDirectionLabel(degrees) {
  const labels = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  const index = Math.round((((Number(degrees) % 360) + 360) % 360) / 45) % 8;
  return `${labels[index]}风`;
}

function aqiLevel(value) {
  return AQI_LEVELS.find((level) => value <= level.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

function uvLabel(value) {
  if (value < 3) return "低";
  if (value < 6) return "中等";
  if (value < 8) return "高";
  if (value < 11) return "很高";
  return "极高";
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function formatMetric(value, unit) {
  return `${value}<small>${unit}</small>`;
}

function formatTimeFromIso(iso) {
  if (!iso || iso.length < 16) return "—:—";
  return iso.slice(11, 16);
}

function localeWeekday(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date);
}

function localPartsFor(city) {
  const timezone = city.timezone || "UTC";
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return {
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

function currentHourIndex(forecast) {
  if (!forecast?.hourly?.time?.length) return 0;
  const key = `${forecast.current.time.slice(0, 13)}:00`;
  let index = forecast.hourly.time.indexOf(key);
  if (index !== -1) return index;
  index = forecast.hourly.time.findIndex((time) => time >= forecast.current.time);
  return index === -1 ? 0 : index;
}

function todayIndex(forecast) {
  if (!forecast?.daily?.time?.length) return 0;
  const index = forecast.daily.time.indexOf(forecast.current.time.slice(0, 10));
  return index === -1 ? 0 : index;
}

function saveCity(city) {
  try {
    localStorage.setItem("vaer.city.v1", JSON.stringify(city));
  } catch {
    /* Ignore storage quota and privacy errors. */
  }
}

function saveWeatherCache() {
  try {
    localStorage.setItem(
      "vaer.weather.v1",
      JSON.stringify({
        cityKey: cityKey(state.city),
        city: state.city,
        forecast: state.forecast,
        air: state.air,
        savedAt: Date.now()
      })
    );
  } catch {
    /* Weather cache is a convenience, not a requirement. */
  }
}

function restoreWeatherCache() {
  try {
    const cached = JSON.parse(localStorage.getItem("vaer.weather.v1") || "null");
    if (!cached?.forecast || cached.cityKey !== cityKey(state.city)) return false;
    state.forecast = cached.forecast;
    state.air = cached.air || null;
    state.city = { ...state.city, ...cached.city };
    renderAll({ animate: false });
    updateLastUpdated(new Date(cached.savedAt || Date.now()));
    return true;
  } catch {
    return false;
  }
}

function updateUrl(city) {
  const url = new URL(window.location.href);
  url.searchParams.set("name", city.name);
  url.searchParams.set("lat", Number(city.latitude).toFixed(4));
  url.searchParams.set("lon", Number(city.longitude).toFixed(4));
  url.searchParams.set("country", city.country || "");
  url.searchParams.set("admin1", city.admin1 || "");
  url.searchParams.set("timezone", city.timezone || "");
  window.history.replaceState({}, "", url);
}

function updateLastUpdated(date) {
  const timezone = state.city?.timezone || "UTC";
  els.lastUpdated.textContent = new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(date);
}

function updateClock() {
  if (!state.city) return;
  const timezone = state.city.timezone || "UTC";
  const now = new Date();
  const time = new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(now);
  const seconds = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    second: "2-digit"
  }).format(now);
  const date = new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(now);
  const weekday = new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    weekday: "short"
  }).format(now);

  els.localTime.textContent = time;
  els.localSeconds.textContent = `:${seconds}`;
  els.localDate.textContent = `${date} · ${weekday}`;
  els.timezone.textContent = state.forecast?.timezone_abbreviation || state.city.timezoneAbbr || timezone;
  updateDaylightPosition();
}

function parseClockToMinutes(iso) {
  if (!iso || iso.length < 16) return null;
  const [hour, minute] = iso.slice(11, 16).split(":").map(Number);
  return hour * 60 + minute;
}

function updateDaylightPosition() {
  if (!state.forecast || !state.city) return;
  const today = todayIndex(state.forecast);
  const sunrise = state.forecast.daily.sunrise?.[today];
  const sunset = state.forecast.daily.sunset?.[today];
  const riseMinutes = parseClockToMinutes(sunrise);
  const setMinutes = parseClockToMinutes(sunset);
  if (riseMinutes === null || setMinutes === null) return;

  const { hour, minute } = localPartsFor(state.city);
  const nowMinutes = hour * 60 + minute;
  const ratio = setMinutes === riseMinutes ? 0.5 : (nowMinutes - riseMinutes) / (setMinutes - riseMinutes);
  els.daylightDot.style.left = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
}

function setMetric(element, value, unit) {
  element.innerHTML = formatMetric(value, value === "—" ? "" : unit);
}

function renderCity() {
  const city = state.city;
  els.cityName.textContent = city.name;
  els.headerCity.textContent = city.name;
  els.headerRegion.textContent = city.country || city.admin1 || "";
  els.coordinates.textContent = coordinateString(city);
  document.title = `${city.name} · VÆR 天气播报`;
  els.dockCity.textContent = city.name;
}

function animateTemperature(target) {
  const element = els.temperature;
  const previous = state.previousTemperature;
  state.previousTemperature = target;

  if (previous === null || previous === target || reducedMotion) {
    element.textContent = String(target);
    return;
  }

  const duration = 720;
  const start = performance.now();
  const from = Number(previous);

  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = String(Math.round(from + (target - from) * eased));
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function renderWeather(animate) {
  const forecast = state.forecast;
  const current = forecast.current;
  const today = todayIndex(forecast);
  const hour = currentHourIndex(forecast);
  const daily = forecast.daily;
  const info = weatherInfo(current.weather_code, current.is_day);
  const temperature = Math.round(current.temperature_2m);
  const humidity = Math.round(current.relative_humidity_2m);
  const windSpeed = round(current.wind_speed_10m, 1);
  const windGust = round(current.wind_gusts_10m, 1);
  const rain = Math.round(forecast.hourly.precipitation_probability?.[hour] ?? daily.precipitation_probability_max?.[today] ?? 0);
  const visibilityMeters = forecast.hourly.visibility?.[hour];
  const visibilityKm = Number.isFinite(visibilityMeters)
    ? visibilityMeters >= 10000
      ? Math.round(visibilityMeters / 1000)
      : round(visibilityMeters / 1000, 1)
    : "—";
  const uv = round(daily.uv_index_max?.[today] ?? 0, 1);

  els.body.dataset.weather = info.group;
  els.body.dataset.night = current.is_day ? "false" : "true";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", current.is_day ? "#edf0ec" : "#14191a");

  els.condition.textContent = info.label;
  els.feels.textContent = `体感 ${Math.round(current.apparent_temperature)}°`;
  animateTemperature(temperature);
  els.highTemp.textContent = `${Math.round(daily.temperature_2m_max[today])}°`;
  els.lowTemp.textContent = `${Math.round(daily.temperature_2m_min[today])}°`;
  els.rainChance.textContent = `${rain}%`;
  els.observedAt.textContent = `WMO ${current.weather_code} · ${formatTimeFromIso(current.time)}`;
  els.dialCondition.textContent = info.label;
  els.weatherGlyphLarge.innerHTML = iconSvg(current.weather_code, current.is_day);

  setMetric(els.humidity, humidity, "%");
  setMetric(els.windSpeedMetric, windSpeed, "m/s");
  setMetric(els.rainMetric, rain, "%");
  setMetric(els.visibility, visibilityKm, "km");

  els.windSpeed.textContent = `${windSpeed.toFixed(1)} m/s`;
  els.windDirection.textContent = windDirectionLabel(current.wind_direction_10m);
  els.windNeedle.setAttribute("transform", `rotate(${Number(current.wind_direction_10m)} 200 200)`);

  els.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
  els.cloudCover.textContent = `${Math.round(current.cloud_cover)}%`;
  els.windGust.textContent = `${windGust.toFixed(1)} m/s`;
  els.uvIndex.textContent = `${uv} · ${uvLabel(uv)}`;

  const sunrise = formatTimeFromIso(daily.sunrise?.[today]);
  const sunset = formatTimeFromIso(daily.sunset?.[today]);
  els.sunrise.textContent = sunrise;
  els.sunset.textContent = sunset;
  els.sunriseHead.textContent = sunrise;
  els.sunsetHead.textContent = sunset;
  updateDaylightPosition();

  renderHourly();
  renderForecast();
  renderAir();
  updateClock();
  updateBroadcastDuration(animate);
}

function renderHourly() {
  const forecast = state.forecast;
  const hourly = forecast.hourly;
  const start = currentHourIndex(forecast);
  const count = Math.min(24, hourly.time.length - start);

  if (!count) {
    els.hourlyScroller.innerHTML = "";
    return;
  }

  const cards = [];
  for (let offset = 0; offset < count; offset += 1) {
    const index = start + offset;
    const time = hourly.time[index];
    const code = hourly.weather_code[index];
    const isDay = Boolean(hourly.is_day[index]);
    const temp = Math.round(hourly.temperature_2m[index]);
    const chance = Math.round(hourly.precipitation_probability?.[index] ?? 0);
    const label = offset === 0 ? "现在" : `${time.slice(11, 13)}:00`;
    const dryClass = chance < 10 ? " is-dry" : "";

    cards.push(`
      <div class="hour-card${offset === 0 ? " is-now" : ""}">
        <span class="hour-time">${label}</span>
        <div class="hour-icon">${iconSvg(code, isDay)}</div>
        <span class="hour-temp">${temp}°</span>
        <span class="hour-rain${dryClass}">${chance}%</span>
      </div>
    `);
  }

  els.hourlyScroller.innerHTML = cards.join("");
  els.hourlyScroller.scrollLeft = 0;
  els.hourlyRange.textContent = `${count}H`;
}

function renderForecast() {
  const daily = state.forecast.daily;
  const today = todayIndex(state.forecast);
  const allMins = daily.temperature_2m_min.map(Number);
  const allMaxs = daily.temperature_2m_max.map(Number);
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const span = Math.max(1, weekMax - weekMin);

  const rows = daily.time.map((time, index) => {
    const code = daily.weather_code[index];
    const info = weatherInfo(code, true);
    const min = Math.round(daily.temperature_2m_min[index]);
    const max = Math.round(daily.temperature_2m_max[index]);
    const rain = Math.round(daily.precipitation_probability_max?.[index] ?? 0);
    const dayLabel = index === today ? "今天" : index === today + 1 ? "明天" : localeWeekday(time);
    const dateLabel = `${time.slice(5, 7)}.${time.slice(8, 10)}`;
    const weekMinRaw = allMins[index];
    const weekMaxRaw = allMaxs[index];
    const left = ((weekMinRaw - weekMin) / span) * 100;
    const width = Math.max(7, ((weekMaxRaw - weekMinRaw) / span) * 100);

    return `
      <div class="forecast-row${index === today ? " is-today" : ""}">
        <div class="forecast-day">
          <strong>${dayLabel}</strong>
          <span>${dateLabel}</span>
        </div>
        <div class="forecast-icon">${iconSvg(code, true)}</div>
        <span class="forecast-condition">${info.label}</span>
        <span class="forecast-rain">${rain}%</span>
        <div class="forecast-range" aria-hidden="true">
          <span class="range-track"></span>
          <span class="range-fill" style="left:${left}%;width:${width}%"></span>
        </div>
        <div class="forecast-temp">
          <span class="max">${max}°</span>
          <span class="min">${min}°</span>
        </div>
      </div>
    `;
  });

  els.forecast.innerHTML = rows.join("");
}

function renderAir() {
  const air = state.air?.current;
  if (!air || !Number.isFinite(Number(air.european_aqi))) {
    els.aqiValue.textContent = "—";
    els.aqiCategory.textContent = "暂无数据";
    els.aqiMarker.style.left = "0%";
    els.pm25Value.textContent = "—";
    els.pm10Value.textContent = "—";
    els.ozoneValue.textContent = "—";
    els.pm25Bar.style.width = "0%";
    els.pm10Bar.style.width = "0%";
    els.ozoneBar.style.width = "0%";
    return;
  }

  const aqi = Math.round(air.european_aqi);
  const level = aqiLevel(aqi);
  els.aqiValue.textContent = String(aqi);
  els.aqiCategory.textContent = level.label;
  els.aqiMarker.style.left = `${Math.min(100, Math.max(0, aqi))}%`;

  const pm25 = Math.round(air.pm2_5 ?? 0);
  const pm10 = Math.round(air.pm10 ?? 0);
  const ozone = Math.round(air.ozone ?? 0);
  els.pm25Value.textContent = String(pm25);
  els.pm10Value.textContent = String(pm10);
  els.ozoneValue.textContent = String(ozone);
  els.pm25Bar.style.width = `${Math.min(100, (pm25 / 50) * 100)}%`;
  els.pm10Bar.style.width = `${Math.min(100, (pm10 / 100) * 100)}%`;
  els.ozoneBar.style.width = `${Math.min(100, (ozone / 160) * 100)}%`;
}

function renderAll({ animate = true } = {}) {
  if (!state.forecast) return;
  renderCity();
  renderWeather(animate);
  updateLastUpdated(new Date());
}

async function loadWeather(city, { animate = true } = {}) {
  if (state.fetchController) state.fetchController.abort();
  const controller = new AbortController();
  state.fetchController = controller;
  const sequence = ++state.loadSeq;
  const target = normalizeCity(city);

  els.body.classList.add("is-loading");

  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.search = new URLSearchParams({
    latitude: String(target.latitude),
    longitude: String(target.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code,is_day,relative_humidity_2m,wind_speed_10m,uv_index,visibility",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "ms",
    temperature_unit: "celsius",
    precipitation_unit: "mm"
  }).toString();

  const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  airUrl.search = new URLSearchParams({
    latitude: String(target.latitude),
    longitude: String(target.longitude),
    current: "european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
    timezone: "auto"
  }).toString();

  try {
    const weatherPromise = fetch(weatherUrl, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
      return response.json();
    });

    const airPromise = fetch(airUrl, { signal: controller.signal })
      .then(async (response) => (response.ok ? response.json() : null))
      .catch(() => null);

    const forecast = await weatherPromise;
    const air = await airPromise;

    if (sequence !== state.loadSeq) return;

    const resolvedCity = {
      ...target,
      timezone: forecast.timezone || target.timezone || "UTC",
      timezoneAbbr: forecast.timezone_abbreviation || ""
    };

    state.city = resolvedCity;
    state.forecast = forecast;
    state.air = air;
    saveCity(resolvedCity);
    saveWeatherCache();
    updateUrl(resolvedCity);
    renderAll({ animate });
  } catch (error) {
    if (error.name === "AbortError" || sequence !== state.loadSeq) return;
    console.error(error);
    if (state.forecast) {
      showToast("连接中断，正在显示上一次观测。");
    } else {
      showToast("气象站暂时无响应，请稍后重试。");
    }
  } finally {
    if (sequence === state.loadSeq) {
      els.body.classList.remove("is-loading");
    }
  }
}

function showToast(message, duration = 3200) {
  clearTimeout(state.toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  state.toastTimer = setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, duration);
}

function generateDialTicks() {
  const lines = [];
  for (let index = 0; index < 72; index += 1) {
    const angle = index * 5;
    const major = index % 18 === 0;
    const medium = index % 6 === 0;
    const length = major ? 9 : medium ? 4.5 : 2.5;
    const outer = 190;
    const inner = outer - length;
    const radians = (angle * Math.PI) / 180;
    const x1 = 200 + outer * Math.sin(radians);
    const y1 = 200 - outer * Math.cos(radians);
    const x2 = 200 + inner * Math.sin(radians);
    const y2 = 200 - inner * Math.cos(radians);
    const opacity = major ? 0.8 : medium ? 0.55 : 0.32;
    lines.push(
      `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke-width="${major ? 0.9 : 0.55}" opacity="${opacity}"/>`
    );
  }
  els.dialTicks.innerHTML = lines.join("");
}

function generateWaveform() {
  const bars = [];
  const count = 36;
  for (let index = 0; index < count; index += 1) {
    const height = 6 + Math.abs(Math.sin(index * 1.73)) * 28;
    const delay = (index % 11) * 0.075;
    bars.push(
      `<span class="wave-bar" style="--h:${height.toFixed(1)}px;--d:${delay.toFixed(2)}s"></span>`
    );
  }
  els.waveform.innerHTML = bars.join("");
}

function renderQuickCities() {
  els.quickCities.innerHTML = QUICK_CITIES.map((city, index) => {
    const active = cityKey(city) === cityKey(state.city || QUICK_CITIES[0]);
    return `
      <button class="quick-city${active ? " is-current" : ""}" type="button" data-city-index="${index}"${active ? ' aria-current="true"' : ""}>
        <strong>${city.name}</strong>
        <span>${city.country} · ${String(city.latitude).slice(0, 5)}°</span>
      </button>
    `;
  }).join("");
}

function openCityDialog() {
  renderQuickCities();
  els.citySearch.value = "";
  showSearchPlaceholder();
  if (!els.cityDialog.open) els.cityDialog.showModal();
  document.documentElement.style.overflow = "hidden";
  window.setTimeout(() => els.citySearch.focus(), 80);
}

function closeCityDialog() {
  if (els.cityDialog.open) els.cityDialog.close();
  document.documentElement.style.overflow = "";
}

function showSearchPlaceholder() {
  els.searchResults.innerHTML = '<p class="search-placeholder">输入中英文城市名，查找全球观测站。</p>';
}

function renderSearchResults(results, query) {
  if (!results.length) {
    els.searchResults.innerHTML = `<p class="search-message">没有找到“${escapeHtml(query)}”，试试更完整的城市名。</p>`;
    return;
  }

  els.searchResults.innerHTML = results.map((city, index) => `
    <button class="search-result" type="button" data-result-index="${index}">
      <span class="result-main">
        <span class="result-name">${escapeHtml(city.name)}</span>
        <span class="result-region">${escapeHtml([city.admin1, city.country].filter(Boolean).join(" · "))}</span>
      </span>
      <span class="result-coord">${Math.abs(city.latitude).toFixed(2)}° ${Math.abs(city.longitude).toFixed(2)}°</span>
    </button>
  `).join("");

  els.searchResults.querySelectorAll(".search-result").forEach((button) => {
    button.addEventListener("click", () => {
      const city = results[Number(button.dataset.resultIndex)];
      chooseCity(city);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function searchCities(query) {
  if (state.searchController) state.searchController.abort();
  const controller = new AbortController();
  state.searchController = controller;
  const sequence = ++state.searchSeq;

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({
      name: query,
      count: "8",
      language: "zh",
      format: "json"
    }).toString();

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Geocoding request failed: ${response.status}`);
    const data = await response.json();
    if (sequence !== state.searchSeq) return;

    const results = (data.results || []).map((item) => ({
      name: item.name,
      admin1: item.admin1 || "",
      country: item.country || "",
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || "UTC"
    }));
    renderSearchResults(results, query);
  } catch (error) {
    if (error.name === "AbortError" || sequence !== state.searchSeq) return;
    console.error(error);
    els.searchResults.innerHTML = '<p class="search-message">检索暂时不可用，请稍后再试。</p>';
  }
}

function chooseCity(city) {
  stopBroadcast({ silent: true, returnFocus: false });
  closeCityDialog();

  if (cityKey(city) === cityKey(state.city)) {
    loadWeather(city, { animate: true });
    return;
  }

  els.openCity.setAttribute("aria-busy", "true");
  loadWeather(city, { animate: true }).finally(() => {
    els.openCity.removeAttribute("aria-busy");
  });
}

function buildBroadcastScript() {
  if (!state.forecast) return null;

  const forecast = state.forecast;
  const current = forecast.current;
  const today = todayIndex(forecast);
  const hour = currentHourIndex(forecast);
  const info = weatherInfo(current.weather_code, current.is_day);
  const cityName = state.city.name;
  const local = localPartsFor(state.city);
  const temperature = Math.round(current.temperature_2m);
  const feels = Math.round(current.apparent_temperature);
  const high = Math.round(forecast.daily.temperature_2m_max[today]);
  const low = Math.round(forecast.daily.temperature_2m_min[today]);
  const chance = Math.round(forecast.hourly.precipitation_probability?.[hour] ?? 0);
  const nextChance = Math.max(
    Number(forecast.hourly.precipitation_probability?.[hour + 1] ?? chance),
    Number(forecast.hourly.precipitation_probability?.[hour + 2] ?? chance)
  );
  const humidity = Math.round(current.relative_humidity_2m);
  const wind = round(current.wind_speed_10m, 1);
  const windLabel = windDirectionLabel(current.wind_direction_10m).replace("风", "");
  const tomorrowCode = forecast.daily.weather_code[today + 1];
  const tomorrow = weatherInfo(tomorrowCode, true);
  const tomorrowHigh = Math.round(forecast.daily.temperature_2m_max[today + 1] ?? high);
  const tomorrowLow = Math.round(forecast.daily.temperature_2m_min[today + 1] ?? low);
  const uv = Number(forecast.daily.uv_index_max?.[today] ?? 0);

  let advice = "天气整体平稳，适合安排日常出行。";
  if (info.group === "thunder") {
    advice = "有雷暴活动，请减少不必要的户外停留。";
  } else if (nextChance >= 55 || info.group === "rain") {
    advice = "降水可能性较高，出门建议随身带伞。";
  } else if (info.group === "snow") {
    advice = "有降雪，路面可能湿滑，出行请注意安全。";
  } else if (info.group === "fog") {
    advice = "能见度偏低，驾车出行请放慢速度。";
  } else if (temperature <= 5) {
    advice = "气温较低，外出请注意保暖。";
  } else if (temperature >= 30) {
    advice = "天气偏热，记得及时补水。";
  } else if (uv >= 6) {
    advice = "日间紫外线较强，外出注意防晒。";
  }

  const segments = [
    `现在是${cityName}当地时间${String(local.hour).padStart(2, "0")}点${String(local.minute).padStart(2, "0")}分，为您播报天气。`,
    `当前${info.label}，气温${temperature}摄氏度，体感温度${feels}度。`,
    `今天最高${high}度，最低${low}度，当前降水概率${chance}%。`,
    `目前${windLabel}风，风速每秒${wind}米，湿度百分之${humidity}。`,
    `未来两小时降水概率最高百分之${Math.round(nextChance)}，${advice}`,
    `明天${tomorrow.label}，最高${tomorrowHigh}度，最低${tomorrowLow}度。`,
    "以上是今天的天气播报，祝你有平静的一天。"
  ];

  let offset = 0;
  const mapped = segments.map((text) => {
    const item = { text, start: offset, end: offset + text.length };
    offset += text.length;
    return item;
  });

  return {
    full: mapped.map((segment) => segment.text).join(""),
    segments: mapped
  };
}

function estimateBroadcastDuration(script) {
  if (!script) return 45;
  return Math.max(18, Math.round(script.full.length / 4.2));
}

function updateBroadcastDuration() {
  const script = buildBroadcastScript();
  if (!script) {
    els.broadcastDuration.textContent = "约 45 秒";
    return;
  }
  const seconds = estimateBroadcastDuration(script);
  if (seconds < 60) {
    els.broadcastDuration.textContent = `约 ${seconds} 秒`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    els.broadcastDuration.textContent = `约 ${minutes} 分 ${String(rest).padStart(2, "0")} 秒`;
  }
}

function pickChineseVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((voice) => /^zh[-_]CN$/i.test(voice.lang) && /Ting|Xiaoxiao|Meijia|Mei-Jia|Google/i.test(voice.name));
  return preferred
    || voices.find((voice) => /^zh[-_]CN$/i.test(voice.lang))
    || voices.find((voice) => /^zh/i.test(voice.lang))
    || null;
}

function renderTranscript(segments) {
  els.transcript.innerHTML = segments.map((segment, index) => (
    `<span data-segment-index="${index}">${escapeHtml(segment.text)}</span>`
  )).join("");
}

function updateTranscriptProgress(charIndex) {
  const length = state.broadcastFull.length || 1;
  const ratio = Math.max(0, Math.min(1, charIndex / length));
  els.broadcastProgress.style.width = `${ratio * 100}%`;

  els.transcript.querySelectorAll("span[data-segment-index]").forEach((span, index) => {
    const segment = state.broadcastSegments[index];
    const active = charIndex >= segment.start && charIndex < segment.end;
    const past = charIndex >= segment.end;
    span.classList.toggle("is-active", active);
    span.classList.toggle("is-past", past && !active);
  });
}

function openBroadcastDock() {
  clearTimeout(state.broadcastEndTimer);
  els.broadcastDock.classList.add("is-open");
  els.broadcastDock.setAttribute("aria-hidden", "false");
  els.body.classList.add("is-broadcasting");
}

function dismissBroadcastDock({ returnFocus = true } = {}) {
  els.broadcastDock.classList.remove("is-open", "is-speaking");
  els.broadcastDock.setAttribute("aria-hidden", "true");
  els.body.classList.remove("is-broadcasting");
  els.broadcastProgress.style.width = "0%";
  if (returnFocus) els.startBroadcast.focus({ preventScroll: true });
}

function stopBroadcast({ silent = false, returnFocus = true } = {}) {
  state.broadcastSession += 1;
  clearInterval(state.broadcastTimer);
  clearTimeout(state.broadcastEndTimer);
  state.broadcastTimer = null;
  state.broadcastEndTimer = null;

  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  dismissBroadcastDock({ returnFocus });
  state.broadcastReportedChar = 0;

  if (!silent) {
    els.broadcastStatus.textContent = "播报已停止";
  }
}

function startBroadcast() {
  if (!state.forecast) {
    showToast("天气数据尚未就绪，请稍后再试。");
    return;
  }

  stopBroadcast({ silent: true, returnFocus: false });

  const script = buildBroadcastScript();
  if (!script) return;

  state.broadcastSegments = script.segments;
  state.broadcastFull = script.full;
  state.broadcastReportedChar = 0;
  state.broadcastDurationMs = estimateBroadcastDuration(script) * 1000;
  state.broadcastStartedAt = 0;

  renderTranscript(script.segments);
  updateTranscriptProgress(0);
  openBroadcastDock();
  els.broadcastStatus.textContent = "正在接入语音";
  els.broadcastProgress.style.width = "0%";

  if (!("speechSynthesis" in window)) {
    updateTranscriptProgress(script.full.length);
    els.broadcastStatus.textContent = "当前浏览器不支持语音，已显示文字播报";
    els.stopBroadcast.focus({ preventScroll: true });
    return;
  }

  const session = ++state.broadcastSession;
  const utterance = new SpeechSynthesisUtterance(script.full);
  utterance.lang = "zh-CN";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voice = pickChineseVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    if (session !== state.broadcastSession) return;
    state.broadcastStartedAt = performance.now();
    els.broadcastDock.classList.add("is-speaking");
    els.broadcastStatus.textContent = `正在播报 · ${state.city.name}`;
    els.stopBroadcast.focus({ preventScroll: true });

    clearInterval(state.broadcastTimer);
    state.broadcastTimer = setInterval(() => {
      if (session !== state.broadcastSession) return;
      const elapsed = performance.now() - state.broadcastStartedAt;
      const estimatedChar = Math.floor((elapsed / state.broadcastDurationMs) * state.broadcastFull.length);
      const charIndex = Math.max(state.broadcastReportedChar, Math.min(state.broadcastFull.length - 1, estimatedChar));
      updateTranscriptProgress(charIndex);
    }, 220);
  };

  utterance.onboundary = (event) => {
    if (session !== state.broadcastSession) return;
    if (typeof event.charIndex !== "number") return;
    state.broadcastReportedChar = Math.max(state.broadcastReportedChar, event.charIndex);
    updateTranscriptProgress(state.broadcastReportedChar);
  };

  utterance.onend = () => {
    if (session !== state.broadcastSession) return;
    clearInterval(state.broadcastTimer);
    state.broadcastTimer = null;
    updateTranscriptProgress(state.broadcastFull.length);
    els.broadcastDock.classList.remove("is-speaking");
    els.broadcastStatus.textContent = "播报结束";
    state.broadcastEndTimer = setTimeout(() => {
      if (session !== state.broadcastSession) return;
      dismissBroadcastDock({ returnFocus: true });
    }, 2400);
  };

  utterance.onerror = (event) => {
    if (session !== state.broadcastSession) return;
    if (event.error === "canceled" || event.error === "interrupted") return;
    clearInterval(state.broadcastTimer);
    els.broadcastDock.classList.remove("is-speaking");
    els.broadcastStatus.textContent = "语音暂不可用，可阅读上方文字播报";
  };

  window.speechSynthesis.speak(utterance);
}

function setupReveal() {
  const elements = document.querySelectorAll(".section, .site-footer");
  if (!("IntersectionObserver" in window) || reducedMotion) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -3% 0px" });

  elements.forEach((element) => {
    element.classList.add("reveal-ready");
    observer.observe(element);
  });
}

function bindEvents() {
  els.openCity.addEventListener("click", openCityDialog);
  els.closeCity.addEventListener("click", closeCityDialog);

  els.cityDialog.addEventListener("click", (event) => {
    if (event.target === els.cityDialog) closeCityDialog();
  });

  els.cityDialog.addEventListener("close", () => {
    document.documentElement.style.overflow = "";
  });

  els.quickCities.addEventListener("click", (event) => {
    const button = event.target.closest(".quick-city");
    if (!button) return;
    const city = QUICK_CITIES[Number(button.dataset.cityIndex)];
    if (city) chooseCity(city);
  });

  let searchDebounce = null;
  els.citySearch.addEventListener("input", () => {
    const query = els.citySearch.value.trim();
    clearTimeout(searchDebounce);
    if (!query) {
      showSearchPlaceholder();
      return;
    }
    els.searchResults.innerHTML = '<p class="search-message">正在检索观测站…</p>';
    searchDebounce = setTimeout(() => searchCities(query), 320);
  });

  els.citySearch.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const firstResult = els.searchResults.querySelector(".search-result");
    if (firstResult) {
      event.preventDefault();
      firstResult.click();
    }
  });

  els.startBroadcast.addEventListener("click", startBroadcast);
  els.stopBroadcast.addEventListener("click", () => stopBroadcast());

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (els.broadcastDock.classList.contains("is-open") && !els.cityDialog.open) {
      stopBroadcast();
    }
  });

  window.addEventListener("beforeunload", () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  window.addEventListener("resize", () => {
    if (els.broadcastDock.classList.contains("is-open") && state.broadcastFull) {
      updateTranscriptProgress(state.broadcastReportedChar);
    }
  });
}

function init() {
  state.city = normalizeCity(getInitialCity());
  renderCity();
  renderQuickCities();
  generateDialTicks();
  generateWaveform();
  state.previousTemperature = null;
  restoreWeatherCache();
  updateClock();

  state.clockTimer = setInterval(updateClock, 1000);
  state.refreshTimer = setInterval(() => {
    if (!els.body.classList.contains("is-broadcasting")) {
      loadWeather(state.city, { animate: true });
    }
  }, 15 * 60 * 1000);

  bindEvents();
  setupReveal();
  loadWeather(state.city, { animate: true });
}

init();
