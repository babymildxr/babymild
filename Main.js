// ใช้ข้อมูลตัวอย่างให้เปิดเว็บครั้งแรกแล้วมีโปรเจกต์ให้ทดลอง
const initialData = {
  profile: {
    name: "",
    year: "1",
    skills: "",
    bio: ""
  },

  projects: [
    {
      id: "project-1",
      title: "เว็บจองห้องอ่านหนังสือ",
      subject: "การพัฒนาเว็บไซต์เบื้องต้น",
      description:
        "หาเพื่อนช่วยทำเว็บเลือกห้องและเวลาจอง แบ่งหน้าที่กันทำหน้าเว็บ ออกแบบ และเอกสาร",
      skills: ["HTML", "CSS", "ออกแบบ UI"],
      slots: 2,
      owner: "มิน",
      isMine: false
    },
    {
      id: "project-2",
      title: "เว็บแจ้งของหายในมหาวิทยาลัย",
      subject: "โครงงานเบื้องต้น",
      description:
        "ทำเว็บลงประกาศของหายและของที่พบ อยากได้เพื่อนช่วยทำแบบฟอร์มกับออกแบบหน้ารายการ",
      skills: ["JavaScript", "Figma"],
      slots: 3,
      owner: "ต้น",
      isMine: false
    },
    {
      id: "project-3",
      title: "เว็บแนะนำร้านอาหารใกล้มหาวิทยาลัย",
      subject: "การออกแบบเว็บไซต์",
      description:
        "รวบรวมร้านอาหารสำหรับนักศึกษา ค้นหาตามชื่อร้านและช่วงราคา หาเพื่อนช่วยรวบรวมข้อมูลและทำหน้าเว็บ",
      skills: ["CSS", "ทำเอกสาร", "รวบรวมข้อมูล"],
      slots: 2,
      owner: "พลอย",
      isMine: false
    }
  ],

  requests: []
};

const STORAGE_KEY = "csi-team-v1";
let data = loadData();
let selectedProjectId = null;

// element ด้วย id ให้เขียนสั้นลง
const get = (id) => document.getElementById(id);

// ---------- 2. อ่านและบันทึกข้อมูล ----------
// localStorage เก็บข้อมูลไว้ในเบราว์เซอร์ ไม่ใช่ฐานข้อมูลส่วนกลาง
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed.profile &&
        Array.isArray(parsed.projects) &&
        Array.isArray(parsed.requests)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("อ่านข้อมูลเดิมไม่ได้ ใช้ข้อมูลตัวอย่างแทน", error);
  }

  return JSON.parse(JSON.stringify(initialData));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("บันทึกข้อมูลไม่ได้", error);
    return false;
  }
}

function showNotice(message) {
  get("notice").textContent = message;
}

function saveAndNotify(message) {
  const saved = saveData();
  showNotice(
    saved
      ? message
      : "ข้อมูลเปลี่ยนแล้ว แต่บันทึกถาวรไม่ได้ หากปิดหน้าเว็บข้อมูลอาจหาย"
  );
}

// สร้าง element โดยใช้ textContent
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

