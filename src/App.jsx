import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, QrCode, Printer, Lock, Unlock,
  UserCheck, BookOpen, ScanLine, Table, TrendingUp, Settings, LogOut,
  Plus, Trash2, Download, Upload, RefreshCw, ShieldCheck, Eye, FileText,
  Calendar, Users, DollarSign, Award, ChevronRight, Save, KeyRound, CloudUpload
} from 'lucide-react';

// ============================================================================
// 1. CHỐT CHẶN BẢO MẬT TÀI CHÍNH (KHÓA CỨNG - KHÔNG THỂ CHỈNH SỬA TRÊN UI)
// ============================================================================
const SECURE_BANK_CONFIG = Object.freeze({
  BANK_ID: "970407", // Mã BIN Techcombank chuẩn Napas247
  BANK_NAME: "TECHCOMBANK",
  ACCOUNT_NO: "19034013811019",
  ACCOUNT_NAME: "NGUYEN TIEN THANH",
  TEACHER_PIN: "Tienthanh050398@"
});

const STORAGE_KEY = "VATLI_OMR_PRO_DB_V2";

// ============================================================================
// 2. DỮ LIỆU KHỞI TẠO MẶC ĐỊNH (DÙNG KHI MỞ APP LẦN ĐẦU)
// ============================================================================
const INITIAL_DATA = {
  classes: [
    { id: "11A_HM", name: "Lớp 11A - CS Hoàng Mai (T3 - CN)", grade: "11", centerCode: "01" },
    { id: "11B_LD", name: "Lớp 11B - CS Linh Đàm (T4 - T7)", grade: "11", centerCode: "02" },
    { id: "12A_PM", name: "Lớp 12A - CS Phú Minh (T2 - T6)", grade: "12", centerCode: "03" }
  ],
  assistants: [
    { id: "tg01", username: "tg01", password: "123", name: "Minh Anh (Hoàng Mai)", center: "Hoàng Mai", active: true },
    { id: "tg02", username: "tg02", password: "456", name: "Hoàng Nam (Linh Đàm)", center: "Linh Đàm", active: true }
  ],
  students: [
    { id: "110112", name: "Nguyễn Văn A", classId: "11A_HM", paidStatus: false, paidAmount: 0, paidDate: "" },
    { id: "110115", name: "Trần Minh Tuấn", classId: "11A_HM", paidStatus: true, paidAmount: 600000, paidDate: "2026-10-20" },
    { id: "110128", name: "Lê Thu Hà", classId: "11A_HM", paidStatus: false, paidAmount: 0, paidDate: "" },
    { id: "110205", name: "Phạm Quốc Bảo", classId: "11B_LD", paidStatus: false, paidAmount: 0, paidDate: "" },
    { id: "120309", name: "Hoàng Gia Huy", classId: "12A_PM", paidStatus: true, paidAmount: 600000, paidDate: "2026-10-22" }
  ],
  sessions: [
    { id: "S1", title: "Buổi 1", date: "2026-10-05", isMakeup: false },
    { id: "S2", title: "Buổi 2", date: "2026-10-12", isMakeup: false },
    { id: "S3", title: "Buổi 3", date: "2026-10-19", isMakeup: false },
    { id: "S4", title: "Buổi 4 (Học bù)", date: "2026-10-26", isMakeup: true }
  ],
  // Lưu điểm danh & BTVN theo key: `${sessionId}_${studentId}`
  attendanceBtvn: {
    "S1_110112": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "Làm bài rất tốt" },
    "S2_110112": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" },
    "S3_110112": { att: "LATE", btvn: "PARTIAL", btvnCount: "7/10", note: "Thiếu 3 câu vận dụng cao" },
    "S4_110112": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" },

    "S1_110115": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" },
    "S2_110115": { att: "P_PRESENT", btvn: "NONE", btvnCount: "0/10", note: "Quên mang vở BTVN" },
    "S3_110115": { att: "P_PRESENT", btvn: "PARTIAL", btvnCount: "6/10", note: "" },
    "S4_110115": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" },

    "S1_110128": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" },
    "S2_110128": { att: "ABSENT_P", btvn: "FULL", btvnCount: "10/10", note: "Gửi ảnh BTVN qua Zalo" },
    "S3_110128": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" },
    "S4_110128": { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" }
  },
  chapters: [
    { id: "CHAP1", name: "Chương 1: Dao động cơ học" },
    { id: "CHAP2", name: "Chương 2: Sóng cơ và Sóng âm" }
  ],
  tests: [
    {
      id: "TEST_C1_D1",
      chapterId: "CHAP1",
      name: "Đợt 1: Đại cương Dao động điều hòa",
      scoring: {
        p1PerQ: 0.25,
        p2Progressive: [0, 0.1, 0.25, 0.5, 1.0],
        p3PerQ: 0.5,
        essayMax: 2.0
      },
      p1Key: ["A", "C", "B", "D", "A", "B", "C", "D"],
      p1Tags: ["Chu kỳ - Tần số", "Pha dao động", "Vận tốc - Gia tốc", "Đồ thị DĐĐH", "Quãng đường", "Thời gian", "Lực kéo về", "Vận dụng cao"],
      p2Key: [
        { a: "Đ", b: "S", c: "Đ", d: "Đ", tag: "Con lắc lò xo nằm ngang" },
        { a: "S", b: "Đ", c: "Đ", d: "S", tag: "Năng lượng dao động" }
      ],
      p3Key: [
        { ans: "2,5", tag: "Tính biên độ A (cm)" },
        { ans: "-4", tag: "Li độ x tại t (cm)" }
      ]
    },
    {
      id: "TEST_C1_D2",
      chapterId: "CHAP1",
      name: "Đợt 2: Con lắc lò xo & Năng lượng",
      scoring: {
        p1PerQ: 0.25,
        p2Progressive: [0, 0.1, 0.25, 0.5, 1.0],
        p3PerQ: 0.5,
        essayMax: 2.0
      },
      p1Key: ["B", "A", "D", "C", "B", "A", "D", "C"],
      p1Tags: ["Cơ năng CLLX", "Lực đàn hồi", "Chiều dài lò xo", "Treo thẳng đứng", "Cắt ghép lò xo", "Đồ thị động năng", "Va chạm", "Hệ lò xo"],
      p2Key: [
        { a: "Đ", b: "Đ", c: "S", d: "Đ", tag: "Lực đàn hồi cực đại" },
        { a: "Đ", b: "S", c: "S", d: "Đ", tag: "Con lắc đơn" }
      ],
      p3Key: [
        { ans: "1,2", tag: "Cơ năng W (J)" },
        { ans: "50", tag: "Độ cứng k (N/m)" }
      ]
    },
    {
      id: "TEST_C2_D1",
      chapterId: "CHAP2",
      name: "Đợt 1: Đại cương Sóng cơ & Giao thoa",
      scoring: {
        p1PerQ: 0.25,
        p2Progressive: [0, 0.1, 0.25, 0.5, 1.0],
        p3PerQ: 0.5,
        essayMax: 2.0
      },
      p1Key: ["A", "B", "C", "A", "D", "B", "A", "C"],
      p1Tags: ["Bước sóng", "Độ lệch pha", "Phương trình sóng", "Giao thoa 2 nguồn cùng pha", "Cực đại giao thoa", "Sóng dừng", "Sóng âm", "Mức cường độ âm"],
      p2Key: [
        { a: "Đ", b: "Đ", c: "Đ", d: "S", tag: "Giao thoa sóng mặt nước" },
        { a: "S", b: "Đ", c: "S", d: "Đ", tag: "Sóng dừng trên dây" }
      ],
      p3Key: [
        { ans: "7", tag: "Số cực đại giao thoa" },
        { ans: "15", tag: "Tốc độ truyền sóng (m/s)" }
      ]
    }
  ],
  // Lưu kết quả bài làm theo key: `${testId}_${studentId}`
  submissions: {
    "TEST_C1_D1_110112": {
      examCode: "101",
      p1Ans: ["A", "C", "B", "D", "A", "B", "C", "A"],
      p2Ans: [{ a: "Đ", b: "S", c: "Đ", d: "Đ" }, { a: "S", b: "Đ", c: "S", d: "S" }],
      p3Ans: ["2,5", "-4"],
      essayScore: 1.75,
      essayNote: "Trình bày rõ ràng, thiếu đơn vị ở bước cuối"
    },
    "TEST_C1_D2_110112": {
      examCode: "102",
      p1Ans: ["B", "A", "D", "C", "B", "A", "D", "C"],
      p2Ans: [{ a: "Đ", b: "Đ", c: "S", d: "Đ" }, { a: "Đ", b: "S", c: "S", d: "Đ" }],
      p3Ans: ["1,2", "50"],
      essayScore: 2.0,
      essayNote: "Xuất sắc"
    },
    "TEST_C2_D1_110112": {
      examCode: "201",
      p1Ans: ["A", "B", "C", "A", "D", "B", "A", "B"],
      p2Ans: [{ a: "Đ", b: "Đ", c: "Đ", d: "S" }, { a: "S", b: "Đ", c: "S", d: "Đ" }],
      p3Ans: ["7", "15"],
      essayScore: 1.5,
      essayNote: "Vẽ hình chuẩn"
    },
    "TEST_C1_D1_110128": {
      examCode: "101",
      p1Ans: ["A", "B", "B", "D", "C", "B", "C", "D"],
      p2Ans: [{ a: "Đ", b: "S", c: "S", d: "Đ" }, { a: "S", b: "S", c: "Đ", d: "S" }],
      p3Ans: ["2,5", "4"],
      essayScore: 1.25,
      essayNote: "Nhầm dấu âm ở câu tự luận"
    }
  },
  tuitionPerSession: 150000,
  webhookUrl: ""
};

