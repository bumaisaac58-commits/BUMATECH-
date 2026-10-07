/* BUMATECH Setup Wizard
   1. Set SUPABASE_URL and SUPABASE_ANON_KEY below.
   2. Run supabase_setup.sql in your Supabase SQL Editor.
*/
const SUPABASE_URL = "https://kgibditegnkghtvcmilc.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaWJkaXRlZ25rZ2h0dmNtaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTkyMDUsImV4cCI6MjEwNjQzNTIwNX0.XE5j1guWFYnz6SwftIPFAh7lkFUVa8D5dXKkeuuNkPs";

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const db = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const subjects = [
  "English", "Kiswahili", "Mathematics", "Science & Technology", "Environmental Activities",
  "Creative Arts & Sports", "Social Studies", "Religious Education", "Agriculture", "Home Science",
  "Computer Studies", "Life Skills", "Integrated Science", "Pre-Technical Studies", "Business Studies",
  "Health Education", "Music", "Art & Craft", "Physical Education", "Christian Religious Education",
  "Islamic Religious Education", "Hindu Religious Education", "French", "German", "Arabic"
];

let step = 1;
let user = null;
let schoolId = null;
const state = JSON.parse(localStorage.getItem("BUMATECH_setup") || "{}");

const $ = id => document.getElementById(id);
const val = id => $(id)?.value?.trim() || "";

function setMessage(text, type = "") {
  const el = $("message");
  el.textContent = text;
  el.className = `message ${type}`;
  el.classList.remove("hidden");
}

function clearMessage() {
  $("message").classList.add("hidden");
}

function initSubjects() {
  $("subjectOptions").innerHTML = subjects
    .map(subject => `<label class="subject-item"><input type="checkbox" value="${subject}"> <span>${subject}</span></label>`)
    .join("");

  $("subjectSearch").addEventListener("input", event => {
    const query = event.target.value.toLowerCase();
    document.querySelectorAll(".subject-item").forEach(item => {
      item.classList.toggle("hidden", !item.textContent.toLowerCase().includes(query));
    });
  });

  $("selectAllSubjects").onclick = () => {
    document.querySelectorAll("#subjectOptions .subject-item:not(.hidden) input")
      .forEach(input => { input.checked = true; });
  };
}

function selectedGrades() {
  return [...document.querySelectorAll("#gradeOptions input:checked")].map(input => input.value);
}

function selectedSubjects() {
  return [...document.querySelectorAll("#subjectOptions input:checked")].map(input => input.value);
}

function collect() {
  return {
    school: {
      name: val("schoolName"), code: val("schoolCode"), knec_code: val("knecCode"),
      school_type: val("schoolType"), county: val("county"), sub_county: val("subCounty"),
      category: val("category"), attendance_type: val("attendanceType"), motto: val("motto")
    },
    structure: {
      grades: selectedGrades(),
      academic_year: Number(val("academicYear") || new Date().getFullYear()),
      stream_count: Number(val("streamCount") || 1)
    },
    subjects: selectedSubjects(),
    admin: {
      name: val("adminName"), role: val("adminRole"), phone: val("adminPhone"), email: val("adminEmail")
    },
    academics: {
      assessment_system: val("assessmentSystem"), grading_scale: val("gradingScale"),
      terms_per_year: Number(val("termsPerYear") || 3),
      lessons_per_day: Number(val("lessonsPerDay") || 13),
      start_time: val("startTime"), end_time: val("endTime"),
      enable_timetable: $("enableTimetable").checked, enable_sms: $("enableSms").checked
    },
    administration: {
      currency: val("currency"), fees_mode: val("feesMode"),
      parent_portal: val("parentPortal"), boarding_mode: val("boardingMode")
    }
  };
}