//  เปลี่ยนหน้า 
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.hidden = page.id !== pageId;
  });

  document.querySelectorAll("nav button").forEach((button) => {
    const active = button.dataset.page === pageId;
    button.classList.toggle("active", active);

    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  showNotice("");

  if (pageId === "projects") renderProjects();
  if (pageId === "requests") renderRequests();
  if (pageId === "manage") renderManage();
}

document.querySelectorAll("nav button").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelector(".logo").addEventListener("click", (event) => {
  event.preventDefault();
  showPage("projects");
});

//  แสดงกับค้นหาโปรเจกต์ 
function renderProjects() {
  const list = get("project-list");
  const keyword = get("search").value.trim().toLowerCase();

  const filtered = data.projects.filter((project) => {
    const searchableText = [
      project.title,
      project.subject,
      ...project.skills
    ].join(" ").toLowerCase();

    return searchableText.includes(keyword);
  });

  list.replaceChildren();
  get("project-count").textContent = `พบ ${filtered.length} โปรเจกต์`;

  if (filtered.length === 0) {
    list.append(
      makeElement("p", "empty", "ไม่พบโปรเจกต์ ลองเปลี่ยนคำค้นหา")
    );
    return;
  }

  filtered.forEach((project) => {
    const card = makeElement("article", "project-card", "");

    card.append(
      makeElement("p", "meta", project.subject),
      makeElement("h3", "", project.title),
      makeElement("p", "summary", project.description)
    );

    const tags = makeElement("div", "tags", "");
    project.skills.forEach((skill) => {
      tags.append(makeElement("span", "tag", skill));
    });

    card.append(
      tags,
      makeElement(
        "p",
        "meta",
        `โดย ${project.owner} · รับเพิ่ม ${project.slots} คน`
      )
    );

    const detailButton = makeElement(
      "button",
      "secondary",
      "ดูรายละเอียด"
    );
    detailButton.type = "button";
    detailButton.addEventListener("click", () => openDetails(project.id));

    card.append(detailButton);
    list.append(card);
  });
}

get("search").addEventListener("input", renderProjects);

// ---------- รายละเอียดและส่งคำขอ ----------
function openDetails(projectId) {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) return;

  selectedProjectId = projectId;

  get("detail-title").textContent = project.title;
  get("detail-meta").textContent =
    `${project.subject} · เจ้าของทีม: ${project.owner}`;
  get("detail-description").textContent = project.description;
  get("detail-slots").textContent = `ต้องการสมาชิกเพิ่ม ${project.slots} คน`;

  get("detail-skills").replaceChildren();
  project.skills.forEach((skill) => {
    get("detail-skills").append(makeElement("span", "tag", skill));
  });

  const alreadyRequested = data.requests.some(
    (request) => request.projectId === projectId
  );

  get("join-form").reset();
  get("join-form").hidden = project.isMine || alreadyRequested || project.slots <= 0;

  get("join-hint").textContent = project.isMine
    ? "นี่คือประกาศของคุณ"
    : alreadyRequested
      ? "คุณส่งคำขอเข้าร่วมโปรเจกต์นี้แล้ว"
      : "คำขอจะถูกบันทึกเป็นข้อมูลทดลองในเบราว์เซอร์นี้";

  get("detail-dialog").showModal();
}

get("close-dialog").addEventListener("click", () => {
  get("detail-dialog").close();
});

get("join-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!data.profile.name) {
    get("detail-dialog").close();
    showPage("profile");
    showNotice("กรุณาบันทึกชื่อในโปรไฟล์ก่อนส่งคำขอ");
    get("profile-name").focus();
    return;
  }

  const project = data.projects.find(
    (item) => item.id === selectedProjectId
  );

  if (!project || project.isMine || project.slots <= 0) return;

  const duplicate = data.requests.some(
    (request) => request.projectId === selectedProjectId
  );
  if (duplicate) return;

  const message = get("join-message").value.trim();
  if (!message) {
    get("join-message").focus();
    return;
  }

  data.requests.unshift({
    id: createId(),
    projectId: selectedProjectId,
    message,
    applicant: JSON.parse(JSON.stringify(data.profile)),
    status: "กำลังรอ",
    createdAt: new Date().toISOString()
  });

  get("detail-dialog").close();
  showPage("requests");
  saveAndNotify("บันทึกคำขอเข้าร่วมแล้ว");
});

// ---------- รายการคำขอและการยกเลิก ----------
function renderRequests() {
  const list = get("request-list");
  list.replaceChildren();

  if (data.requests.length === 0) {
    list.append(makeElement("p", "empty", "คุณยังไม่ได้ส่งคำขอเข้าร่วมทีม"));
    return;
  }

  data.requests.filter(r => !r.demoApplicant).forEach((request) => {
    const project = data.projects.find(
      (item) => item.id === request.projectId
    );
    if (!project) return;

    const card = makeElement("article", "panel", "");

    card.append(
      makeElement("h3", "", project.title),
      makeElement("p", "muted", `สถานะ: ${request.status}`),
      makeElement("p", "description", request.message)
    );

    const cancelButton = makeElement(
      "button",
      "secondary",
      request.status === "รับแล้ว" ? "ออกจากกลุ่ม" : "ยกเลิกคำขอ"
    );
    cancelButton.type = "button";

    cancelButton.addEventListener("click", () => {
      if (!confirm("ต้องการยกเลิกคำขอนี้ใช่ไหม?")) return;

      if (request.status === "รับแล้ว") project.slots += 1;
      data.requests = data.requests.filter(
        (item) => item.id !== request.id
      );

      renderRequests();
      saveAndNotify("ยกเลิกคำขอแล้ว");
    });

    if (request.status === "รับแล้ว") card.append(contactPanel("ติดต่อเจ้าของทีม", ownerContact(project)));
    else card.append(makeElement("p", "muted", "ข้อมูลติดต่อจะแสดงหลังรับเข้ากลุ่ม"));
    card.append(cancelButton);
    list.append(card);
  });
}

