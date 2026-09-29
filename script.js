/* =========================================================
   ABSENSIKU - SISTEM ABSENSI KURSUS
   Versi Lokal
   ========================================================= */


/* =========================================================
   DATA AWAL
   ========================================================= */

const STORAGE_KEY = "absensiku_data";

const TEACHER_PIN = "123456";

let selectedAttendance = "Hadir";
let currentStudent = null;
let teacherLoggedIn = false;


/* =========================================================
   DATA DEFAULT
   ========================================================= */

const defaultData = {
    students: [
        {
            id: 1,
            code: "SISWA001",
            name: "Budi Santoso",
            packageSize: 4,
            packageStart: getTodayKey(),
            active: true
        },
        {
            id: 2,
            code: "SISWA002",
            name: "Siti Aminah",
            packageSize: 8,
            packageStart: getTodayKey(),
            active: true
        },
        {
            id: 3,
            code: "SISWA003",
            name: "Andi Pratama",
            packageSize: 4,
            packageStart: getTodayKey(),
            active: true
        }
    ],

    attendance: [],

    payments: []
};


/* =========================================================
   AMBIL DATA
   ========================================================= */

function getData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultData)
        );

        return JSON.parse(
            JSON.stringify(defaultData)
        );
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Data rusak:",
            error
        );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultData)
        );

        return JSON.parse(
            JSON.stringify(defaultData)
        );
    }
}


/* =========================================================
   SIMPAN DATA
   ========================================================= */