function restore() {
  if (!state.school) return;

  const school = state.school;
  const schoolFields = {
    schoolName: "name", schoolCode: "code", knecCode: "knec_code", schoolType: "school_type",
    county: "county", subCounty: "sub_county", category: "category",
    attendanceType: "attendance_type", motto: "motto"
  };
  Object.entries(schoolFields).forEach(([id, key]) => {
    if (school[key] !== undefined) $(id).value = school[key];
  });

  if (state.structure) {
    $("academicYear").value = state.structure.academic_year || 2026;
    $("streamCount").value = state.structure.stream_count || 1;
    document.querySelectorAll("#gradeOptions input").forEach(input => {
      input.checked = state.structure.grades?.includes(input.value);
    });
  }

  if (state.subjects) {
    document.querySelectorAll("#subjectOptions input").forEach(input => {
      input.checked = state.subjects.includes(input.value);
    });
  }

  if (state.admin) {
    const adminFields = { adminName: "name", adminRole: "role", adminPhone: "phone", adminEmail: "email" };
    Object.entries(adminFields).forEach(([id, key]) => {
      if (state.admin[key] !== undefined) $(id).value = state.admin[key];
    });
  }

  if (state.academics) {
    const academics = state.academics;
    const academicFields = {
      assessmentSystem: "assessment_system", gradingScale: "grading_scale",
      termsPerYear: "terms_per_year", lessonsPerDay: "lessons_per_day",
      startTime: "start_time", endTime: "end_time"
    };
    Object.entries(academicFields).forEach(([id, key]) => {
      if (academics[key] !== undefined) $(id).value = academics[key];
    });
    $("enableTimetable").checked = academics.enable_timetable !== false;
    $("enableSms").checked = !!academics.enable_sms;
  }

  if (state.administration) {
    const administrationFields = {
      currency: "currency", feesMode: "fees_mode", parentPortal: "parent_portal", boardingMode: "boarding_mode"
    };
    Object.entries(administrationFields).forEach(([id, key]) => {
      if (state.administration[key] !== undefined) $(id).value = state.administration[key];
    });
  }
}

function saveLocal() {
  localStorage.setItem("mwalimuease_setup", JSON.stringify(collect()));
  setMessage("Progress saved on this device.", "success");
}

function render() {
  document.querySelectorAll("[data-panel]").forEach(panel => {
    panel.classList.toggle("hidden", Number(panel.dataset.panel) !== step);
  });
  document.querySelectorAll(".step").forEach(item => {
    const number = Number(item.dataset.step);
    item.classList.toggle("active", number === step);
    item.classList.toggle("done", number < step);
  });
  $("backBtn").disabled = step === 1;
  $("nextBtn").textContent = step === 7 ? "Create School ✓" : "Continue →";
  $("progressLabel").textContent = `Step ${step} of 7`;
  $("progressPercent").textContent = `${Math.round(step / 7 * 100)}%`;
  $("progressBar").style.width = `${step / 7 * 100}%`;
  if (step === 7) buildReview();
}

function buildReview() {
  const data = collect();
  const rows = [
    ["School", `${data.school.name} (${data.school.code})`],
    ["Location", `${data.school.county || "—"} / ${data.school.sub_county || "—"}`],
    ["School type", data.school.school_type],
    ["Classes", data.structure.grades.join(", ") || "None selected"],
    ["Subjects", `${data.subjects.length} selected`],
    ["Administrator", data.admin.name || "Not entered"],
    ["Academic year", data.structure.academic_year],
    ["Assessment", data.academics.assessment_system],
    ["Lessons per day", data.academics.lessons_per_day],
    ["Parent portal", data.administration.parent_portal]
  ];
  $("review").innerHTML = rows
    .map(row => `<div class="review-row"><span>${row[0]}</span><b>${row[1]}</b></div>`)
    .join("");
}

function validateCurrent() {
  if (step === 1 && (!val("schoolName") || !val("schoolCode"))) {
    setMessage("School name and school code are required.", "error");
    return false;
  }
  if (step === 2 && !selectedGrades().length) {
    setMessage("Select at least one class/grade.", "error");
    return false;
  }
  if (step === 4 && !val("adminName")) {
    setMessage("Enter the administrator's name.", "error");
    return false;
  }
  return true;
}

async function ensureUser() {
  if (SUPABASE_URL.startsWith("YOUR_") || SUPABASE_ANON_KEY.startsWith("YOUR_")) {
    throw new Error("Open app.js and enter your Supabase project URL and anon key first.");
  }
  const { data, error } = await db.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Please log in to MwalimuEase before opening the setup wizard.");
  user = data.user;
}