// ---------- สร้างประกาศ ----------
get("project-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!data.profile.name) {
    showPage("profile");
    showNotice("กรุณาบันทึกโปรไฟล์ก่อนสร้างประกาศ ข้อมูลประกาศยังอยู่");
    get("profile-name").focus();
    return;
  }

  const title = get("project-title").value.trim();
  const subject = get("project-subject").value.trim();
  const description = get("project-description").value.trim();


 // อ่านทักษะจากที่เลือก
  const skills = readSkills("project-skills");

  const slots = Number(get("project-slots").value);

  if (!title || !subject || !description || skills.length === 0) {
    showNotice("กรุณากรอกข้อมูลให้ครบ และอย่าใส่เฉพาะช่องว่าง");
    return;
  }

  if (!Number.isInteger(slots) || slots < 1 || slots > 20) {
    showNotice("จำนวนสมาชิกต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 20 คน");
    return;
  }

  data.projects.unshift({
    id: createId(),
    title,
    subject,
    description,
    skills,
    slots,
    owner: data.profile.name,
    isMine: true
  });

  get("project-form").reset();
  setSkills("project-skills", []);
  get("search").value = "";
  showPage("projects");
  saveAndNotify("สร้างประกาศเรียบร้อยแล้ว");
});

// ---------- โปรไฟล์ ----------
function fillProfileForm() {
  get("profile-name").value = data.profile.name;
  get("profile-year").value = data.profile.year;
  setSkills("profile-skills", data.profile.skills);
  ["facebook", "instagram", "phone"].forEach(key => get("profile-" + key).value = data.profile.contact?.[key] || "");
  get("profile-bio").value = data.profile.bio;
}

get("profile-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = get("profile-name").value.trim();

  if (!name) {
    showNotice("กรุณากรอกชื่อ");
    get("profile-name").focus();
    return;
  }

  data.profile = {
    name,
    year: get("profile-year").value,
    skills: readSkills("profile-skills"),
    contact: readContact(),
    bio: get("profile-bio").value.trim()
  };

  // เมื่อเปลี่ยนชื่อ ให้ชื่อเจ้าของประกาศเปลี่ยนตาม
  data.projects.forEach((project) => {
    if (project.isMine) project.owner = name;
  });

  saveAndNotify("บันทึกโปรไฟล์เรียบร้อยแล้ว");
});


