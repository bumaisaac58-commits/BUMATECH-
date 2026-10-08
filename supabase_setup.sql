/* =========================================
 BUMATECH - APP.JS
   Main Supabase Application Controller
   ========================================= */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URLhttps://kgibditegnkghtvcmilc.supabase.co/rest/v1/
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaWJkaXRlZ25rZ2h0dmNtaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTkyMDUsImV4cCI6MjEwNjQzNTIwNX0.XE5j1guWFYnz6SwftIPFAh7lkFUVa8D5dXKkeuuNkPs
const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================
   CHECK LOGIN
   ========================================= */

async function checkLogin() {

    const {
        data: {
            session
        },
        error
    } = await db.auth.getSession();

    if (error) {
        console.error("Session error:", error);
        return null;
    }

    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    return session;
}


/* =========================================
   GET CURRENT USER
   ========================================= */

async function getCurrentUser() {

    const {
        data: {
            user
        },
        error
    } = await db.auth.getUser();

    if (error) {
        console.error("User error:", error);
        return null;
    }

    return user;
}


/* =========================================
   GET CURRENT SCHOOL
   ========================================= */

async function getCurrentSchool() {

    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const {
        data,
        error
    } = await db
        .from("schools")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1);

    if (error) {

        console.error(
            "School loading error:",
            error
        );

        return null;
    }

    if (!data || data.length === 0) {
        return null;
    }

    return data[0];
}


/* =========================================
   LOGOUT
   ========================================= */

async function logout() {

    const {
        error
    } = await db.auth.signOut();

    if (error) {

        alert(
            "Logout failed: " +
            error.message
        );

        return;
    }

    window.location.href =
        "login.html";
}


/* =========================================
   GO TO PAGE
   ========================================= */

function goTo(page) {

    window.location.href = page;

}


/* =========================================
   DASHBOARD
   ========================================= */

async function loadDashboard() {

    const session =
        await checkLogin();

    if (!session) {
        return;
    }

    const school =
        await getCurrentSchool();

    if (!school) {

        console.log(
            "No school registered yet."
        );

        return;
    }

    const schoolName =
        document.getElementById(
            "schoolName"
        );

    if (schoolName) {

        schoolName.textContent =
            school.name || "My School";
    }


    const schoolCode =
        document.getElementById(
            "schoolCode"
        );

    if (schoolCode) {

        schoolCode.textContent =
            school.code || "";
    }


    await loadDashboardStatistics(
        school.id
    );
}


/* =========================================
   DASHBOARD STATISTICS
   ========================================= */

async function loadDashboardStatistics(
    schoolId
) {

    /* STUDENTS */

    const {
        count: studentCount,
        error: studentError
    } = await db
        .from("students")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "school_id",
            schoolId
        );


    if (!studentError) {

        const element =
            document.getElementById(
                "studentCount"
            );

        if (element) {

            element.textContent =
                studentCount || 0;
        }
    }


    /* TEACHERS */

    const {
        count: teacherCount
    } = await db
        .from("teachers")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "school_id",
            schoolId
        );


    const teacherElement =
        document.getElementById(
            "teacherCount"
        );

    if (teacherElement) {

        teacherElement.textContent =
            teacherCount || 0;
    }


    /* CLASSES */

    const {
        count: classCount
    } = await db
        .from("school_classes")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "school_id",
            schoolId
        );


    const classElement =
        document.getElementById(
            "classCount"
        );

    if (classElement) {

        classElement.textContent =
            classCount || 0;
    }


    /* SUBJECTS */

    const {
        count: subjectCount
    } = await db
        .from("school_subjects")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "school_id",
            schoolId
        );


    const subjectElement =
        document.getElementById(
            "subjectCount"
        );

    if (subjectElement) {

        subjectElement.textContent =
            subjectCount || 0;
    }

}


/* =========================================
   OPEN STUDENTS
   ========================================= */

function openStudents() {

    window.location.href =
        "students.html";
}


/* =========================================
   OPEN TEACHERS
   ========================================= */

function openTeachers() {

    window.location.href =
        "teachers.html";
}


/* =========================================
   OPEN CLASSES
   ========================================= */

function openClasses() {

    window.location.href =
        "classes.html";
}


/* =========================================
   OPEN SUBJECTS
   ========================================= */

function openSubjects() {

    window.location.href =
        "subjects.html";
}


/* =========================================
   OPEN SETUP WIZARD
   ========================================= */

function openSetupWizard() {

    window.location.href =
        "setup-wizard.html";
}


/* =========================================
   OPEN SCHOOL SETTINGS
   ========================================= */

function openSchoolSettings() {

    window.location.href =
        "school-settings.html";
}


/* =========================================
   PAGE START
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const page =
            window.location.pathname;

        /*
         * Run dashboard functions only
         * when dashboard elements exist.
         */

        if (
            document.getElementById(
                "studentCount"
            ) ||
            document.getElementById(
                "schoolName"
            )
        ) {

            await loadDashboard();

        }

    }
);