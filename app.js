/* MwalimuEase Setup Wizard
   1. Replace SUPABASE_URL and SUPABASE_ANON_KEY below.
   2. Run supabase_setup.sql in your Supabase SQL Editor.
*/
const SUPABASE_URL = "https://kgibditegnkghtvcmilc.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaWJkaXRlZ25rZ2h0dmNtaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTkyMDUsImV4cCI6MjEwNjQzNTIwNX0.XE5j1guWFYnz6SwftIPFAh7lkFUVa8D5dXKkeuuNkPs";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const subjects = [
  "English","Kiswahili","Mathematics","Science & Technology","Environmental Activities",
  "Creative Arts & Sports","Social Studies","Religious Education","Agriculture","Home Science",
  "Computer Studies","Life Skills","Integrated Science","Pre-Technical Studies","Business Studies",
  "Health Education","Music","Art & Craft","Physical Education","Christian Religious Education",
  "Islamic Religious Education","Hindu Religious Education","French","German","Arabic"
];

let step = 1, user = null, schoolId = null;
const state = JSON.parse(localStorage.getItem("mwalimuease_setup") || "{}");

const $ = id => document.getElementById(id);
const val = id => $(id)?.value?.trim() || "";
function setMessage(text, type=""){ const el=$("message"); el.textContent=text; el.className=`message ${type}`; el.classList.remove("hidden"); }
function clearMessage(){ $("message").classList.add("hidden"); }

function initSubjects(){
  $("subjectOptions").innerHTML = subjects.map(s => `<label class="subject-item"><input type="checkbox" value="${s}"> <span>${s}</span></label>`).join("");
  $("subjectSearch").addEventListener("input", e=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll(".subject-item").forEach(x=>x.classList.toggle("hidden",!x.textContent.toLowerCase().includes(q)));
  });
  $("selectAllSubjects").onclick=()=>{
    document.querySelectorAll("#subjectOptions .subject-item:not(.hidden) input").forEach(x=>x.checked=true);
  };
}
function selectedGrades(){ return [...document.querySelectorAll("#gradeOptions input:checked")].map(x=>x.value); }
function selectedSubjects(){ return [...document.querySelectorAll("#subjectOptions input:checked")].map(x=>x.value); }