// เลือกหลายทักษะด้วย checkbox และข้อมูลเก่าที่เป็นข้อความ
const skillChoices = ["HTML", "CSS", "JavaScript", "ออกแบบ UI", "Figma", "ฐานข้อมูล", "ทำเอกสาร", "นำเสนอ", "ทดสอบระบบ", "รวบรวมข้อมูล"];
function readSkills(id) { return [...get(id).querySelectorAll("input:checked")].map(el => el.value); }
function skillSummary(id) { get(id + "-summary").textContent = readSkills(id).join(", ") || "เลือกทักษะ (เลือกได้หลายอัน)"; }
function setSkills(id, value) {
 const values = Array.isArray(value) ? value : String(value || "").split(",").map(s => s.trim());
 get(id).replaceChildren();
 [...new Set([...skillChoices, ...values.filter(Boolean)])].forEach(skill => {
  const label = makeElement("label", "skill-option", "");
  const box = document.createElement("input"); box.type = "checkbox"; box.value = skill; box.checked = values.includes(skill);
  box.addEventListener("change", () => skillSummary(id));
  label.append(box, document.createTextNode(skill)); get(id).append(label);
 });
 skillSummary(id);
}
function readContact() {
 return Object.fromEntries(["facebook", "instagram", "phone"].map(key => [key, get("profile-" + key).value.trim()]));
}
// ข้อมูลตัวอย่างไม่ใช่บัญชีหรือเบอร์ของบุคคลจริง
function ownerContact(project) {
 return project.isMine ? data.profile.contact : (project.contact || {facebook: "ชื่อ Facebook ", instagram: "ชื่อ Instagram ", phone: "08X-XXX-XXXX "});
}
function contactPanel(title, contact = {}) {
 const box = makeElement("div", "contact-box", ""); box.append(makeElement("h3", "", title));
 [["facebook", "Facebook"], ["instagram", "Instagram"], ["phone", "เบอร์โทร"]].forEach(([key, label]) => {
  box.append(makeElement("p", "", label + ": " + (contact?.[key] || "ยังไม่ได้ระบุ")));
 });
 return box;
}
// เปลี่ยนสถานะได้เฉพาะคำขอที่ยังรอ เพื่อไม่ให้หักที่ว่างซ้ำ
function decideRequest(id, accept) {
 const request = data.requests.find(r => r.id === id);
 const project = data.projects.find(p => p.id === request?.projectId);
 if (!request || !project || ["รับแล้ว", "ปฏิเสธแล้ว"].includes(request.status)) return;
 if (accept && project.slots <= 0) { showNotice("ทีมเต็มแล้ว ไม่สามารถรับเพิ่มได้"); return; }
 request.status = accept ? "รับแล้ว" : "ปฏิเสธแล้ว";
 if (accept) project.slots -= 1;
 renderManage(); saveAndNotify(accept ? "รับเข้ากลุ่มแล้ว เปิดข้อมูลติดต่อให้ทั้งสองฝ่าย" : "ปฏิเสธคำขอแล้ว");
}
function renderManage() {
 const list = get("manage-list"); list.replaceChildren();
 if (!data.requests.length) list.append(makeElement("p", "empty", "ยังไม่มีคำขอ ลองสมัครทีม หรือสร้างประกาศแล้วเพิ่มผู้สมัครตัวอย่าง"));
 data.requests.forEach(request => {
  const project = data.projects.find(p => p.id === request.projectId); if (!project) return;
  const applicant = request.demoApplicant ? request.applicant : data.profile;
  const card = makeElement("article", "panel", "");
  card.append(makeElement("h3", "", project.title), makeElement("p", "", "ผู้สมัคร: " + (applicant?.name || "ผู้สมัครเดิม")), makeElement("p", "", "ทักษะ: " + (Array.isArray(applicant?.skills) ? applicant.skills.join(", ") : applicant?.skills || "ยังไม่ระบุ")), makeElement("p", "description", request.message), makeElement("p", "", "สถานะ: " + request.status));
  if (request.status === "รับแล้ว") {
   card.append(contactPanel("ติดต่อสมาชิก", applicant?.contact), contactPanel("ติดต่อเจ้าของทีม", ownerContact(project)));
  } else if (request.status !== "ปฏิเสธแล้ว") {
   card.append(makeElement("p", "muted", "ข้อมูลติดต่อยังไม่เปิดเผย รอตอบรับเข้ากลุ่ม"));
   const actions = makeElement("div", "actions", "");
   [[true, "รับเข้ากลุ่ม"], [false, "ปฏิเสธ"]].forEach(([accept, label]) => {
    const button = makeElement("button", accept ? "primary" : "secondary", label); button.type = "button";
    button.disabled = accept && project.slots <= 0;
    button.addEventListener("click", () => decideRequest(request.id, accept)); actions.append(button);
   }); card.append(actions);
  }
  list.append(card);
 });
}
get("demo-request").addEventListener("click", () => {
 const project = data.projects.find(p => p.isMine && p.slots > 0);
 if (!project) { showNotice("สร้างประกาศของคุณที่ยังมีที่ว่างก่อน แล้วกลับมากดปุ่มนี้"); return; }
 if (data.requests.some(r => r.demoApplicant && r.projectId === project.id)) { showNotice("ประกาศนี้มีผู้สมัครตัวอย่างแล้ว"); return; }
 data.requests.push({id: createId(), projectId: project.id, demoApplicant: true, message: "อยากช่วยออกแบบและทำหน้าเว็บครับ", status: "กำลังรอ", applicant: {name: "เพื่อนตัวอย่าง", skills: ["HTML", "Figma"], contact: {facebook: "Facebook ตัวอย่าง", instagram: "Instagram ตัวอย่าง", phone: "08X-XXX-XXXX (ตัวอย่าง)"}}});
 renderManage(); saveAndNotify("เพิ่มผู้สมัครตัวอย่างแล้ว ลองกดรับเข้ากลุ่ม");
});
// ต้นแบบนี้ซ่อนข้อมูลด้วยสถานะในหน้าเว็บเท่านั้น ระบบจริงต้องตรวจสิทธิ์ที่เซิร์ฟเวอร์
setSkills("project-skills", []);

// ----------เริ่มทำงานเมื่อเปิดเว็บ ----------
fillProfileForm();
showPage("projects");