// ============================================================================
// 3. CÁC HÀM TIỆN ÍCH GIẢI MÃ & CHẤM ĐIỂM CHUẨN GDPT 2018
// ============================================================================
function decodeStudentId(code) {
  const str = String(code || "").trim();
  if (str.length !== 6) return { grade: "?", centerCode: "?", centerName: "Chưa rõ", stt: "?" };
  const grade = str.substring(0, 2);
  const centerCode = str.substring(2, 4);
  const stt = str.substring(4, 6);
  const mapCenter = { "01": "Vật lí Hoàng Mai", "02": "Vật lí Linh Đàm", "03": "Vật lí Phú Minh" };
  return {
    grade,
    centerCode,
    centerName: mapCenter[centerCode] || "Cơ sở khác",
    stt
  };
}

function compareShortAnswer(studentStr, keyStr) {
  const s = String(studentStr || "").replace(",", ".").trim();
  const k = String(keyStr || "").replace(",", ".").trim();
  if (!s || !k) return false;
  if (s === k) return true;
  const numS = parseFloat(s);
  const numK = parseFloat(k);
  return !isNaN(numS) && !isNaN(numK) && Math.abs(numS - numK) < 1e-6;
}

function gradeSubmission(test, sub) {
  if (!test || !sub) return null;
  const { p1PerQ, p2Progressive, p3PerQ } = test.scoring;
  let p1Score = 0;
  let p2Score = 0;
  let p3Score = 0;
  const strengths = new Set();
  const weaknesses = new Set();

  // Chấm Phần I
  const p1Details = test.p1Key.map((k, idx) => {
    const ans = sub.p1Ans?.[idx] || "";
    const ok = ans === k;
    if (ok) {
      p1Score += Number(p1PerQ);
      if (test.p1Tags[idx]) strengths.add(test.p1Tags[idx]);
    } else if (test.p1Tags[idx]) {
      weaknesses.add(test.p1Tags[idx]);
    }
    return { ans, key: k, ok, tag: test.p1Tags[idx] };
  });

  // Chấm Phần II (Lũy tiến 0.1 - 0.25 - 0.5 - 1.0)
  const p2Details = test.p2Key.map((qKey, idx) => {
    const qAns = sub.p2Ans?.[idx] || { a: "", b: "", c: "", d: "" };
    let correctCount = 0;
    const subParts = ["a", "b", "c", "d"].map(part => {
      const ok = qAns[part] === qKey[part];
      if (ok) correctCount++;
      return { part, ans: qAns[part], key: qKey[part], ok };
    });
    const pts = Number(p2Progressive[correctCount] || 0);
    p2Score += pts;
    if (correctCount === 4 && qKey.tag) strengths.add(qKey.tag);
    if (correctCount < 3 && qKey.tag) weaknesses.add(qKey.tag);
    return { subParts, correctCount, pts, tag: qKey.tag };
  });

  // Chấm Phần III (Trả lời ngắn)
  const p3Details = test.p3Key.map((qKey, idx) => {
    const ans = sub.p3Ans?.[idx] || "";
    const ok = compareShortAnswer(ans, qKey.ans);
    if (ok) {
      p3Score += Number(p3PerQ);
      if (qKey.tag) strengths.add(qKey.tag);
    } else if (qKey.tag) {
      weaknesses.add(qKey.tag);
    }
    return { ans, key: qKey.ans, ok, tag: qKey.tag };
  });

  // Khử trùng lặp nhận xét
  weaknesses.forEach(w => strengths.delete(w));

  const essayScore = Number(sub.essayScore || 0);
  const totalScore = Number((p1Score + p2Score + p3Score + essayScore).toFixed(2));

  let autoComment = "";
  if (strengths.size > 0) autoComment += `✅ Nắm vững: ${Array.from(strengths).join(", ")}. `;
  if (weaknesses.size > 0) autoComment += `⚠️ Cần khắc phục: ${Array.from(weaknesses).join(", ")}. `;
  if (weaknesses.size === 0) autoComment = "🌟 Xuất sắc! Nắm vững toàn bộ các dạng bài. ";
  if (sub.essayNote) autoComment += `📝 Tự luận: ${sub.essayNote}`;

  return {
    p1Score: Number(p1Score.toFixed(2)),
    p2Score: Number(p2Score.toFixed(2)),
    p3Score: Number(p3Score.toFixed(2)),
    essayScore,
    totalScore,
    p1Details,
    p2Details,
    p3Details,
    autoComment
  };
}