function saveData(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* =========================================================
   ID
   ========================================================= */

function generateId() {

    return Date.now() +
        Math.floor(
            Math.random() * 1000
        );
}


/* =========================================================
   TANGGAL
   ========================================================= */

function getTodayKey() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================================
   FORMAT TANGGAL
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


/* =========================================================
   FORMAT WAKTU
   ========================================================= */

function formatTime(dateTime) {

    const date = new Date(dateTime);

    return date.toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   CEK JUMLAH ABSENSI
   ========================================================= */

function getStudentAttendance(student) {

    const data = getData();

    return data.attendance.filter(
        item =>

            item.studentId === student.id &&

            item.date >= student.packageStart &&

            (
                item.status === "Hadir" ||
                item.status === "Terlambat"
            )
    );
}


/* =========================================================
   CEK ABSEN HARI INI
   ========================================================= */

function hasAttendanceToday(studentId) {

    const data = getData();

    const today = getTodayKey();

    return data.attendance.some(
        item =>

            item.studentId === studentId &&
            item.date === today
    );
}


/* =========================================================
   STATUS PAKET
   ========================================================= */

function getPackageStatus(student) {

    const total =
        getStudentAttendance(student).length;

    if (total >= student.packageSize) {

        return "SELESAI";
    }

    return "AKTIF";
}


/* =========================================================
   LOGIN SISWA
   ========================================================= */

function loginStudent() {

    const input =
        document.getElementById(
            "studentCode"
        );

    const message =
        document.getElementById(
            "loginMessage"
        );

    const code =
        input.value
            .trim()
            .toUpperCase();

    if (!code) {

        showMessage(
            message,
            "Masukkan kode siswa terlebih dahulu.",
            "error"
        );

        return;
    }


    const data = getData();

    const student =
        data.students.find(
            item =>
                item.code.toUpperCase() === code &&
                item.active !== false
        );


    if (!student) {

        showMessage(
            message,
            "Kode siswa tidak ditemukan.",
            "error"
        );

        return;
    }


    currentStudent = student;

    input.value = "";

    message.innerHTML = "";

    showStudentDashboard();
}


/* =========================================================
   TAMPILKAN DASHBOARD SISWA
   ========================================================= */

function showStudentDashboard() {

    document
        .getElementById(
            "studentDashboard"
        )
        .classList.remove("hidden");


    const student =
        getCurrentStudent();


    if (!student) {
        return;
    }


    document.getElementById(
        "studentName"
    ).textContent =
        student.name;


    document.getElementById(
        "studentCodeDisplay"
    ).textContent =
        student.code;


    document.getElementById(
        "packageTotal"
    ).textContent =
        student.packageSize;


    const attendance =
        getStudentAttendance(student);


    const total =
        attendance.length;


    const remaining =
        Math.max(
            student.packageSize - total,
            0
        );


    document.getElementById(
        "attendanceTotal"
    ).textContent =
        total;


    document.getElementById(
        "remainingTotal"
    ).textContent =
        remaining;


    document.getElementById(
        "progressText"
    ).textContent =
        `${total} / ${student.packageSize} Pertemuan`;


    const percentage =
        Math.min(
            (total / student.packageSize) * 100,
            100
        );


    document.getElementById(
        "progressFill"
    ).style.width =
        `${percentage}%`;


    const status =
        document.getElementById(
            "packageStatus"
        );


    if (total >= student.packageSize) {

        status.textContent =
            "SELESAI";

        status.classList.add(
            "status-complete"
        );

    } else {

        status.textContent =
            "AKTIF";

        status.classList.remove(
            "status-complete"
        );
    }


    document.getElementById(
        "todayDate"
    ).textContent =
        formatDate(
            getTodayKey()
        );


    updateAttendanceButton();

    renderAttendanceHistory();
}


/* =========================================================
   CURRENT STUDENT
   ========================================================= */

function getCurrentStudent() {

    if (!currentStudent) {
        return null;
    }


    const data = getData();

    const student =
        data.students.find(
            item =>
                item.id === currentStudent.id
        );


    if (!student) {

        currentStudent = null;

        return null;
    }


    currentStudent = student;

    return student;
}


/* =========================================================
   PILIH KETERANGAN
   ========================================================= */

function selectAttendance(button) {

    const buttons =
        document.querySelectorAll(
            ".attendance-option"
        );


    buttons.forEach(
        item =>
            item.classList.remove(
                "active"
            )
    );


    button.classList.add("active");


    selectedAttendance =
        button.dataset.status;


    updateAttendanceButton();
}


/* =========================================================
   UPDATE TOMBOL ABSEN
   ========================================================= */

function updateAttendanceButton() {

    const button =
        document.getElementById(
            "attendanceButton"
        );


    const student =
        getCurrentStudent();


    if (!student) {
        return;
    }


    const total =
        getStudentAttendance(student)
            .length;


    const already =
        hasAttendanceToday(
            student.id
        );


    if (already) {

        button.disabled = true;

        button.textContent =
            "✓ Sudah Absen Hari Ini";

        button.style.opacity =
            "0.6";

        button.style.cursor =
            "not-allowed";

        return;
    }


    if (total >= student.packageSize) {

        button.disabled = true;

        button.textContent =
            "Paket Sudah Selesai";

        button.style.opacity =
            "0.6";

        button.style.cursor =
            "not-allowed";

        return;
    }


    button.disabled = false;

    button.textContent =
        `✓ Kirim Absensi (${selectedAttendance})`;

    button.style.opacity =
        "1";

    button.style.cursor =
        "pointer";
}


/* =========================================================
   SUBMIT ABSENSI
   ========================================================= */

function submitAttendance() {

    const student =
        getCurrentStudent();


    if (!student) {
        return;
    }


    const message =
        document.getElementById(
            "attendanceMessage"
        );


    if (
        hasAttendanceToday(
            student.id
        )
    ) {

        showMessage(
            message,
            "Kamu sudah melakukan absensi hari ini.",
            "error"
        );

        return;
    }


    const attendance =
        getStudentAttendance(student);


    if (
        attendance.length >=
        student.packageSize
    ) {

        showMessage(
            message,
            "Paket kamu sudah selesai. Silakan melakukan pembayaran untuk paket baru.",
            "error"
        );

        return;
    }


    const data =
        getData();


    const now =
        new Date();


    const newAttendance = {

        id: generateId(),

        studentId:
            student.id,

        studentCode:
            student.code,

        studentName:
            student.name,

        date:
            getTodayKey(),

        time:
            now.toISOString(),

        status:
            selectedAttendance

    };


    data.attendance.push(
        newAttendance
    );


    saveData(data);


    showMessage(
        message,
        `Absensi berhasil dicatat sebagai "${selectedAttendance}".`,
        "success"
    );


    showStudentDashboard();


    renderTeacherDashboardIfOpen();
}


/* =========================================================
   RIWAYAT ABSENSI
   ========================================================= */

function renderAttendanceHistory() {

    const container =
        document.getElementById(
            "attendanceHistory"
        );


    const student =
        getCurrentStudent();


    if (!student) {
        return;
    }


    const data =
        getData();


    const history =
        data.attendance
            .filter(
                item =>
                    item.studentId ===
                    student.id
            )
            .sort(
                (a, b) =>
                    new Date(b.time) -
                    new Date(a.time)
            );


    if (history.length === 0) {

        container.innerHTML = `
            <div class="empty-history">
                Belum ada riwayat absensi.
            </div>
        `;

        return;
    }


    container.innerHTML =
        history.map(
            item => `

                <div class="history-item">

                    <div>

                        <div class="history-date">
                            ${formatDate(item.date)}
                        </div>

                        <div class="history-time">
                            ${formatTime(item.time)}
                        </div>

                    </div>

                    <div>
                        <span class="history-status">
                            ${item.status}
                        </span>
                    </div>

                </div>

            `
        ).join("");
}


/* =========================================================
   LOGOUT SISWA
   ========================================================= */

function logoutStudent() {

    currentStudent = null;

    document
        .getElementById(
            "studentDashboard"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "studentCode"
        )
        .focus();


    document
        .getElementById(
            "attendanceMessage"
        ).innerHTML = "";
}


/* =========================================================
   MODAL TUTOR
   ========================================================= */

function openTeacherLogin() {

    document
        .getElementById(
            "teacherModal"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "teacherPin"
        )
        .value = "";


    document
        .getElementById(
            "teacherMessage"
        ).innerHTML = "";


    setTimeout(
        () => {

            document
                .getElementById(
                    "teacherPin"
                )
                .focus();

        },
        100
    );
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeTeacherLogin() {

    document
        .getElementById(
            "teacherModal"
        )
        .classList.add("hidden");
}


/* =========================================================
   LOGIN TUTOR
   ========================================================= */

function loginTeacher() {

    const pin =
        document
            .getElementById(
                "teacherPin"
            )
            .value
            .trim();


    const message =
        document
            .getElementById(
                "teacherMessage"
            );


    if (pin !== TEACHER_PIN) {

        showMessage(
            message,
            "PIN tutor salah.",
            "error"
        );

        return;
    }


    teacherLoggedIn = true;

    closeTeacherLogin();


    document
        .querySelector(
            ".container"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "teacherDashboard"
        )
        .classList.remove(
            "hidden"
        );


    renderTeacherDashboard();
}


/* =========================================================
   LOGOUT TUTOR
   ========================================================= */

function logoutTeacher() {

    teacherLoggedIn = false;


    document
        .getElementById(
            "teacherDashboard"
        )
        .classList.add(
            "hidden"
        );


    document
        .querySelector(
            ".container"
        )
        .classList.remove(
            "hidden"
        );
}


/* =========================================================
   TAMBAH SISWA
   ========================================================= */

function addStudent() {

    const name =
        document
            .getElementById(
                "newStudentName"
            )
            .value
            .trim();


    const code =
        document
            .getElementById(
                "newStudentCode"
            )
            .value
            .trim()
            .toUpperCase();


    const packageSize =
        Number(
            document
                .getElementById(
                    "newStudentPackage"
                )
                .value
        );


    const message =
        document
            .getElementById(
                "addStudentMessage"
            );


    if (!name) {

        showMessage(
            message,
            "Nama siswa wajib diisi.",
            "error"
        );

        return;
    }


    if (!code) {

        showMessage(
            message,
            "Kode siswa wajib diisi.",
            "error"
        );

        return;
    }


    if (
        packageSize !== 4 &&
        packageSize !== 8
    ) {

        showMessage(
            message,
            "Paket harus 4 atau 8 pertemuan.",
            "error"
        );

        return;
    }


    const data =
        getData();


    const exists =
        data.students.some(
            student =>
                student.code.toUpperCase() ===
                code
        );


    if (exists) {

        showMessage(
            message,
            "Kode siswa sudah digunakan.",
            "error"
        );

        return;
    }


    const newStudent = {

        id: generateId(),

        code: code,

        name: name,

        packageSize:
            packageSize,

        packageStart:
            getTodayKey(),

        active: true

    };


    data.students.push(
        newStudent
    );


    saveData(data);


    document
        .getElementById(
            "newStudentName"
        )
        .value = "";


    document
        .getElementById(
            "newStudentCode"
        )
        .value = "";


    showMessage(
        message,
        `Siswa ${name} berhasil ditambahkan.`,
        "success"
    );


    renderTeacherDashboard();
}


/* =========================================================
   BAYAR / RESET PAKET
   ========================================================= */

function resetStudentPackage(
    studentId
) {

    const data =
        getData();


    const student =
        data.students.find(
            item =>
                item.id === studentId
        );


    if (!student) {
        return;
    }


    const confirmReset =
        confirm(
            `Reset paket ${student.name}?\n\n` +
            `Paket lama akan tetap masuk ke riwayat pembayaran.\n\n` +
            `Paket baru akan dimulai dari 0/${student.packageSize}.`
        );


    if (!confirmReset) {
        return;
    }


    const oldPackage =
        student.packageSize;


    const payment = {

        id: generateId(),

        studentId:
            student.id,

        studentName:
            student.name,

        date:
            getTodayKey(),

        time:
            new Date().toISOString(),

        packageSize:
            oldPackage

    };


    data.payments.push(
        payment
    );


    student.packageStart =
        getTodayKey();


    saveData(data);


    renderTeacherDashboard();


    if (
        currentStudent &&
        currentStudent.id ===
        student.id
    ) {

        currentStudent =
            student;

        showStudentDashboard();
    }


    alert(
        `Paket ${student.name} berhasil direset.\n\n` +
        `Progress sekarang: 0/${student.packageSize}`
    );
}


/* =========================================================
   DASHBOARD TUTOR
   ========================================================= */

function renderTeacherDashboard() {

    if (!teacherLoggedIn) {
        return;
    }


    const data =
        getData();


    const activeStudents =
        data.students.filter(
            student =>
                student.active !== false
        );


    document
        .getElementById(
            "totalStudents"
        )
        .textContent =
        activeStudents.length;


    document
        .getElementById(
            "totalAttendance"
        )
        .textContent =
        data.attendance.length;


    let completed = 0;


    activeStudents.forEach(
        student => {

            if (
                getStudentAttendance(
                    student
                ).length >=
                student.packageSize
            ) {

                completed++;
            }

        }
    );


    document
        .getElementById(
            "completedPackages"
        )
        .textContent =
        completed;


    renderStudentTable();

    renderTodayAttendance();
}


/* =========================================================
   TABEL SISWA
   ========================================================= */

function renderStudentTable() {

    const tbody =
        document
            .getElementById(
                "studentTableBody"
            );


    const data =
        getData();


    const students =
        data.students.filter(
            student =>
                student.active !== false
        );


    if (students.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="5">

                    <div class="empty-history">
                        Belum ada siswa.
                    </div>

                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML =
        students.map(
            student => {

                const total =
                    getStudentAttendance(
                        student
                    ).length;


                const percentage =
                    Math.min(
                        (
                            total /
                            student.packageSize
                        ) * 100,
                        100
                    );


                const complete =
                    total >=
                    student.packageSize;


                return `

                    <tr>

                        <td>
                            <strong>
                                ${student.code}
                            </strong>
                        </td>


                        <td>
                            ${student.name}
                        </td>


                        <td>

                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                    gap:8px;
                                "
                            >

                                <div class="table-progress">

                                    <div
                                        class="table-progress-fill"
                                        style="
                                            width:${percentage}%
                                        "
                                    ></div>

                                </div>

                                <span>
                                    ${total}/${student.packageSize}
                                </span>

                            </div>

                        </td>


                        <td>

                            <span
                                class="history-status"
                                style="
                                    background:
                                    ${
                                        complete
                                        ? "#fef3c7"
                                        : "#dcfce7"
                                    };

                                    color:
                                    ${
                                        complete
                                        ? "#92400e"
                                        : "#166534"
                                    };
                                "
                            >

                                ${
                                    complete
                                    ? "SELESAI"
                                    : "AKTIF"
                                }

                            </span>

                        </td>


                        <td>

                            <button
                                class="action-btn pay-btn"
                                onclick="
                                    resetStudentPackage(
                                        ${student.id}
                                    )
                                "
                            >
                                💳 Bayar / Reset
                            </button>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


/* =========================================================
   ABSENSI HARI INI
   ========================================================= */

function renderTodayAttendance() {

    const container =
        document
            .getElementById(
                "todayAttendanceList"
            );


    const data =
        getData();


    const today =
        getTodayKey();


    const attendance =
        data.attendance
            .filter(
                item =>
                    item.date === today
            )
            .sort(
                (a, b) =>
                    new Date(b.time) -
                    new Date(a.time)
            );


    if (attendance.length === 0) {

        container.innerHTML = `

            <div class="empty-history">

                Belum ada absensi hari ini.

            </div>

        `;

        return;
    }


    container.innerHTML =
        attendance.map(
            item => `

                <div class="history-item">

                    <div>

                        <div class="history-date">
                            ${item.studentName}
                        </div>

                        <div class="history-time">
                            ${item.studentCode}
                            •
                            ${formatTime(item.time)}
                        </div>

                    </div>

                    <div>

                        <span class="history-status">
                            ${item.status}
                        </span>

                    </div>

                </div>

            `
        ).join("");
}


/* =========================================================
   REFRESH DASHBOARD TUTOR
   ========================================================= */

function renderTeacherDashboardIfOpen() {

    if (teacherLoggedIn) {

        renderTeacherDashboard();
    }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    element,
    text,
    type
) {

    if (!element) {
        return;
    }


    element.innerHTML = `

        <div class="message-${type}">
            ${text}
        </div>

    `;


    setTimeout(
        () => {

            element.innerHTML = "";

        },
        4000
    );
}


/* =========================================================
   ENTER KEY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const studentCode =
            document.getElementById(
                "studentCode"
            );


        if (studentCode) {

            studentCode.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        loginStudent();
                    }

                }
            );

        }


        const teacherPin =
            document.getElementById(
                "teacherPin"
            );


        if (teacherPin) {

            teacherPin.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        loginTeacher();
                    }

                }
            );

        }

    }
);


/* =========================================================
   ESC UNTUK TUTUP MODAL
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeTeacherLogin();

        }

    }
);


/* =========================================================
   DEBUG
   ========================================================= */

console.log(
    "AbsensiKu berhasil dimuat."
);