function collect(){
  return {
    school:{name:val("schoolName"),code:val("schoolCode"),knec_code:val("knecCode"),school_type:val("schoolType"),county:val("county"),sub_county:val("subCounty"),category:val("category"),attendance_type:val("attendanceType"),motto:val("motto")},
    structure:{grades:selectedGrades(),academic_year:Number(val("academicYear")||new Date().getFullYear()),stream_count:Number(val("streamCount")||1)},
    subjects:selectedSubjects(),
    admin:{name:val("adminName"),role:val("adminRole"),phone:val("adminPhone"),email:val("adminEmail")},
    academics:{assessment_system:val("assessmentSystem"),grading_scale:val("gradingScale"),terms_per_year:Number(val("termsPerYear")||3),lessons_per_day:Number(val("lessonsPerDay")||13),start_time:val("startTime"),end_time:val("endTime"),enable_timetable:$("enableTimetable").checked,enable_sms:$("enableSms").checked},
    administration:{currency:val("currency"),fees_mode:val("feesMode"),parent_portal:val("parentPortal"),boarding_mode:val("boardingMode")}
  };
}
function restore(){
  if(!state.school) return;
  const s=state.school;
  const map={schoolName:"name",schoolCode:"code",knecCode:"knec_code",schoolType:"school_type",county:"county",subCounty:"sub_county",category:"category",attendanceType:"attendance_type",motto:"motto"};
  Object.entries(map).forEach(([id,k])=>{if(s[k]!==undefined) $(id).value=s[k]});
  if(state.structure){
    $("academicYear").value=state.structure.academic_year||2026; $("streamCount").value=state.structure.stream_count||1;
    document.querySelectorAll("#gradeOptions input").forEach(x=>x.checked=state.structure.grades?.includes(x.value));
  }
  if(state.subjects) document.querySelectorAll("#subjectOptions input").forEach(x=>x.checked=state.subjects.includes(x.value));
  if(state.admin) Object.entries({adminName:"name",adminRole:"role",adminPhone:"phone",adminEmail:"email"}).forEach(([id,k])=>{if(state.admin[k]!==undefined)$(id).value=state.admin[k]});
  if(state.academics){const a=state.academics;Object.entries({assessmentSystem:"assessment_system",gradingScale:"grading_scale",termsPerYear:"terms_per_year",lessonsPerDay:"lessons_per_day",startTime:"start_time",endTime:"end_time"}).forEach(([id,k])=>{if(a[k]!==undefined)$(id).value=a[k]});$("enableTimetable").checked=a.enable_timetable!==false;$("enableSms").checked=!!a.enable_sms}
  if(state.administration){const a=state.administration;Object.entries({currency:"currency",feesMode:"fees_mode",parentPortal:"parent_portal",boardingMode:"boarding_mode"}).forEach(([id,k])=>{if(a[k]!==undefined)$(id).value=a[k]})}
}
function saveLocal(){ localStorage.setItem("mwalimuease_setup",JSON.stringify(collect())); setMessage("Progress saved on this device.","success"); }
function render(){
  document.querySelectorAll("[data-panel]").forEach(x=>x.classList.toggle("hidden",Number(x.dataset.panel)!==step));
  document.querySelectorAll(".step").forEach(x=>{const n=Number(x.dataset.step);x.classList.toggle("active",n===step);x.classList.toggle("done",n<step)});
  $("backBtn").disabled=step===1;
  $("nextBtn").textContent=step===7?"Create School ✓":"Continue →";
  $("progressLabel").textContent=`Step ${step} of 7`;
  $("progressPercent").textContent=`${Math.round(step/7*100)}%`;
  $("progressBar").style.width=`${step/7*100}%`;
  if(step===7) buildReview();
}
function buildReview(){
  const d=collect(), rows=[
    ["School",`${d.school.name} (${d.school.code})`],["Location",`${d.school.county||"—"} / ${d.school.sub_county||"—"}`],
    ["School type",d.school.school_type],["Classes",d.structure.grades.join(", ")||"None selected"],
    ["Subjects",`${d.subjects.length} selected`],["Administrator",d.admin.name||"Not entered"],
    ["Academic year",d.structure.academic_year],["Assessment",d.academics.assessment_system],
    ["Lessons per day",d.academics.lessons_per_day],["Parent portal",d.administration.parent_portal]
  ];
  $("review").innerHTML=rows.map(r=>`<div class="review-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
}
function validateCurrent(){
  if(step===1 && (!val("schoolName")||!val("schoolCode"))){setMessage("School name and school code are required.","error");return false}
  if(step===2 && !selectedGrades().length){setMessage("Select at least one class/grade.","error");return false}
  if(step===4 && !val("adminName")){setMessage("Enter the administrator's name.","error");return false}
  return true;
}
async function ensureUser(){
  if(SUPABASE_URL.startsWith("YOUR_")) throw new Error("Open app.js and enter your Supabase project URL and anon key first.");
  const {data,error}=await db.auth.getUser(); if(error)throw error;
  if(!data.user) throw new Error("Please log in to MwalimuEase before opening the setup wizard.");
  user=data.user;
}
async function saveSchool(){
  const d=collect();
  $("nextBtn").disabled=true; $("nextBtn").textContent="Creating school...";
  try{
    const {data:school,error}=await db.from("schools").insert({
      name:d.school.name,code:d.school.code.toUpperCase(),knec_code:d.school.knec_code||null,
      school_type:d.school.school_type,county:d.school.county||null,sub_county:d.school.sub_county||null,
      category:d.school.category,attendance_type:d.school.attendance_type,motto:d.school.motto||null,
      owner_id:user.id,setup_complete:false
    }).select().single();
    if(error) throw error;
    schoolId=school.id;

    const grades=d.structure.grades.map(name=>({school_id:schoolId,name,academic_year:d.structure.academic_year,stream_count:d.structure.stream_count}));
    if(grades.length){const r=await db.from("school_classes").insert(grades);if(r.error)throw r.error}
    const subs=d.subjects.map(name=>({school_id:schoolId,name,active:true}));
    if(subs.length){const r=await db.from("school_subjects").insert(subs);if(r.error)throw r.error}

    const settings={school_id:schoolId,assessment_system:d.academics.assessment_system,grading_scale:d.academics.grading_scale,terms_per_year:d.academics.terms_per_year,lessons_per_day:d.academics.lessons_per_day,start_time:d.academics.start_time,end_time:d.academics.end_time,enable_timetable:d.academics.enable_timetable,enable_sms:d.academics.enable_sms,currency:d.administration.currency,fees_mode:d.administration.fees_mode,parent_portal:d.administration.parent_portal,boarding_mode:d.administration.boarding_mode};
    const sr=await db.from("school_settings").insert(settings); if(sr.error)throw sr.error;

    const mr=await db.from("school_members").insert({school_id:schoolId,user_id:user.id,full_name:d.admin.name,phone:d.admin.phone||null,role:d.admin.role,is_owner:true});
    if(mr.error)throw mr.error;

    const up=await db.from("schools").update({setup_complete:true}).eq("id",schoolId); if(up.error)throw up.error;
    localStorage.removeItem("mwalimuease_setup");
    document.querySelectorAll("[data-panel]").forEach(x=>x.classList.add("hidden"));
    document.querySelector('[data-panel="7"]').classList.remove("hidden");
    document.querySelector('[data-panel="7"] .card-heading h2').textContent="School created successfully!";
    $("review").innerHTML=`<div class="success-box">🎉 <b>${d.school.name}</b> is now registered in MwalimuEase.<br><br>School code: <b>${d.school.code.toUpperCase()}</b><br>School ID: <b>${schoolId}</b><br><br>You can now connect your dashboard to this school and start adding learners, teachers, parents and fees.</div>`;
    $("backBtn").disabled=true;$("saveBtn").disabled=true;$("nextBtn").textContent="Go to Dashboard";$("nextBtn").onclick=()=>location.href="dashboard.html";
  }catch(e){setMessage(e.message||"Could not create school.","error");$("nextBtn").disabled=false;$("nextBtn").textContent="Create School ✓"}
}
$("nextBtn").onclick=async()=>{clearMessage();if(step<7){if(!validateCurrent())return;saveLocal();step++;render()}else{await saveSchool()}};
$("backBtn").onclick=()=>{if(step>1){step--;render();clearMessage()}};
$("saveBtn").onclick=saveLocal;
document.querySelectorAll(".step").forEach(btn=>btn.addEventListener("click",()=>{const n=Number(btn.dataset.step);if(n<step){step=n;render()}}));
$("logoutBtn").onclick=async()=>{await db.auth.signOut();location.href="login.html"};
$("logoFile").addEventListener("change",e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=()=>{$("logoPreview").innerHTML=`<img src="${r.result}">`};r.readAsDataURL(f)}});
(async()=>{try{initSubjects();restore();await ensureUser();if(!val("adminEmail"))$("adminEmail").value=user.email||"";render()}catch(e){setMessage(e.message||"Unable to initialize setup wizard.","error");$("nextBtn").disabled=true}})();