async function saveSchool() {
  const data = collect();
  $("nextBtn").disabled = true;
  $("nextBtn").textContent = "Creating school...";

  try {
    const { data: school, error } = await db.from("schools").insert({
      name: data.school.name,
      code: data.school.code.toUpperCase(),
      knec_code: data.school.knec_code || null,
      school_type: data.school.school_type,
      county: data.school.county || null,
      sub_county: data.school.sub_county || null,
      category: data.school.category,
      attendance_type: data.school.attendance_type,
      motto: data.school.motto || null,
      owner_id: user.id,
      setup_complete: false
    }).select().single();
    if (error) throw error;
    schoolId = school.id;

    const grades = data.structure.grades.map(name => ({
      school_id: schoolId,
      name,
      academic_year: data.structure.academic_year,
      stream_count: data.structure.stream_count
    }));
    if (grades.length) {
      const result = await db.from("school_classes").insert(grades);
      if (result.error) throw result.error;
    }

    const selectedSubjectsData = data.subjects.map(name => ({ school_id: schoolId, name, active: true }));
    if (selectedSubjectsData.length) {
      const result = await db.from("school_subjects").insert(selectedSubjectsData);
      if (result.error) throw result.error;
    }

    const settings = {
      school_id: schoolId,
      assessment_system: data.academics.assessment_system,
      grading_scale: data.academics.grading_scale,
      terms_per_year: data.academics.terms_per_year,
      lessons_per_day: data.academics.lessons_per_day,
      start_time: data.academics.start_time,
      end_time: data.academics.end_time,
      enable_timetable: data.academics.enable_timetable,
      enable_sms: data.academics.enable_sms,
      currency: data.administration.currency,
      fees_mode: data.administration.fees_mode,
      parent_portal: data.administration.parent_portal,
      boarding_mode: data.administration.boarding_mode
    };
    const settingsResult = await db.from("school_settings").insert(settings);
    if (settingsResult.error) throw settingsResult.error;

    const memberResult = await db.from("school_members").insert({
      school_id: schoolId,
      user_id: user.id,
      full_name: data.admin.name,
      phone: data.admin.phone || null,
      role: data.admin.role,
      is_owner: true
    });
    if (memberResult.error) throw memberResult.error;

    const updateResult = await db.from("schools").update({ setup_complete: true }).eq("id", schoolId);
    if (updateResult.error) throw updateResult.error;

    localStorage.removeItem("mwalimuease_setup");
    document.querySelectorAll("[data-panel]").forEach(panel => panel.classList.add("hidden"));
    document.querySelector('[data-panel="7"]').classList.remove("hidden");
    document.querySelector('[data-panel="7"] .card-heading h2').textContent = "School created successfully!";
    $("review").innerHTML = `<div class="success-box">🎉 <b>${data.school.name}</b> is now registered in BUMATECH.<br><br>School code: <b>${data.school.code.toUpperCase()}</b><br>School ID: <b>${schoolId}</b><br><br>You can now connect your dashboard to this school and start adding learners, teachers, parents and fees.</div>`;
    $("backBtn").disabled = true;
    $("saveBtn").disabled = true;
    $("nextBtn").textContent = "Go to Dashboard";
    $("nextBtn").onclick = () => { location.href = "dashboard.html"; };
  } catch (error) {
    setMessage(error.message || "Could not create school.", "error");
    $("nextBtn").disabled = false;
    $("nextBtn").textContent = "Create School ✓";
  }
}

$("nextBtn").onclick = async () => {
  clearMessage();
  if (step < 7) {
    if (!validateCurrent()) return;
    saveLocal();
    step++;
    render();
  } else {
    await saveSchool();
  }
};

$("backBtn").onclick = () => {
  if (step > 1) {
    step--;
    render();
    clearMessage();
  }
};

$("saveBtn").onclick = saveLocal;
document.querySelectorAll(".step").forEach(button => {
  button.addEventListener("click", () => {
    const number = Number(button.dataset.step);
    if (number < step) {
      step = number;
      render();
    }
  });
});

$("logoutBtn").onclick = async () => {
  await db.auth.signOut();
  location.href = "login.html";
};

$("logoFile").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { $("logoPreview").innerHTML = `<img src="${reader.result}">`; };
  reader.readAsDataURL(file);
});

(async () => {
  try {
    initSubjects();
    restore();
    await ensureUser();
    if (!val("adminEmail")) $("adminEmail").value = user.email || "";
    render();
  } catch (error) {
    setMessage(error.message || "Unable to initialize setup wizard.", "error");
    $("nextBtn").disabled = true;
  }
})();