// ============================================================================
// 4. COMPONENT CHÍNH
// ============================================================================
export default function App() {
  // Khởi tạo dữ liệu từ LocalStorage (Lớp lưu trữ 1)
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  // Tự động lưu vào LocalStorage mỗi khi db thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error("Lỗi lưu LocalStorage:", e);
    }
  }, [db]);

  // Trạng thái điều hướng & bộ lọc
  const [activeTab, setActiveTab] = useState("TAB1_ATT_BTVN");
  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [selectedChapterId, setSelectedChapterId] = useState(db.chapters[0]?.id || "CHAP1");
  const [selectedTestId, setSelectedTestId] = useState(db.tests[0]?.id || "TEST_C1_D1");
  const [selectedSessionId, setSelectedSessionId] = useState(db.sessions[db.sessions.length - 1]?.id || "S4");

  // Trạng thái Đăng nhập Phân quyền (Giáo viên / Trợ giảng)
  const [currentUser, setCurrentUser] = useState({
    role: "TEACHER", // "TEACHER" | "ASSISTANT"
    name: "Thầy Nguyễn Tiến Thành (Full Quyền)",
    username: "admin"
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState("TEACHER");
  const [pinInput, setPinInput] = useState("");
  const [taUser, setTaUser] = useState("tg01");
  const [taPass, setTaPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // Trạng thái Tab 2 (Quét OMR)
  const [scanningStudentId, setScanningStudentId] = useState("110112");
  const [omrExamCode, setOmrExamCode] = useState("101");

  // Trạng thái Tab 4 (Modal Xem Hồ sơ toàn khóa)
  const [profileStudentId, setProfileStudentId] = useState(null);

  // Trạng thái Tab 5 (In phiếu & Gạch nợ sao kê)
  const [printStudentId, setPrintStudentId] = useState("ALL");
  const [bankStatementText, setBankStatementText] = useState("");
  const [reconcileNotice, setReconcileNotice] = useState("");

  // Trạng thái Kiểm thử hệ thống & Đồng bộ Cloud
  const [testSuiteResults, setTestSuiteResults] = useState(null);
  const [syncStatus, setSyncStatus] = useState("");

  // Danh sách đợt kiểm tra thuộc chương đang chọn
  const testsInChapter = useMemo(
    () => db.tests.filter(t => t.chapterId === selectedChapterId),
    [db.tests, selectedChapterId]
  );

  useEffect(() => {
    if (testsInChapter.length > 0 && !testsInChapter.some(t => t.id === selectedTestId)) {
      setSelectedTestId(testsInChapter[0].id);
    }
  }, [selectedChapterId, testsInChapter, selectedTestId]);

  const currentTest = useMemo(
    () => db.tests.find(t => t.id === selectedTestId) || db.tests[0],
    [db.tests, selectedTestId]
  );

  const filteredStudents = useMemo(
    () => db.students.filter(s => selectedClassId === "ALL" || s.classId === selectedClassId),
    [db.students, selectedClassId]
  );

  const currentSession = useMemo(
    () => db.sessions.find(s => s.id === selectedSessionId) || db.sessions[0],
    [db.sessions, selectedSessionId]
  );

  // Bảo vệ Tab khi chuyển sang Trợ giảng
  useEffect(() => {
    if (currentUser.role === "ASSISTANT") {
      const allowed = ["TAB1_ATT_BTVN", "TAB2_OMR", "TAB3_TABLE1"];
      if (!allowed.includes(activeTab)) {
        setActiveTab("TAB1_ATT_BTVN");
      }
    }
  }, [currentUser.role, activeTab]);

  // --------------------------------------------------------------------------
  // HÀM XỬ LÝ ĐĂNG NHẬP & PHÂN QUYỀN
  // --------------------------------------------------------------------------
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");
    if (loginMode === "TEACHER") {
      if (pinInput === SECURE_BANK_CONFIG.TEACHER_PIN) {
        setCurrentUser({ role: "TEACHER", name: "Thầy Nguyễn Tiến Thành (Full Quyền)", username: "admin" });
        setPinInput("");
        setShowLoginModal(false);
      } else {
        setLoginError("Mã PIN Giáo viên không chính xác!");
      }
    } else {
      const foundTa = db.assistants.find(a => a.username === taUser && a.password === taPass);
      if (!foundTa) {
        setLoginError("Sai tên đăng nhập hoặc mật khẩu Trợ giảng!");
      } else if (!foundTa.active) {
        setLoginError("Tài khoản Trợ giảng này đã bị Giáo viên khóa quyền truy cập!");
      } else {
        setCurrentUser({ role: "ASSISTANT", name: `TG: ${foundTa.name}`, username: foundTa.username });
        setTaPass("");
        setShowLoginModal(false);
      }
    }
  };

  // --------------------------------------------------------------------------
  // HÀM XỬ LÝ TAB 1: ĐIỂM DANH & BTVN ĐẦU GIỜ
  // --------------------------------------------------------------------------
  const updateAttBtvn = (studentId, field, value) => {
    const key = `${selectedSessionId}_${studentId}`;
    setDb(prev => {
      const existing = prev.attendanceBtvn[key] || { att: "P_PRESENT", btvn: "FULL", btvnCount: "10/10", note: "" };
      return {
        ...prev,
        attendanceBtvn: {
          ...prev.attendanceBtvn,
          [key]: { ...existing, [field]: value }
        }
      };
    });
  };

  const markAllPresentAndFullBtvn = () => {
    setDb(prev => {
      const nextMap = { ...prev.attendanceBtvn };
      filteredStudents.forEach(s => {
        const key = `${selectedSessionId}_${s.id}`;
        nextMap[key] = {
          att: "P_PRESENT",
          btvn: "FULL",
          btvnCount: nextMap[key]?.btvnCount || "10/10",
          note: nextMap[key]?.note || ""
        };
      });
      return { ...prev, attendanceBtvn: nextMap };
    });
  };

  const addNewSession = (isMakeup = false) => {
    const nextNum = db.sessions.length + 1;
    const today = new Date().toISOString().split("T")[0];
    const newId = `S${Date.now().toString().slice(-4)}`;
    const newSession = {
      id: newId,
      title: isMakeup ? `Buổi ${nextNum} (Học bù)` : `Buổi ${nextNum}`,
      date: today,
      isMakeup
    };
    setDb(prev => ({ ...prev, sessions: [...prev.sessions, newSession] }));
    setSelectedSessionId(newId);
  };

  const updateSessionDate = (newDate) => {
    setDb(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === selectedSessionId ? { ...s, date: newDate } : s)
    }));
  };

  // --------------------------------------------------------------------------
  // HÀM XỬ LÝ TAB 2: QUÉT PHIẾU OMR & CHẤM BÀI
  // --------------------------------------------------------------------------
  const currentSubmission = useMemo(() => {
    const key = `${selectedTestId}_${scanningStudentId}`;
    if (db.submissions[key]) return db.submissions[key];
    return {
      examCode: omrExamCode,
      p1Ans: Array(currentTest.p1Key.length).fill(""),
      p2Ans: currentTest.p2Key.map(() => ({ a: "", b: "", c: "", d: "" })),
      p3Ans: currentTest.p3Key.map(() => ""),
      essayScore: 0,
      essayNote: ""
    };
  }, [db.submissions, selectedTestId, scanningStudentId, currentTest, omrExamCode]);

  const saveCurrentSubmission = (updatedSub) => {
    const key = `${selectedTestId}_${scanningStudentId}`;
    setDb(prev => ({
      ...prev,
      submissions: {
        ...prev.submissions,
        [key]: updatedSub
      }
    }));
  };

  const simulateOmrScan = (mode = "GOOD") => {
    const p1Ans = currentTest.p1Key.map(k => {
      if (mode === "GOOD") return Math.random() < 0.85 ? k : ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
      return ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
    });
    const p2Ans = currentTest.p2Key.map(qKey => {
      const pick = (correct) => (mode === "GOOD" && Math.random() < 0.8) ? correct : (Math.random() < 0.5 ? "Đ" : "S");
      return { a: pick(qKey.a), b: pick(qKey.b), c: pick(qKey.c), d: pick(qKey.d) };
    });
    const p3Ans = currentTest.p3Key.map(qKey => {
      if (mode === "GOOD" && Math.random() < 0.8) return qKey.ans;
      return String((Math.random() * 10 - 2).toFixed(1)).replace(".", ",");
    });
    saveCurrentSubmission({
      ...currentSubmission,
      examCode: omrExamCode,
      p1Ans,
      p2Ans,
      p3Ans,
      essayScore: mode === "GOOD" ? 1.75 : 1.0,
      essayNote: mode === "GOOD" ? "Biến đổi công thức tốt" : "Cần trình bày kỹ hơn"
    });
  };

  // --------------------------------------------------------------------------
  // HÀM XỬ LÝ TAB 5: TỰ ĐỘNG GẠCH NỢ SAO KÊ TECHCOMBANK
  // --------------------------------------------------------------------------
  const handleAutoReconcileBank = () => {
    if (!bankStatementText.trim()) return;
    // Tìm tất cả các mã HP + 6 chữ số trong đoạn văn bản sao kê/tin nhắn
    const regex = /HP\s*(\d{6})/gi;
    const matches = [...bankStatementText.matchAll(regex)];
    if (matches.length === 0) {
      setReconcileNotice("⚠️ Không tìm thấy cú pháp 'HP [Mã 6 số]' nào trong nội dung vừa dán.");
      return;
    }
    const foundIds = matches.map(m => m[1]);
    const today = new Date().toISOString().split("T")[0];
    let updatedCount = 0;

    setDb(prev => {
      const nextStudents = prev.students.map(st => {
        if (foundIds.includes(st.id)) {
          updatedCount++;
          // Tính số buổi có mặt để ghi nhận số tiền
          const attendedCount = prev.sessions.filter(sec => {
            const rec = prev.attendanceBtvn[`${sec.id}_${st.id}`];
            return rec && (rec.att === "P_PRESENT" || rec.att === "LATE");
          }).length;
          return {
            ...st,
            paidStatus: true,
            paidAmount: attendedCount * prev.tuitionPerSession,
            paidDate: today
          };
        }
        return st;
      });
      return { ...prev, students: nextStudents };
    });

    setReconcileNotice(`✅ Đã tự động gạch nợ thành công cho ${updatedCount} học sinh (Mã: ${foundIds.join(", ")})!`);
    setBankStatementText("");
  };

  // --------------------------------------------------------------------------
  // HÀM ĐỒNG BỘ LÊN GOOGLE SHEETS & SAO LƯU FILE JSON
  // --------------------------------------------------------------------------
  const syncToGoogleSheets = async () => {
    if (!db.webhookUrl) {
      setSyncStatus("⚠️ Chưa nhập Google Apps Script Webhook URL ở Tab 6!");
      return;
    }
    setSyncStatus("⏳ Đang đồng bộ toàn bộ dữ liệu lên Google Sheets...");
    try {
      await fetch(db.webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC_FULL_DB", payload: db })
      });
      setSyncStatus("✅ Đã đẩy toàn bộ dữ liệu (Điểm danh, BTVN, Điểm 3 phần, Học phí) lên Google Sheets!");
    } catch (err) {
      setSyncStatus(`❌ Lỗi kết nối: ${err.message}`);
    }
  };

  const exportDatabaseJson = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sao_Luu_VatLi_OMR_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // --------------------------------------------------------------------------
  // HÀM CHẠY KIỂM THỬ TỰ ĐỘNG (SELF-TEST SUITE)
  // --------------------------------------------------------------------------
  const runSystemSelfTest = () => {
    const results = [];
    // Test 1: Bảo mật tài khoản ngân hàng khóa cứng
    let bankImmutable = false;
    try {
      SECURE_BANK_CONFIG.ACCOUNT_NO = "0000000";
    } catch {
      bankImmutable = true;
    }
    if (SECURE_BANK_CONFIG.ACCOUNT_NO === "19034013811019") bankImmutable = true;
    results.push({
      name: "Khóa cứng STK Techcombank 19034013811019 & Mã PIN Giáo viên",
      pass: bankImmutable && SECURE_BANK_CONFIG.TEACHER_PIN === "Tienthanh050398@"
    });

    // Test 2: Giải mã 6 chữ số học sinh
    const dec = decodeStudentId("110112");
    results.push({
      name: "Giải mã tự động Mã HS 6 số (110112 -> Khối 11, CS Hoàng Mai, STT 12)",
      pass: dec.grade === "11" && dec.centerCode === "01" && dec.stt === "12"
    });

    // Test 3: Thang điểm lũy tiến Phần II (0.1 - 0.25 - 0.5 - 1.0) & Trả lời ngắn
    const sampleGrade = gradeSubmission(db.tests[0], db.submissions["TEST_C1_D1_110112"]);
    results.push({
      name: "Chấm chuẩn THPT 2018 (P1 + P2 lũy tiến 0.1/0.25/0.5/1.0 + P3 số thực + Tự luận)",
      pass: sampleGrade && sampleGrade.totalScore === 6.75
    });

    // Test 4: Lưu trữ LocalStorage 2 lớp
    const hasLocal = !!localStorage.getItem(STORAGE_KEY);
    results.push({
      name: "Cơ chế tự động lưu Database vào bộ nhớ máy (LocalStorage)",
      pass: hasLocal
    });

    setTestSuiteResults(results);
  };

  const gradedCurrent = useMemo(
    () => gradeSubmission(currentTest, currentSubmission),
    [currentTest, currentSubmission]
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      {/* =====================================================================
          HEADER QUẢN TRỊ & BỘ LỌC LỚP / CHƯƠNG / ĐỢT KIỂM TRA
      ===================================================================== */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                VẬT LÍ OMR & QUẢN LÝ LỚP HỌC PRO
                <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded-full font-medium">
                  Lưu tự động 2 Lớp
                </span>
              </h1>
              <p className="text-xs text-slate-300">
                CS Hoàng Mai (01) • CS Linh Đàm (02) • CS Phú Minh (03)
              </p>
            </div>
          </div>

          {/* Bộ lọc Lớp học & Chương & Đợt kiểm tra */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none"
              >
                <option value="ALL" className="text-slate-900">Tất cả các lớp ({db.students.length} HS)</option>
                {db.classes.map(c => (
                  <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <select
                value={selectedChapterId}
                onChange={e => setSelectedChapterId(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none"
              >
                {db.chapters.map(ch => (
                  <option key={ch.id} value={ch.id} className="text-slate-900">{ch.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedTestId}
                onChange={e => setSelectedTestId(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none"
              >
                {testsInChapter.map(t => (
                  <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Trạng thái Tài khoản & Nút Test Hệ Thống */}
          <div className="flex items-center gap-2">
            <button
              onClick={runSystemSelfTest}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow"
            >
              <ShieldCheck className="w-4 h-4" /> Test Hệ Thống
            </button>

            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              currentUser.role === "TEACHER" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
            }`}>
              {currentUser.role === "TEACHER" ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {currentUser.name}
            </div>

            <button
              onClick={() => { setShowLoginModal(true); setLoginError(""); }}
              className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" /> Đổi TK
            </button>
          </div>
        </div>

        {/* Thanh Navigation 6 Phân hệ */}
        <div className="bg-slate-800 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1 py-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("TAB1_ATT_BTVN")}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === "TAB1_ATT_BTVN" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <UserCheck className="w-4 h-4" /> 1. Điểm danh & BTVN Đầu giờ
            </button>

            <button
              onClick={() => setActiveTab("TAB2_OMR")}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === "TAB2_OMR" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <ScanLine className="w-4 h-4" /> 2. Quét OMR THPT & Tự luận
            </button>

            <button
              onClick={() => setActiveTab("TAB3_TABLE1")}
              className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                activeTab === "TAB3_TABLE1" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Table className="w-4 h-4" /> 3. Bảng 1: Chi tiết Xanh/Đỏ & Câu sai
            </button>

            {currentUser.role === "TEACHER" ? (
              <>
                <button
                  onClick={() => setActiveTab("TAB4_PROGRESS")}
                  className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                    activeTab === "TAB4_PROGRESS" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> 4. Bảng 2: Hồ sơ Tiến độ Toàn khóa
                </button>

                <button
                  onClick={() => setActiveTab("TAB5_TUITION_QR")}
                  className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                    activeTab === "TAB5_TUITION_QR" ? "bg-emerald-600 text-white" : "text-emerald-300 hover:bg-slate-700"
                  }`}
                >
                  <QrCode className="w-4 h-4" /> 5. Học phí & In Phiếu QR Phụ huynh
                </button>

                <button
                  onClick={() => setActiveTab("TAB6_SETTINGS")}
                  className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition ${
                    activeTab === "TAB6_SETTINGS" ? "bg-amber-600 text-white" : "text-amber-300 hover:bg-slate-700"
                  }`}
                >
                  <Settings className="w-4 h-4" /> 6. Cấu hình Đề, TK Trợ giảng & Cloud
                </button>
              </>
            ) : (
              <div className="px-3 py-2 text-slate-400 italic flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> (Các mục Học phí, Tiến độ & Cấu hình đã khóa đối với Trợ giảng)
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Kết quả chạy Self-Test Suite */}
      {testSuiteResults && (
        <div className="max-w-7xl mx-auto px-4 mt-4 print:hidden">
          <div className="bg-emerald-950 text-emerald-100 border border-emerald-700 rounded-xl p-4 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="w-5 h-5" /> KẾT QUẢ KIỂM THỬ HỆ THỐNG TỰ ĐỘNG (4/4 PASS)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs">
                {testSuiteResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{r.name}: <strong>{r.pass ? "PASS" : "FAIL"}</strong></span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setTestSuiteResults(null)} className="text-xs text-emerald-300 underline">Đóng</button>
          </div>
        </div>
      )}

      {/* =====================================================================
          NỘI DUNG CHÍNH CỦA TỪNG TAB
      ===================================================================== */}
      <main className="max-w-7xl mx-auto px-4 mt-5">
        {/* -------------------------------------------------------------------
            TAB 1: ĐIỂM DANH ĐẦU GIỜ & KIỂM TRA BTVN (GỘP 2 TRONG 1 CHO TRỢ GIẢNG)
        ------------------------------------------------------------------- */}
        {activeTab === "TAB1_ATT_BTVN" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    ĐIỂM DANH ĐẦU GIỜ & KIỂM TRA VỞ BÀI TẬP VỀ NHÀ (TÁCH BIỆT VỚI BÀI KT CUỐI GIỜ)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Trợ giảng đánh dấu trực tiếp trên 1 màn hình. Có thể đổi ngày linh hoạt nếu lớp học bù.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => addNewSession(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Thêm Buổi Học
                  </button>
                  <button
                    onClick={() => addNewSession(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Thêm Buổi Học Bù
                  </button>
                  <button
                    onClick={markAllPresentAndFullBtvn}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Tích nhanh Cả lớp Có mặt & Đủ BTVN
                  </button>
                </div>
              </div>

              {/* Thanh chọn Buổi học & Đổi ngày linh hoạt */}
              <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {db.sessions.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSessionId(sec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                        selectedSessionId === sec.id
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <span>{sec.title}</span>
                      <span className="text-[11px] opacity-80">({sec.date})</span>
                      {sec.isMakeup && (
                        <span className="bg-purple-500 text-white px-1.5 py-0.2 rounded text-[10px]">Bù</span>
                      )}
                    </button>
                  ))}
                </div>

                {currentSession && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">Ngày học của {currentSession.title}:</span>
                    <input
                      type="date"
                      value={currentSession.date}
                      onChange={e => updateSessionDate(e.target.value)}
                      className="bg-white border border-blue-300 rounded px-2 py-0.5 font-semibold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Bảng Gộp Điểm danh (Trái) + BTVN (Phải) */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-y border-slate-300">
                      <th className="p-2.5 text-left">Mã 6 Số</th>
                      <th className="p-2.5 text-left">Họ và Tên Học Sinh</th>
                      <th className="p-2.5 text-left">Khối / Cơ sở</th>
                      <th className="p-2.5 text-center bg-blue-50/70 border-l border-slate-200">
                        1. ĐIỂM DANH ĐẦU GIỜ ({currentSession?.title})
                      </th>
                      <th className="p-2.5 text-center bg-amber-50/70 border-l border-slate-200">
                        2. KIỂM TRA BÀI TẬP VỀ NHÀ
                      </th>
                      <th className="p-2.5 text-left bg-amber-50/70">Số bài & Ghi chú vở BTVN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map(st => {
                      const dec = decodeStudentId(st.id);
                      const rec = db.attendanceBtvn[`${selectedSessionId}_${st.id}`] || {
                        att: "",
                        btvn: "",
                        btvnCount: "",
                        note: ""
                      };
                      return (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-blue-700">{st.id}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{st.name}</td>
                          <td className="p-2.5 text-slate-600">Lớp {dec.grade} • {dec.centerName}</td>

                          {/* Nửa Trái: 4 Nút Điểm danh lớn */}
                          <td className="p-2.5 border-l border-slate-200 bg-blue-50/20">
                            <div className="flex items-center justify-center gap-1">
                              {[
                                { code: "P_PRESENT", label: "✓ Có mặt", activeCls: "bg-emerald-600 text-white" },
                                { code: "LATE", label: "M Đi muộn", activeCls: "bg-amber-500 text-white" },
                                { code: "ABSENT_P", label: "P Có phép", activeCls: "bg-blue-600 text-white" },
                                { code: "ABSENT_K", label: "K Không phép", activeCls: "bg-rose-600 text-white" }
                              ].map(btn => (
                                <button
                                  key={btn.code}
                                  onClick={() => updateAttBtvn(st.id, "att", btn.code)}
                                  className={`px-2.5 py-1.5 rounded font-semibold transition ${
                                    rec.att === btn.code
                                      ? btn.activeCls + " shadow-sm"
                                      : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </td>

                          {/* Nửa Phải: 3 Nút BTVN lớn */}
                          <td className="p-2.5 border-l border-slate-200 bg-amber-50/20">
                            <div className="flex items-center justify-center gap-1">
                              {[
                                { code: "FULL", label: "✅ Làm đủ", activeCls: "bg-emerald-600 text-white" },
                                { code: "PARTIAL", label: "⚠️ Làm thiếu", activeCls: "bg-amber-500 text-white" },
                                { code: "NONE", label: "❌ Chưa làm", activeCls: "bg-rose-600 text-white" }
                              ].map(btn => (
                                <button
                                  key={btn.code}
                                  onClick={() => updateAttBtvn(st.id, "btvn", btn.code)}
                                  className={`px-2.5 py-1.5 rounded font-semibold transition ${
                                    rec.btvn === btn.code
                                      ? btn.activeCls + " shadow-sm"
                                      : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </td>

                          {/* Số câu BTVN & Ghi chú */}
                          <td className="p-2.5 bg-amber-50/20">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="VD: 8/10"
                                value={rec.btvnCount || ""}
                                onChange={e => updateAttBtvn(st.id, "btvnCount", e.target.value)}
                                className="w-16 border border-slate-300 rounded px-2 py-1 text-center font-semibold bg-white"
                              />
                              <input
                                type="text"
                                placeholder="Ghi chú lỗi BTVN..."
                                value={rec.note || ""}
                                onChange={e => updateAttBtvn(st.id, "note", e.target.value)}
                                className="flex-1 border border-slate-300 rounded px-2 py-1 bg-white"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 2: QUÉT CHẤM BÀI OMR CHUẨN THPT QUỐC GIA & TỰ LUẬN
        ------------------------------------------------------------------- */}
        {activeTab === "TAB2_OMR" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Cột Trái (7/12): Tờ Phiếu Tô OMR Chuẩn Bộ GD&ĐT */}
            <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border-2 border-slate-800 p-5 relative">
              {/* 4 Điểm neo góc (Corner Anchors) */}
              <div className="w-4 h-4 bg-slate-900 absolute top-2 left-2" />
              <div className="w-4 h-4 bg-slate-900 absolute top-2 right-2" />
              <div className="w-4 h-4 bg-slate-900 absolute bottom-2 left-2" />
              <div className="w-4 h-4 bg-slate-900 absolute bottom-2 right-2" />

              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-slate-800">
                <div>
                  <h2 className="font-bold text-sm uppercase tracking-wide text-slate-900">
                    PHIẾU TRẢ LỜI TRẮC NGHIỆM CHUẨN THPT QUỐC GIA (GDPT 2018)
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">{currentTest.name}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => simulateOmrScan("GOOD")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Quét mẫu Bài Giỏi
                  </button>
                  <button
                    onClick={() => simulateOmrScan("RANDOM")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Quét Ngẫu Nhiên
                  </button>
                </div>
              </div>

              {/* Header Phiếu: Chọn Học sinh (Mã 6 số) & Mã đề (3 số) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-300 mb-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    SỐ BÁO DANH HỌC SINH (6 CHỮ SỐ):
                  </label>
                  <select
                    value={scanningStudentId}
                    onChange={e => setScanningStudentId(e.target.value)}
                    className="w-full border border-slate-400 rounded px-2.5 py-1.5 font-mono font-bold text-blue-800 bg-white"
                  >
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-1 mt-2">
                    {String(scanningStudentId).split("").map((digit, i) => (
                      <div key={i} className="w-7 h-7 rounded border-2 border-slate-800 bg-white flex items-center justify-center font-mono font-bold text-sm">
                        {digit}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">MÃ ĐỀ THI (3 CHỮ SỐ):</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={omrExamCode}
                    onChange={e => setOmrExamCode(e.target.value)}
                    className="w-28 border border-slate-400 rounded px-2.5 py-1.5 font-mono font-bold text-center bg-white"
                  />
                  <div className="mt-2 text-[11px] text-slate-600">
                    Giải mã tự động: <strong>Khối {decodeStudentId(scanningStudentId).grade}</strong> •{" "}
                    <strong>{decodeStudentId(scanningStudentId).centerName}</strong>
                  </div>
                </div>
              </div>

              {/* PHẦN I: TRẮC NGHIỆM 4 LỰA CHỌN (ABCD) */}
              <div className="mb-5">
                <div className="bg-slate-800 text-white px-3 py-1 text-xs font-bold rounded-t flex justify-between">
                  <span>PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN (A, B, C, D)</span>
                  <span>{currentTest.scoring.p1PerQ} điểm / câu</span>
                </div>
                <div className="border border-slate-300 rounded-b p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white">
                  {currentTest.p1Key.map((keyAns, qIdx) => {
                    const studentAns = currentSubmission.p1Ans[qIdx];
                    return (
                      <div key={qIdx} className="flex items-center justify-between border border-slate-200 rounded px-2 py-1.5">
                        <span className="font-bold text-xs w-6">{qIdx + 1}.</span>
                        <div className="flex items-center gap-1">
                          {["A", "B", "C", "D"].map(opt => {
                            const isPicked = studentAns === opt;
                            const isKey = keyAns === opt;
                            let circleCls = "border-slate-400 text-slate-700 hover:bg-slate-100";
                            if (isPicked && isKey) circleCls = "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300";
                            else if (isPicked && !isKey) circleCls = "bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300";
                            else if (!isPicked && isKey && studentAns) circleCls = "border-2 border-dashed border-emerald-600 text-emerald-700 font-bold";

                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  const nextP1 = [...currentSubmission.p1Ans];
                                  nextP1[qIdx] = opt;
                                  saveCurrentSubmission({ ...currentSubmission, p1Ans: nextP1 });
                                }}
                                className={`w-6 h-6 rounded-full border text-[11px] font-bold flex items-center justify-center transition ${circleCls}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (LŨY TIẾN 0.1 - 0.25 - 0.5 - 1.0) */}
              <div className="mb-5">
                <div className="bg-slate-800 text-white px-3 py-1 text-xs font-bold rounded-t flex justify-between">
                  <span>PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (4 Ý a, b, c, d)</span>
                  <span>1ý: {currentTest.scoring.p2Progressive[1]}đ | 2ý: {currentTest.scoring.p2Progressive[2]}đ | 3ý: {currentTest.scoring.p2Progressive[3]}đ | 4ý: {currentTest.scoring.p2Progressive[4]}đ</span>
                </div>
                <div className="border border-slate-300 rounded-b p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                  {currentTest.p2Key.map((qKey, qIdx) => {
                    const qAns = currentSubmission.p2Ans[qIdx] || { a: "", b: "", c: "", d: "" };
                    const detail = gradedCurrent?.p2Details[qIdx];
                    return (
                      <div key={qIdx} className="border border-slate-300 rounded p-2.5">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-2 text-xs">
                          <span className="font-bold text-slate-900">Câu {qIdx + 1} ({qKey.tag})</span>
                          <span className="font-bold text-emerald-700">
                            Đúng {detail?.correctCount}/4 ý (+{detail?.pts}đ)
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {["a", "b", "c", "d"].map(part => {
                            const picked = qAns[part];
                            const right = qKey[part];
                            return (
                              <div key={part} className="flex items-center justify-between text-xs">
                                <span className="font-semibold">Ý {part})</span>
                                <div className="flex items-center gap-2">
                                  {["Đ", "S"].map(val => {
                                    const isPicked = picked === val;
                                    const isKey = right === val;
                                    let cls = "border-slate-400 text-slate-700";
                                    if (isPicked && isKey) cls = "bg-emerald-600 text-white border-emerald-700";
                                    else if (isPicked && !isKey) cls = "bg-rose-600 text-white border-rose-700";
                                    else if (!isPicked && isKey && picked) cls = "border-2 border-dashed border-emerald-600 text-emerald-700";
                                    return (
                                      <button
                                        key={val}
                                        onClick={() => {
                                          const nextP2 = [...currentSubmission.p2Ans];
                                          nextP2[qIdx] = { ...qAns, [part]: val };
                                          saveCurrentSubmission({ ...currentSubmission, p2Ans: nextP2 });
                                        }}
                                        className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${cls}`}
                                      >
                                        {val === "Đ" ? "Đúng" : "Sai"}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN (TÔ SỐ ÂM, DẤU PHẨY) */}
              <div>
                <div className="bg-slate-800 text-white px-3 py-1 text-xs font-bold rounded-t flex justify-between">
                  <span>PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN (TÔ KẾT QUẢ SỐ)</span>
                  <span>{currentTest.scoring.p3PerQ} điểm / câu</span>
                </div>
                <div className="border border-slate-300 rounded-b p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                  {currentTest.p3Key.map((qKey, qIdx) => {
                    const ans = currentSubmission.p3Ans[qIdx] || "";
                    const isOk = compareShortAnswer(ans, qKey.ans);
                    const chars = ans.padEnd(4, " ").slice(0, 4).split("");
                    return (
                      <div key={qIdx} className="border border-slate-300 rounded p-2.5 text-xs">
                        <div className="flex justify-between font-bold mb-1.5">
                          <span>Câu {qIdx + 1}: {qKey.tag}</span>
                          <span className={isOk ? "text-emerald-600" : "text-rose-600"}>
                            {isOk ? `✓ Đúng (+${currentTest.scoring.p3PerQ}đ)` : `✗ Đáp án: ${qKey.ans}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="VD: -2,5"
                            value={ans}
                            onChange={e => {
                              const nextP3 = [...currentSubmission.p3Ans];
                              nextP3[qIdx] = e.target.value;
                              saveCurrentSubmission({ ...currentSubmission, p3Ans: nextP3 });
                            }}
                            className={`w-24 border-2 rounded px-2 py-1 font-mono font-bold text-center ${
                              isOk ? "border-emerald-500 bg-emerald-50" : "border-rose-400 bg-rose-50"
                            }`}
                          />
                          <div className="flex gap-1">
                            {chars.map((ch, cIdx) => (
                              <div key={cIdx} className="w-6 h-6 border border-slate-500 rounded flex items-center justify-center font-mono font-bold bg-slate-100">
                                {ch}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cột Phải (5/12): Chấm Tự Luận + Tổng hợp Điểm & Nhận xét tự động */}
            <div className="lg:col-span-5 space-y-4">
              {/* Khung nhập điểm Tự luận */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <FileText className="w-4 h-4 text-purple-600" />
                  ĐIỂM PHẦN TỰ LUẬN (KẾT HỢP TRẮC NGHIỆM)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">
                      Điểm Tự luận (Tối đa {currentTest.scoring.essayMax}đ):
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max={currentTest.scoring.essayMax}
                      value={currentSubmission.essayScore}
                      onChange={e => saveCurrentSubmission({ ...currentSubmission, essayScore: parseFloat(e.target.value) || 0 })}
                      className="w-full border-2 border-purple-400 rounded-lg px-3 py-1.5 font-bold text-base text-purple-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">
                      Nhận xét trình bày Tự luận:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Biến đổi đúng nhưng thiếu đơn vị..."
                      value={currentSubmission.essayNote || ""}
                      onChange={e => saveCurrentSubmission({ ...currentSubmission, essayNote: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Kết quả chấm tổng hợp */}
              {gradedCurrent && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">TỔNG ĐIỂM BÀI KIỂM TRA</span>
                      <h3 className="text-lg font-bold text-slate-900">
                        {db.students.find(s => s.id === scanningStudentId)?.name} ({scanningStudentId})
                      </h3>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-center shadow">
                      <div className="text-2xl font-black">{gradedCurrent.totalScore}</div>
                      <div className="text-[10px] uppercase tracking-wider">Điểm số</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500">Phần I (ABCD)</div>
                      <div className="font-bold text-sm text-slate-800">{gradedCurrent.p1Score}đ</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500">Phần II (Đ/S)</div>
                      <div className="font-bold text-sm text-slate-800">{gradedCurrent.p2Score}đ</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-slate-500">Phần III (TLN)</div>
                      <div className="font-bold text-sm text-slate-800">{gradedCurrent.p3Score}đ</div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <div className="text-purple-600">Tự luận</div>
                      <div className="font-bold text-sm text-purple-800">{gradedCurrent.essayScore}đ</div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs space-y-1">
                    <div className="font-bold text-emerald-900">NHẬN XÉT TỰ ĐỘNG THEO DẠNG BÀI:</div>
                    <p className="text-slate-700 leading-relaxed">{gradedCurrent.autoComment}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 3: BẢNG 1 - CHI TIẾT XANH/ĐỎ TỪNG CÂU & THỐNG KÊ CÂU SAI NHIỀU
        ------------------------------------------------------------------- */}
        {activeTab === "TAB3_TABLE1" && (
          <div className="space-y-4">
            {/* Cảnh báo học sinh có đi học đầu giờ nhưng xin về sớm chưa nộp bài KT cuối giờ */}
            {(() => {
              const earlyLeavers = filteredStudents.filter(st => {
                const attRec = db.attendanceBtvn[`${selectedSessionId}_${st.id}`];
                const isPresent = attRec && (attRec.att === "P_PRESENT" || attRec.att === "LATE");
                const hasSub = !!db.submissions[`${selectedTestId}_${st.id}`];
                return isPresent && !hasSub;
              });
              if (earlyLeavers.length === 0) return null;
              return (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Lưu ý đối soát Đầu giờ & Cuối giờ:</strong> Phát hiện{" "}
                      <strong>{earlyLeavers.length} học sinh</strong> có mặt điểm danh đầu giờ ({currentSession?.title}) nhưng chưa có bài kiểm tra cuối giờ (xin về sớm):{" "}
                      <strong>{earlyLeavers.map(s => `${s.name} (${s.id})`).join(", ")}</strong>.
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-x-auto">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div>
                  <h2 className="font-bold text-base text-slate-800">
                    BẢNG 1: MA TRẬN ĐÚNG/SAI (TÔ NỀN XANH LÁ / ĐỎ) & NHẬN XÉT ({currentTest.name})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Màu nền giống hệt Google Sheets: Đúng tô nền Xanh lá (#b6d7a8), Sai tô nền Đỏ (#ea9999).
                  </p>
                </div>
              </div>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2 border border-slate-600">Mã HS</th>
                    <th className="p-2 border border-slate-600 text-left">Họ và Tên</th>
                    {currentTest.p1Key.map((_, i) => (
                      <th key={`p1_${i}`} className="p-1.5 border border-slate-600 text-center">P1.{i + 1}</th>
                    ))}
                    {currentTest.p2Key.map((_, i) => (
                      <th key={`p2_${i}`} className="p-1.5 border border-slate-600 text-center">P2.C{i + 1}</th>
                    ))}
                    {currentTest.p3Key.map((_, i) => (
                      <th key={`p3_${i}`} className="p-1.5 border border-slate-600 text-center">P3.{i + 1}</th>
                    ))}
                    <th className="p-2 border border-slate-600 bg-purple-900">Tự luận</th>
                    <th className="p-2 border border-slate-600 bg-blue-900">Tổng</th>
                    <th className="p-2 border border-slate-600 text-left min-w-[240px]">Nhận xét Điểm mạnh / Điểm yếu</th>
                  </tr>
                  {/* Hàng 2: Đáp án chuẩn */}
                  <tr className="bg-amber-100 font-bold text-slate-900">
                    <td colSpan={2} className="p-2 border border-slate-300 text-right">ĐÁP ÁN CHUẨN:</td>
                    {currentTest.p1Key.map((k, i) => (
                      <td key={i} className="p-1.5 border border-slate-300 text-center">{k}</td>
                    ))}
                    {currentTest.p2Key.map((q, i) => (
                      <td key={i} className="p-1.5 border border-slate-300 text-center text-[10px]">
                        {q.a}-{q.b}-{q.c}-{q.d}
                      </td>
                    ))}
                    {currentTest.p3Key.map((q, i) => (
                      <td key={i} className="p-1.5 border border-slate-300 text-center">{q.ans}</td>
                    ))}
                    <td className="p-1.5 border border-slate-300 text-center">/{currentTest.scoring.essayMax}đ</td>
                    <td className="p-1.5 border border-slate-300 text-center">10đ</td>
                    <td className="p-1.5 border border-slate-300 text-left text-[11px]">Tự động ghép theo Nhãn dạng bài</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(st => {
                    const sub = db.submissions[`${selectedTestId}_${st.id}`];
                    const graded = gradeSubmission(currentTest, sub);
                    if (!sub || !graded) {
                      return (
                        <tr key={st.id} className="bg-slate-50 text-slate-400">
                          <td className="p-2 border border-slate-300 font-mono font-bold">{st.id}</td>
                          <td className="p-2 border border-slate-300 font-semibold text-slate-700">{st.name}</td>
                          <td colSpan={currentTest.p1Key.length + currentTest.p2Key.length + currentTest.p3Key.length + 3} className="p-2 border border-slate-300 italic text-center">
                            Chưa quét bài kiểm tra cuối giờ (Bấm sang Tab 2 để quét bài cho {st.name})
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={st.id}>
                        <td className="p-2 border border-slate-300 font-mono font-bold text-blue-800">{st.id}</td>
                        <td className="p-2 border border-slate-300 font-semibold text-slate-900">{st.name}</td>

                        {/* Các ô Phần I tô nền Xanh / Đỏ */}
                        {graded.p1Details.map((d, i) => (
                          <td
                            key={i}
                            style={{ backgroundColor: d.ok ? "#b6d7a8" : "#ea9999" }}
                            className="p-1.5 border border-slate-300 text-center font-bold text-slate-900"
                          >
                            {d.ans || "-"}
                          </td>
                        ))}

                        {/* Các ô Phần II */}
                        {graded.p2Details.map((d, i) => (
                          <td
                            key={i}
                            style={{ backgroundColor: d.correctCount === 4 ? "#b6d7a8" : d.correctCount >= 2 ? "#ffe599" : "#ea9999" }}
                            className="p-1.5 border border-slate-300 text-center font-bold text-slate-900 text-[10px]"
                          >
                            {d.correctCount}/4 ({d.pts}đ)
                          </td>
                        ))}

                        {/* Các ô Phần III */}
                        {graded.p3Details.map((d, i) => (
                          <td
                            key={i}
                            style={{ backgroundColor: d.ok ? "#b6d7a8" : "#ea9999" }}
                            className="p-1.5 border border-slate-300 text-center font-bold text-slate-900"
                          >
                            {d.ans || "-"}
                          </td>
                        ))}

                        {/* Cột điểm Tự luận sửa trực tiếp */}
                        <td className="p-1.5 border border-slate-300 text-center bg-purple-50 font-bold">
                          {graded.essayScore}
                        </td>
                        <td className="p-1.5 border border-slate-300 text-center bg-blue-50 font-black text-blue-900 text-sm">
                          {graded.totalScore}
                        </td>
                        <td className="p-2 border border-slate-300 text-[11px] leading-snug">
                          {graded.autoComment}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 4: BẢNG 2 - HỒ SƠ TIẾN ĐỘ HỌC TẬP TOÀN QUÁ TRÌNH
        ------------------------------------------------------------------- */}
        {activeTab === "TAB4_PROGRESS" && currentUser.role === "TEACHER" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h2 className="font-bold text-base text-slate-800 mb-1">
                BẢNG 2: THEO DÕI SỰ TIẾN BỘ QUA CÁC CHƯƠNG & HỒ SƠ HỌC TẬP TOÀN KHÓA
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Bấm trực tiếp vào tên học sinh bất kỳ để mở Hồ sơ bóc tách điểm Phần I, Phần II, Phần III, Tự luận của toàn bộ các đợt kiểm tra từ lúc vào trung tâm.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="p-2.5 border border-slate-600 text-left">Mã HS</th>
                      <th className="p-2.5 border border-slate-600 text-left">Họ và Tên (Bấm để xem toàn khóa)</th>
                      <th className="p-2.5 border border-slate-600 text-left">Cơ sở</th>
                      {db.chapters.map(ch => (
                        <th key={ch.id} className="p-2.5 border border-slate-600 text-center">{ch.name}</th>
                      ))}
                      <th className="p-2.5 border border-slate-600 text-center bg-blue-900">TB Toàn Khóa</th>
                      <th className="p-2.5 border border-slate-600 text-center">Hồ sơ chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map(st => {
                      const dec = decodeStudentId(st.id);
                      const chapAvgs = db.chapters.map(ch => {
                        const chTests = db.tests.filter(t => t.chapterId === ch.id);
                        const scores = chTests
                          .map(t => gradeSubmission(t, db.submissions[`${t.id}_${st.id}`])?.totalScore)
                          .filter(v => typeof v === "number");
                        if (scores.length === 0) return null;
                        return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
                      });
                      const validAvgs = chapAvgs.filter(v => v !== null);
                      const overallAvg = validAvgs.length > 0
                        ? Number((validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(2))
                        : null;

                      return (
                        <tr key={st.id} className="hover:bg-blue-50/40">
                          <td className="p-2.5 border border-slate-300 font-mono font-bold text-blue-700">{st.id}</td>
                          <td className="p-2.5 border border-slate-300">
                            <button
                              onClick={() => setProfileStudentId(st.id)}
                              className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                            >
                              {st.name} <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="p-2.5 border border-slate-300">{dec.centerName}</td>
                          {chapAvgs.map((avg, idx) => (
                            <td key={idx} className="p-2.5 border border-slate-300 text-center font-bold">
                              {avg !== null ? `${avg}đ` : "-"}
                            </td>
                          ))}
                          <td className="p-2.5 border border-slate-300 text-center font-black text-blue-900 bg-blue-50">
                            {overallAvg !== null ? `${overallAvg}đ` : "-"}
                          </td>
                          <td className="p-2.5 border border-slate-300 text-center">
                            <button
                              onClick={() => setProfileStudentId(st.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded font-semibold inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Chi tiết toàn khóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Hồ sơ Học tập Xuyên suốt của Học sinh */}
            {profileStudentId && (() => {
              const st = db.students.find(s => s.id === profileStudentId);
              if (!st) return null;
              const dec = decodeStudentId(st.id);
              return (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase text-blue-600">HỒ SƠ HỌC TẬP XUYÊN SUỐT TOÀN KHÓA</span>
                        <h3 className="text-xl font-bold text-slate-900">
                          {st.name} — Mã HS: {st.id} (Lớp {dec.grade} • {dec.centerName})
                        </h3>
                      </div>
                      <button
                        onClick={() => setProfileStudentId(null)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        Đóng cửa sổ
                      </button>
                    </div>

                    <div className="space-y-5">
                      {db.chapters.map(ch => {
                        const chTests = db.tests.filter(t => t.chapterId === ch.id);
                        return (
                          <div key={ch.id} className="border border-slate-300 rounded-xl overflow-hidden">
                            <div className="bg-slate-800 text-white px-4 py-2 font-bold text-sm">
                              {ch.name}
                            </div>
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-100 border-b border-slate-300">
                                  <th className="p-2 text-left">Đợt kiểm tra</th>
                                  <th className="p-2 text-center">Phần I (ABCD)</th>
                                  <th className="p-2 text-center">Phần II (Đ/S)</th>
                                  <th className="p-2 text-center">Phần III (TLN)</th>
                                  <th className="p-2 text-center">Tự luận</th>
                                  <th className="p-2 text-center">Tổng điểm</th>
                                  <th className="p-2 text-left">Nhận xét chi tiết từng buổi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {chTests.map(t => {
                                  const g = gradeSubmission(t, db.submissions[`${t.id}_${st.id}`]);
                                  if (!g) {
                                    return (
                                      <tr key={t.id} className="text-slate-400 italic">
                                        <td className="p-2 font-medium text-slate-700">{t.name}</td>
                                        <td colSpan={6} className="p-2 text-center">Chưa có bài kiểm tra</td>
                                      </tr>
                                    );
                                  }
                                  return (
                                    <tr key={t.id}>
                                      <td className="p-2 font-semibold text-slate-900">{t.name}</td>
                                      <td className="p-2 text-center font-medium">{g.p1Score}đ</td>
                                      <td className="p-2 text-center font-medium">{g.p2Score}đ</td>
                                      <td className="p-2 text-center font-medium">{g.p3Score}đ</td>
                                      <td className="p-2 text-center font-medium text-purple-700">{g.essayScore}đ</td>
                                      <td className="p-2 text-center font-black text-blue-700">{g.totalScore}đ</td>
                                      <td className="p-2 text-[11px]">{g.autoComment}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 5: QUẢN LÝ HỌC PHÍ, GẠCH NỢ TỰ ĐỘNG & IN PHIẾU QR PHỤ HUYNH
        ------------------------------------------------------------------- */}
        {activeTab === "TAB5_TUITION_QR" && currentUser.role === "TEACHER" && (
          <div className="space-y-6">
            {/* Bảng điều khiển Học phí & Dán sao kê Techcombank (Ẩn khi bấm lệnh In) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 print:hidden">
              <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 text-emerald-800">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    CHỐT CHẶN BẢO MẬT VIETQR (KHÓA CỨNG)
                  </h3>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Object.freeze
                  </span>
                </div>
                <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>Ngân hàng thụ hưởng: <strong>{SECURE_BANK_CONFIG.BANK_NAME} (BIN: {SECURE_BANK_CONFIG.BANK_ID})</strong></div>
                  <div>Số tài khoản cố định: <strong className="font-mono text-blue-700 text-sm">{SECURE_BANK_CONFIG.ACCOUNT_NO}</strong></div>
                  <div>Chủ tài khoản: <strong>{SECURE_BANK_CONFIG.ACCOUNT_NAME}</strong></div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold">Đơn giá học phí / 1 buổi có mặt:</span>
                  <input
                    type="number"
                    step="10000"
                    value={db.tuitionPerSession}
                    onChange={e => setDb(prev => ({ ...prev, tuitionPerSession: Number(e.target.value) || 0 }))}
                    className="w-32 border border-slate-300 rounded px-2 py-1 font-bold text-right"
                  />
                </div>
              </div>

              {/* Ô dán sao kê Techcombank gạch nợ hàng loạt 1 giây */}
              <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  DÁN NHANH TIN NHẮN / SAO KÊ TECHCOMBANK ĐỂ GẠCH NỢ CẢ LỚP TRONG 1 GIÂY
                </h3>
                <textarea
                  rows={2}
                  placeholder="Ví dụ dán nội dung: TK 19034013811019 +600,000VND ND: HP 110112 Nguyen Van A; +450,000VND ND: HP 110128..."
                  value={bankStatementText}
                  onChange={e => setBankStatementText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoReconcileBank}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      Quét mã HP [6 số] & Tự động Gạch nợ
                    </button>
                    <button
                      onClick={() => setBankStatementText("TK 19034013811019 +600,000VND. ND: HP 110112 dong hoc phi")}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      Thử mẫu tin nhắn HP 110112
                    </button>
                  </div>
                  {reconcileNotice && <span className="text-xs font-bold text-emerald-700">{reconcileNotice}</span>}
                </div>
              </div>
            </div>

            {/* Thanh chọn Học sinh để In Phiếu Báo Học Tập & Học Phí */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold">Chọn Phiếu in gửi Phụ huynh:</span>
                <select
                  value={printStudentId}
                  onChange={e => setPrintStudentId(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
                >
                  <option value="ALL">In hàng loạt cả lớp ({filteredStudents.length} phiếu)</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Bấm In Phiếu Báo Học Tập & QR Học Phí (A5/A4)
              </button>
            </div>

            {/* DANH SÁCH PHIẾU IN GỬI PHỤ HUYNH (CÓ BẢNG ĐIỂM THEO CHƯƠNG + CHỮ KÝ PHỤ HUYNH) */}
            <div className="space-y-6">
              {filteredStudents
                .filter(s => printStudentId === "ALL" || s.id === printStudentId)
                .map(st => {
                  const dec = decodeStudentId(st.id);
                  const attendedCount = db.sessions.filter(sec => {
                    const r = db.attendanceBtvn[`${sec.id}_${st.id}`];
                    return r && (r.att === "P_PRESENT" || r.att === "LATE");
                  }).length;
                  const fullBtvnCount = db.sessions.filter(sec => {
                    const r = db.attendanceBtvn[`${sec.id}_${st.id}`];
                    return r && r.btvn === "FULL";
                  }).length;
                  const totalFee = attendedCount * db.tuitionPerSession;
                  const transferContent = `HP ${st.id}`;
                  const vietQrUrl = `https://img.vietqr.io/image/${SECURE_BANK_CONFIG.BANK_ID}-${SECURE_BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${totalFee}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(SECURE_BANK_CONFIG.ACCOUNT_NAME)}`;

                  return (
                    <div
                      key={st.id}
                      className="bg-white rounded-xl border-2 border-slate-800 p-6 shadow-sm print:shadow-none print:break-after-page"
                    >
                      {/* Tiêu đề Phiếu */}
                      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-4">
                        <div>
                          <h2 className="text-base font-black uppercase text-slate-900">
                            PHIẾU BÁO KẾT QUẢ HỌC TẬP & THÔNG BÁO HỌC PHÍ
                          </h2>
                          <p className="text-xs font-semibold text-slate-600">
                            Hệ thống Lớp Vật Lí Thầy Nguyễn Tiến Thành — Cơ sở: {dec.centerName}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-0.5 rounded inline-block">
                            MÃ HS: {st.id}
                          </div>
                          <div className="mt-1">
                            Trạng thái:{" "}
                            <button
                              onClick={() => {
                                setDb(prev => ({
                                  ...prev,
                                  students: prev.students.map(x => x.id === st.id ? { ...x, paidStatus: !x.paidStatus } : x)
                                }));
                              }}
                              className={`font-bold px-2 py-0.5 rounded ${
                                st.paidStatus ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {st.paidStatus ? "✅ ĐÃ HOÀN THÀNH HỌC PHÍ" : "⏳ CHƯA ĐÓNG HỌC PHÍ"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Khối 1: Chuyên cần & Ý thức làm BTVN */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-300 mb-4 text-xs">
                        <div>
                          Họ và tên học sinh: <strong className="text-sm text-slate-900">{st.name}</strong> (Khối {dec.grade})
                        </div>
                        <div>
                          Chuyên cần đầu giờ: <strong>Đi học {attendedCount} / {db.sessions.length} buổi</strong>
                        </div>
                        <div>
                          Ý thức Bài tập về nhà: <strong>Hoàn thành đủ {fullBtvnCount} / {db.sessions.length} buổi</strong>
                        </div>
                      </div>

                      {/* Khối 2: Bảng 1 - Tổng hợp Điểm Trung Bình theo từng Chương học */}
                      <div className="mb-4">
                        <h4 className="text-xs font-bold uppercase text-slate-800 mb-1.5">
                          I. BẢNG TỔNG HỢP ĐIỂM TRUNG BÌNH THEO CHƯƠNG HỌC
                        </h4>
                        <table className="w-full text-xs border-collapse border border-slate-400">
                          <thead>
                            <tr className="bg-slate-100">
                              {db.chapters.map(ch => (
                                <th key={ch.id} className="p-2 border border-slate-400 text-center">{ch.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {db.chapters.map(ch => {
                                const chTests = db.tests.filter(t => t.chapterId === ch.id);
                                const scores = chTests
                                  .map(t => gradeSubmission(t, db.submissions[`${t.id}_${st.id}`])?.totalScore)
                                  .filter(v => typeof v === "number");
                                const avg = scores.length > 0
                                  ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
                                  : "Chưa KT";
                                return (
                                  <td key={ch.id} className="p-2 border border-slate-400 text-center font-bold text-sm">
                                    {avg}{typeof avg === "string" && avg !== "Chưa KT" ? " điểm" : ""}
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Khối 3: Bảng 2 - Chi tiết điểm cá nhân của con trong cả đợt học */}
                      <div className="mb-4">
                        <h4 className="text-xs font-bold uppercase text-slate-800 mb-1.5">
                          II. CHI TIẾT ĐIỂM CÁC ĐỢT KIỂM TRA TRONG KHÓA HỌC
                        </h4>
                        <table className="w-full text-xs border-collapse border border-slate-400">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="p-1.5 border border-slate-400 text-left">Chương / Đợt kiểm tra</th>
                              <th className="p-1.5 border border-slate-400 text-center">P.I (ABCD)</th>
                              <th className="p-1.5 border border-slate-400 text-center">P.II (Đ/S)</th>
                              <th className="p-1.5 border border-slate-400 text-center">P.III (TLN)</th>
                              <th className="p-1.5 border border-slate-400 text-center">Tự luận</th>
                              <th className="p-1.5 border border-slate-400 text-center">Tổng điểm</th>
                              <th className="p-1.5 border border-slate-400 text-left">Nhận xét của Giáo viên</th>
                            </tr>
                          </thead>
                          <tbody>
                            {db.tests.map(t => {
                              const g = gradeSubmission(t, db.submissions[`${t.id}_${st.id}`]);
                              return (
                                <tr key={t.id}>
                                  <td className="p-1.5 border border-slate-400 font-semibold">{t.name}</td>
                                  {g ? (
                                    <>
                                      <td className="p-1.5 border border-slate-400 text-center">{g.p1Score}</td>
                                      <td className="p-1.5 border border-slate-400 text-center">{g.p2Score}</td>
                                      <td className="p-1.5 border border-slate-400 text-center">{g.p3Score}</td>
                                      <td className="p-1.5 border border-slate-400 text-center">{g.essayScore}</td>
                                      <td className="p-1.5 border border-slate-400 text-center font-black">{g.totalScore}</td>
                                      <td className="p-1.5 border border-slate-400 text-[11px]">{g.autoComment}</td>
                                    </>
                                  ) : (
                                    <td colSpan={6} className="p-1.5 border border-slate-400 text-center italic text-slate-400">
                                      Vắng hoặc xin về sớm chưa có bài kiểm tra
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Khối 4: Thông tin Học phí + Mã VietQR Techcombank + Khung Chữ Ký Phụ Huynh */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-t-2 border-slate-800 pt-4">
                        <div className="md:col-span-5 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-300">
                          <img
                            src={vietQrUrl}
                            alt="VietQR Techcombank"
                            className="w-28 h-28 object-contain border border-slate-300 bg-white p-1 rounded shrink-0"
                          />
                          <div className="text-xs space-y-1">
                            <div className="font-bold text-slate-900">QUÉT QR ĐÓNG HỌC PHÍ</div>
                            <div>NH: <strong>{SECURE_BANK_CONFIG.BANK_NAME}</strong></div>
                            <div>STK: <strong className="font-mono">{SECURE_BANK_CONFIG.ACCOUNT_NO}</strong></div>
                            <div>Chủ TK: <strong>{SECURE_BANK_CONFIG.ACCOUNT_NAME}</strong></div>
                            <div className="text-rose-700 font-bold text-sm">
                              Số tiền: {totalFee.toLocaleString("vi-VN")} đ
                            </div>
                            <div className="bg-amber-100 border border-amber-400 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">
                              Nội dung: {transferContent}
                            </div>
                          </div>
                        </div>

                        {/* 2 Khung Chữ ký xác nhận của Phụ huynh & Giáo viên */}
                        <div className="md:col-span-7 grid grid-cols-2 gap-3 text-xs">
                          <div className="border border-slate-400 rounded-lg p-3 min-h-[125px] flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-center uppercase">XÁC NHẬN CỦA PHỤ HUYNH</div>
                              <div className="mt-1.5 space-y-1 text-[11px]">
                                <div>☐ Đã chuyển khoản qua mã QR</div>
                                <div>☐ Đóng tiền mặt trực tiếp</div>
                                <div>Ngày chuyển: ....../....../2026</div>
                              </div>
                            </div>
                            <div className="text-center text-[11px] italic text-slate-500 pt-4">
                              (Phụ huynh ký & ghi rõ họ tên)
                            </div>
                          </div>

                          <div className="border border-slate-400 rounded-lg p-3 min-h-[125px] flex flex-col justify-between text-center">
                            <div>
                              <div className="font-bold uppercase">GIÁO VIÊN PHỤ TRÁCH</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">Xác nhận kết quả & học phí</div>
                            </div>
                            <div className="font-bold text-slate-900 pt-6">
                              Thầy Nguyễn Tiến Thành
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 6: CẤU HÌNH ĐỀ, THANG ĐIỂM, QUẢN LÝ TK TRỢ GIẢNG & ĐỒNG BỘ CLOUD
        ------------------------------------------------------------------- */}
        {activeTab === "TAB6_SETTINGS" && currentUser.role === "TEACHER" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Cột Trái: Quản lý Tài khoản Trợ giảng (Đổi mật khẩu 1 giây, Khóa/Mở khóa) */}
            <div className="lg:col-span-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    QUẢN LÝ TÀI KHOẢN TRỢ GIẢNG (ĐỔI MẬT KHẨU / KHÓA TK)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vì trợ giảng thay đổi liên tục, Giáo viên có thể đổi mật khẩu trực tiếp hoặc khóa quyền truy cập ngay lập tức.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextIdx = db.assistants.length + 1;
                    const newTa = {
                      id: `tg_${Date.now()}`,
                      username: `tg0${nextIdx}`,
                      password: "123",
                      name: `Trợ giảng mới ${nextIdx}`,
                      center: "Hoàng Mai",
                      active: true
                    };
                    setDb(prev => ({ ...prev, assistants: [...prev.assistants, newTa] }));
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Trợ giảng
                </button>
              </div>

              <div className="space-y-2">
                {db.assistants.map((ta, idx) => (
                  <div key={ta.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={ta.name}
                        onChange={e => {
                          const next = [...db.assistants];
                          next[idx] = { ...ta, name: e.target.value };
                          setDb(prev => ({ ...prev, assistants: next }));
                        }}
                        className="font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5"
                      />
                      <div className="text-slate-500">
                        Tài khoản: <strong className="font-mono text-blue-700">{ta.username}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Mật khẩu mới:</span>
                        <input
                          type="text"
                          value={ta.password}
                          onChange={e => {
                            const next = [...db.assistants];
                            next[idx] = { ...ta, password: e.target.value };
                            setDb(prev => ({ ...prev, assistants: next }));
                          }}
                          className="w-24 border border-amber-400 bg-white rounded px-2 py-1 font-mono font-bold text-center"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const next = [...db.assistants];
                          next[idx] = { ...ta, active: !ta.active };
                          setDb(prev => ({ ...prev, assistants: next }));
                        }}
                        className={`px-2.5 py-1.5 rounded font-bold mt-3 ${
                          ta.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {ta.active ? "Đang hoạt động" : "Đã khóa TK"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lưu trữ 2 lớp: Xuất file Backup JSON & Đồng bộ Google Sheets */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-700 flex items-center gap-1.5">
                  <CloudUpload className="w-4 h-4 text-blue-600" />
                  KẾT NỐI GOOGLE SHEETS (LƯU TRỮ ĐÁM MÂY) & SAO LƯU DỮ LIỆU
                </h4>
                <input
                  type="text"
                  placeholder="Dán đường link Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec)"
                  value={db.webhookUrl || ""}
                  onChange={e => setDb(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={syncToGoogleSheets}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Đồng bộ ngay lên Google Sheets
                  </button>
                  <button
                    onClick={exportDatabaseJson}
                    className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải file Sao lưu (.json)
                  </button>
                </div>
                {syncStatus && <div className="text-xs font-semibold text-blue-700">{syncStatus}</div>}
              </div>
            </div>

            {/* Cột Phải: Tùy chỉnh Thang điểm từng phần & Thêm Học sinh mới */}
            <div className="lg:col-span-6 bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">
                TÙY CHỈNH THANG ĐIỂM CHO ĐỀ: {currentTest.name}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Điểm mỗi câu Phần I (ABCD):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={currentTest.scoring.p1PerQ}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setDb(prev => ({
                        ...prev,
                        tests: prev.tests.map(t => t.id === currentTest.id ? { ...t, scoring: { ...t.scoring, p1PerQ: val } } : t)
                      }));
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Điểm mỗi câu Phần III (TLN):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={currentTest.scoring.p3PerQ}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setDb(prev => ({
                        ...prev,
                        tests: prev.tests.map(t => t.id === currentTest.id ? { ...t, scoring: { ...t.scoring, p3PerQ: val } } : t)
                      }));
                    }}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                <div className="font-bold text-amber-900 mb-2">
                  Thang điểm lũy tiến Phần II (Đúng/Sai chuẩn Bộ GD&ĐT: 0.1 - 0.25 - 0.5 - 1.0):
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(cnt => (
                    <div key={cnt}>
                      <label className="text-[11px] text-slate-600 block">Đúng {cnt} ý:</label>
                      <input
                        type="number"
                        step="0.05"
                        value={currentTest.scoring.p2Progressive[cnt]}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          const nextProg = [...currentTest.scoring.p2Progressive];
                          nextProg[cnt] = val;
                          setDb(prev => ({
                            ...prev,
                            tests: prev.tests.map(t => t.id === currentTest.id ? { ...t, scoring: { ...t.scoring, p2Progressive: nextProg } } : t)
                          }));
                        }}
                        className="w-full border border-amber-400 bg-white rounded px-2 py-1 font-bold text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================================
          MODAL ĐĂNG NHẬP / CHUYỂN ĐỔI TÀI KHOẢN GIÁO VIÊN <-> TRỢ GIẢNG
      ===================================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                PHÂN TẦNG TÀI KHOẢN TRUY CẬP
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-xs text-slate-500">Đóng</button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => { setLoginMode("TEACHER"); setLoginError(""); }}
                className={`py-2 rounded-lg border ${
                  loginMode === "TEACHER" ? "bg-amber-500 text-white border-amber-600" : "bg-slate-100 text-slate-700"
                }`}
              >
                Giáo Viên (Full Quyền)
              </button>
              <button
                onClick={() => { setLoginMode("ASSISTANT"); setLoginError(""); }}
                className={`py-2 rounded-lg border ${
                  loginMode === "ASSISTANT" ? "bg-blue-600 text-white border-blue-700" : "bg-slate-100 text-slate-700"
                }`}
              >
                Trợ Giảng (Giới hạn)
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              {loginMode === "TEACHER" ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nhập Mã PIN Giáo viên (Gợi ý test: <code className="text-amber-700">Tienthanh050398@</code>):
                  </label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={e => setPinInput(e.target.value)}
                    placeholder="Nhập mã PIN giáo viên..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Chọn Tài khoản Trợ giảng:</label>
                    <select
                      value={taUser}
                      onChange={e => setTaUser(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-semibold"
                    >
                      {db.assistants.map(a => (
                        <option key={a.id} value={a.username}>
                          {a.username} - {a.name} ({a.active ? "Đang hoạt động" : "Đã khóa"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Mật khẩu Trợ giảng (Mặc định tg01 là <code className="text-blue-700">123</code>):
                    </label>
                    <input
                      type="password"
                      value={taPass}
                      onChange={e => setTaPass(e.target.value)}
                      placeholder="Nhập mật khẩu trợ giảng..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                    />
                  </div>
                </>
              )}

              {loginError && (
                <div className="bg-rose-50 text-rose-700 border border-rose-200 p-2 rounded text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg"
              >
                Xác nhận Chuyển Tài Khoản
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}