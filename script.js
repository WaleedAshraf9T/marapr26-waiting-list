// Making it public on purpose as it's read-only data and there is no sensitive info could be fetched from it. Only legend can do something harmful bad with it.
const SCRIPT = "https://script.google.com/macros/s/AKfycbwGeW5Wpq7Aq_0YAMLoyprVqGFkCsi8uglIZhOmrs0yMwAx_QentUeQD40fEWDvnKX2Sg/exec";

const container = document.getElementById("recordsContainer");
const filter = document.getElementById("dateFilter");
const totalCountEl = document.getElementById("totalCount");
const loading = document.getElementById("loading");

fetch(SCRIPT)
  .then(res => res.json())
  .then(data => init(data))
  .finally(() => {
    // Hide loading once data is rendered
    loading.style.display = "none";
  });

function init(data) {
  totalCountEl.textContent = `Total Applicants: ${data.length}`;

  const grouped = groupByJoinDate(data);
  populateFilter(Object.keys(grouped));
  render(grouped);

  filter.addEventListener("change", () => {
    if (filter.value === "all") {
      render(grouped);
    } else {
      render({ [filter.value]: grouped[filter.value] });
    }
  });
}

/* ---------- GROUPING ---------- */

function groupByJoinDate(data) {
  return data.reduce((acc, item) => {
    const date = formatDate(item.joinDate);
    acc[date] = acc[date] || [];
    acc[date].push(item);
    return acc;
  }, {});
}

function populateFilter(dates) {
  dates.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    filter.appendChild(opt);
  });
}

/* ---------- RENDER ---------- */

function render(groups) {
  container.innerHTML = "";

  Object.entries(groups).forEach(([date, records]) => {
    const group = document.createElement("div");
    group.className = "group";

    group.innerHTML = `
      <div class="group-header">
        Join Date: ${date}
        <span>(${records.length} applicants)</span>
      </div>

      <div class="table">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Time</th>
              <th>Got Submission</th>
              <th>Submitted</th>
              <th>Correction</th>
              <th>Appointment</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(r => rowTemplate(r)).join("")}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(group);
  });
}

/* ---------- ROW TEMPLATE ---------- */

function rowTemplate(r) {
  const hasGot = !!r.gotSubmission;
  const hasCorrection = !!r.correction;
  const hasAppointment = !!r.appointment;

  let rowClass = "";
  let correctionClass = "";

  if (hasGot && !hasAppointment) {
    rowClass = hasCorrection ? "row-red" : "row-green";
  }

  if (hasGot && hasAppointment) {
    rowClass = "row-strong-green";
    if (hasCorrection) correctionClass = "correction-highlight";
  }

  return `
    <tr class="${rowClass}">
      <td title="${r.fullName}">${r.fullName}</td>
      <td title="${formatTime(r.joinTime)}">${formatTime(r.joinTime)}</td>
      <td title="${formatDate(r.gotSubmission)}">${formatDate(r.gotSubmission)}</td>
      <td title="${formatDateTime(r.submitted)}">${formatDateTime(r.submitted)}</td>
      <td class="${correctionClass}" title="${r.correction}">
        ${formatCorrection(r.correction)}
      </td>
      <td title="${formatDate(r.appointment)}">${formatDate(r.appointment)}</td>
    </tr>
  `;
}

/* ---------- FORMATTERS ---------- */

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${formatDate(d)} ${formatTime(d)}`;
}

function formatCorrection(value) {
  if (!value) return "";
  return value.replace(/\n/g, "<br>");
}
/* ---------- END ---------- */