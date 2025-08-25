/*
  HOW TO ADD/EDIT STUDENTS:
  - Edit data/students.json with objects:
    id, name, grade, featured (true/false), tags (["Web","Game","App","Cybersecurity","Hardware"]),
    projects: [{ title, type, url, note }]
  - type can be: "Web","Game","App","Cybersecurity","Hardware"
*/

let STUDENTS = [];

const TAG_COLORS = {
  Web:"#5cc8ff",
  Game:"#27d980",
  App:"#ffd166",
  Cybersecurity:"#f78da7",
  Hardware:"#c792ea",
  Featured:"#ffd166"
};

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const q = document.getElementById("q");
const grade = document.getElementById("grade");
const chips = document.getElementById("chips");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const projWrap = document.getElementById("projWrap");
const closeBtn = document.getElementById("closeBtn");

let activeTags = new Set();

function initials(name){
  return name.split(/\s+/).map(w=>w[0]).join("").slice(0,3).toUpperCase();
}
function tagPill(label){
  const span = document.createElement("span");
  span.className="tag";
  span.textContent = label;
  const color = TAG_COLORS[label] || "#a8b3c7";
  span.style.borderColor = color + "55";
  span.style.color = color;
  return span;
}
function card(student){
  const el = document.createElement("article");
  el.className="card";
  el.dataset.name = student.name.toLowerCase();
  el.dataset.grade = student.grade;
  el.dataset.tags = (student.tags||[]).join(",").toLowerCase();

  const star = document.createElement("div");
  star.className="star";
  star.dataset.on = student.featured ? "true" : "false";
  star.textContent = "★";
  el.appendChild(star);

  const top = document.createElement("div");
  top.className="row";
  const av = document.createElement("div");
  av.className="avatar";
  av.textContent = initials(student.name);
  top.appendChild(av);

  const txt = document.createElement("div");
  const n = document.createElement("div"); n.className="name"; n.textContent=student.name;
  const m = document.createElement("div"); m.className="meta"; m.textContent = "Grade " + (student.grade||"—");
  txt.appendChild(n); txt.appendChild(m);
  top.appendChild(txt);
  el.appendChild(top);

  const tags = document.createElement("div");
  tags.className="tags";
  (student.tags||[]).forEach(t=> tags.appendChild(tagPill(t)));
  el.appendChild(tags);

  const btn = document.createElement("button");
  btn.className="btn"; btn.innerHTML = "View Projects →";
  btn.addEventListener("click", ()=> openModal(student));
  el.appendChild(btn);

  // Clicking anywhere opens modal
  el.addEventListener("click", (e)=> {
    if(e.target.tagName.toLowerCase()==="button") return;
    openModal(student);
  });
  return el;
}
function openModal(student){
  modalTitle.textContent = `${student.name} — Projects`;
  projWrap.innerHTML = "";
  if(!student.projects || !student.projects.length){
    const p = document.createElement("p");
    p.textContent = "No projects yet.";
    projWrap.appendChild(p);
  }else{
    student.projects.forEach(p=>{
      const row = document.createElement("div");
      row.className="proj";
      const ico = document.createElement("div");
      ico.className="ico";
      ico.textContent = iconFor(p.type);
      row.appendChild(ico);
      const txt = document.createElement("div");
      const h4 = document.createElement("h4");
      const a = document.createElement("a");
      a.href = p.url; a.target="_blank"; a.rel="noopener";
      a.textContent = p.title || "Project link";
      h4.appendChild(a);
      const meta = document.createElement("p");
      meta.textContent = `${p.type}${p.note? " · "+p.note : ""}`;
      txt.appendChild(h4); txt.appendChild(meta);
      row.appendChild(txt);
      projWrap.appendChild(row);
    });
  }
  if(typeof modal.showModal === "function"){ modal.showModal(); }
  else { modal.setAttribute("open","open"); }
}
closeBtn.addEventListener("click", ()=> modal.close());

function iconFor(type){
  switch(type){
    case "Web": return "🌐";
    case "Game": return "🎮";
    case "App": return "📱";
    case "Cybersecurity": return "🔐";
    case "Hardware": return "🔧";
    default: return "📁";
  }
}

function render(){
  grid.innerHTML = "";
  const term = q.value.trim().toLowerCase();
  const gradeFilter = grade.value.trim();
  let shown = 0;

  STUDENTS.forEach(s=>{
    const text = (s.name + " " + (s.projects||[]).map(p=> (p.title+" "+p.type+" "+(p.note||""))).join(" ")).toLowerCase();
    const matchesText = !term || text.includes(term);
    const matchesGrade = !gradeFilter || (s.grade && s.grade.toString() === gradeFilter);
    const matchesTags = activeTags.size === 0 || (
      [...activeTags].every(t=>{
        if(t==="featured") return !!s.featured;
        return (s.tags||[]).map(x=>x.toLowerCase()).includes(t);
      })
    );

    if(matchesText && matchesGrade && matchesTags){
      grid.appendChild(card(s));
      shown++;
    }
  });
  empty.style.display = shown ? "none" : "block";
}

q.addEventListener("input", render);
grade.addEventListener("change", render);
chips.addEventListener("click", (e)=>{
  const el = e.target.closest(".chip");
  if(!el) return;
  const tag = el.dataset.tag.toLowerCase();
  const active = el.getAttribute("data-active")==="true";
  if(active){ activeTags.delete(tag); el.setAttribute("data-active","false"); }
  else { activeTags.add(tag); el.setAttribute("data-active","true"); }
  render();
});

// Loading indicator
grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px 0; opacity:.7">Loading students…</div>';

async function loadStudents(){
  try{
    const res = await fetch('data/students.json', {cache:'no-store'});
    if(!res.ok) throw new Error(res.status+" "+res.statusText);
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('students.json must export an array');
    STUDENTS = data;
    render();
  }catch(err){
    console.error(err);
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px 0; color:#f78da7">Failed to load students.json<br><small>'+err.message+'</small></div>';
  }
}

loadStudents();
