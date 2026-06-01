// Default fallback data (in case data.json fetch fails or CORS blocks it)
const initialData = {
    expenses: [
        { id: 1, date: "2026-05-15", category: "לימודים וקורסים", description: "קורס מנעולנות מעשי", amount: 2500 },
        { id: 2, date: "2026-05-20", category: "ציוד וכלי עבודה", description: "מברגת אימפקט ומקדחים", amount: 850 }
    ],
    income: [],
    tasks: [
        { id: 1, text: "לסיים לימודי הנדסאי חשמל במכללה", completed: false, targetDate: "2026-10" },
        { id: 2, text: "לרכוש צילינדרים לפלדלת ומנעולים ראשוניים למלאי", completed: false, targetDate: "2026-06" },
        { id: 3, text: "לפרסם פוסט היכרות ראשון בקבוצות ירוחם בפייסבוק", completed: false, targetDate: "2026-06" },
        { id: 4, text: "להגיע ל-10 לקוחות ראשונים במנעולנות והנדימן", completed: false, targetDate: "2026-06" }
    ]
};



let currentAgent = 'strategist';
let selectedTemplateIndex = 0;

// Templates definitions
const agentTemplates = {
    strategist: [
        {
            title: "📊 ניתוח מתחרים ממוקד",
            text: "🔍 *ניתוח מתחרים וערוצי חדירה עבור: [פרטים]*\n\nעל בסיס המידע על השוק המקומי בירוחם והסביבה:\n\n1. *מתחרים מרחוק* (מבאר שבע/דימונה): גובים דמי נסיעה גבוהים (150-250 ש\"ח) וזמן הגעה ארוך (מעל שעה).\n2. *חובבנים מקומיים*: עובדים ללא רישיון, ללא ביטוח מקצועי, ורמת גימור נמוכה.\n\n*הפער העסקי וההזדמנות של זכריה:*\n✔️ *מקומי ומהיר*: הגעה תוך 15-20 דקות בתוך ירוחם.\n✔️ *מחיר הוגן*: ללא דמי נסיעה מופקעים מחוץ לעיר.\n✔️ *אחריות וביטוח*: עבודה מבוטחת ומורשית לחלוטין (משרה ביטחון בלקוחות).\n\n*המלצה אסטרטגית*: להבליט בכל פרסום את המקומיות ואת תעודת המקצועיות/ביטוח.",
            placeholder: "השירות החדש או סוג העבודה (למשל: החלפת מנגנונים לדלת)"
        },
        {
            title: "💰 ייעוץ אסטרטגי ופיננסי (חי)",
            text: "", // Dynamic
            placeholder: "לחץ על כפתור הייצור לניתוח נתוני האמת של העסק שלך"
        }
    ],
    cmo: [
        {
            title: "📢 תוכנית שיווק דיגיטלית",
            text: "📢 *תוכנית שיווק דיגיטלית לשירות: [פרטים]*\n\n*1. ערוצי הפצה מומלצים בירוחם:*\n* 💬 *קבוצות וואטסאפ שכונתיות*: הערוץ החזק ביותר בירוחם לחשיפה מיידית.\n* 👥 *קבוצות פייסבוק מקומיות* ('ירוחם שלי', 'ירוחם ביחד'): מיועד לחיפוש אורגני והמלצות.\n* 📍 *כרטיס גוגל לעסק (Google Maps)*: קריטי למנעולנות חירום (מציאת מנעולן בשעת צורך).\n\n*2. מסגרת תקציב שיווק מוצעת (0 ש\"ח פרסום ממומן בשלב ראשון):*\n* תקציב פייסבוק/וואטסאפ: 0 ש\"ח (שיווק אורגני קבוצתי).\n* כרטיס ביקור דיגיטלי / פליירים מקומיים: 150-200 ש\"ח הדפסה חד-פעמית.\n\n*3. תוכנית עבודה חודשית:*\n* שבוע 1-2: פתיחה ומיקום בגוגל מפות, רישום פוסטים אורגניים בקבוצות.\n* שבוע 3-4: שליחת הודעות חוות דעת ללקוחות קיימים וצבירת המלצות ברשת.",
            placeholder: "השירות לקמפיין (למשל: תליית מסכי טלוויזיה)"
        },
        {
            title: "🎯 תכנון קמפיין רשתות חברתיות",
            text: "🎯 *תוכנית קמפיין ממוקד לרשתות: [פרטים]*\n\n* קהל יעד מרכזי: משפחות צעירות, שוכרי דירות ובעלי עסקים בירוחם.\n* מסר מרכזי: שירות מקומי, מהיר, אמין וללא דמי נסיעה מיותרים.\n* קריאייטיב מומלץ: תמונת מוצר (למשל ad_locksmith.png לפוסט מנעולן) יחד עם טקסט קצר ומחיר הוגן.\n* מדד הצלחה לקמפיין (KPI): השגת לפחות 3 פניות בשבוע ראשון.\n\n#ירוחם #מנעולן_בירוחם #הנדימן_בירוחם #שירות_מקומי #זכריה_פתרונות_לבית",
            placeholder: "נושא הקמפיין (למשל: החלפת צילינדר מוגן פריצה)"
        }
    ],
    content: [
        {
            title: "✍️ סדרת פוסטים שיווקיים (מותאם סגנון)",
            text: "", // Dynamic based on Tone Selector
            placeholder: "הזן מספר טלפון או פרט שירות"
        },
        {
            title: "📖 מאמר מקצועי / פוסט סמכות לבלוג",
            text: "📖 *מדריך בטיחות לבית: 3 סימנים שהגיע הזמן להחליף את הצילינדר בדלת* 🚪🔑\n\nרבים מאיתנו נוטים להזניח את דלת הכניסה שלנו, עד לרגע שבו היא פשוט מסרבת להיפתח. הנה 3 סימנים פשוטים שיעזרו לכם לזהות בעיות מראש ולמנוע מצב של נעילה מחוץ לבית:\n\n1. *המפתח מסתובב קשה או נתקע*: זהו הסימן הראשון לשחיקה של הפינים הפנימיים בצילינדר או חדירת חלודה ואבק.\n2. *החלפתם דיירים או עברתם דירה*: אתם לעולם לא יכולים לדעת כמה העתקים של המפתח מסתובבים אצל אנשים זרים. החלפת צילינדר מעניקה שקט נפשי מלא.\n3. *הדלת נגררת או זקוקה לטריקה חזקה*: שקיעה של הדלת שוחקת את המנעול ומפעילה עליו לחץ לא בריא.\n\n*זכריה - פתרונות ושירותים לבית* מציע בדיקת תקינות לדלתות והחלפת צילינדרים מקוריים באריזה סגורה במחירים שקופים מראש.\n\n📞 לייעוץ מקצועי ללא עלות: [טלפון]",
            placeholder: "הכנס טלפון ליצירת CTA"
        }
    ],
    rnd: [
        {
            title: "💡 סיעור מוחות ופתרונות יצירתיים",
            text: "💡 *סיעור מוחות ופתרונות יצירתיים לבעיה: [פרטים]*\n\n1. *פתרון א': ייחודיות מבדלת* – הצעת 'שירות בדיקת תקינות דלת חינם' לכל לקוח שמזמין עבודת הנדימן (תליית טלוויזיה או הרכבה). זה יוצר ערך מוסף עצום ומייצר מכירות המשך (Upsell) של צילינדרים או כיוון דלתות.\n2. *פתרון ב': שיתוף פעולה מקומי* – יצירת קשר עם מתווכים ומנהלי נכסים בירוחם (המשכירים דירות לסטודנטים או למשפחות) והצעת שירות החלפת מנעול מהיר ומחיר מיוחד במעברי דירה.\n3. *פתרון ג': יצירת חבילות (Bundling)* – חבילת 'כניסה לבית חדש' הכוללת הרכבת 2 רהיטים, תליית טלוויזיה והחלפת צילינדר כניסה במחיר קבוצתי מוזל.\n\n*דירוג יישימות:* פתרון א' ו-ב' הם הקלים ביותר ליישום מיידי ללא עלויות.",
            placeholder: "תאר את האתגר או הבעיה בעסק (למשל: קושי להגיע ללקוחות ראשונים)"
        },
        {
            title: "⚙️ שיפור תהליכים ואוטומציה",
            text: "⚙️ *ייעול תהליכים ואוטומציה עבור: [פרטים]*\n\nכדי לחסוך לך זמן יקר ולאפשר לך להתמקד בעבודה הפיזית:\n\n1. *אוטומציית איסוף חוות דעת*: הגדרת הודעה מתוזמנת אוטומטית בוואטסאפ 24 שעות לאחר סיום העבודה, המזמינה את הלקוח ללחוץ על קישור ולכתוב המלצה.\n2. *דיגיטציה של הצעות מחיר*: יצירת תבנית וואטסאפ מהירה מוכנה בבוט (כפי שבנינו) לשליחת הצעת מחיר מסודרת ומקצועית תוך 30 שניות בלבד משיחת הטלפון.\n3. *ניהול מלאי דיגיטלי*: שימוש בטאב המשימות בדאשבורד למעקב מלאי (צילינדרים, מנגנונים) כדי למנוע מצב שבו אתה מגיע לקריאת שירות ללא החלקים המתאימים.\n\n*תועלת צפויה:* חיסכון של כ-4 שעות שבועיות של עבודה משרדית.",
            placeholder: "סוג התהליך לשיפור (למשל: איסוף המלצות מלקוחות)"
        }
    ],
    coach: [
        {
            title: "📅 תכנון לו\"ז שבועי וחלונות ביצוע",
            text: "📅 *לו\"ז עבודה ופרודוקטיביות מוצע עבור: [פרטים]*\n\nכדי להוציא את המשימות לפועל ביעילות ובשיטת פומודורו (25 דקות ריכוז, 5 דקות מנוחה):\n\n* 🕒 *חלון זמן א': שיווק ופרסום מקומי*\n  * מתי: יום ראשון הקרוב בשעה 09:00 (משך: 60 דקות - 2 מחזורי פומודורו).\n  * משימה: פרסום הפוסט השבועי בקבוצות ירוחם ומעקב פניות.\n\n* 🕒 *חלון זמן ב': רכש והצטיידות מלאי*\n  * מתי: יום שלישי בשעה 10:00 (משך: 90 דקות - 3 מחזורי פומודורו).\n  * משימה: השלמת רכש מנעולים, מברגים וצילינדרים לפלדלת למלאי העסקי.\n\n* 🕒 *חלון זמן ג': סקירה ועדכון פיננסי*\n  * מתי: יום חמישי בשעה 20:00 (משך: 30 דקות - מחזור פומודורו אחד).\n  * משימה: סנכרון הוצאות והכנסות באמצעות בוט הטלגרם וסקירת רווחיות.\n\n*(לחץ על הכפתור 'הוסף ליומן' כדי לשבץ את חלונות הזמן ישירות ביומן שלך!)*",
            placeholder: "סוג המשימה לניהול זמן (למשל: הכנות שיווקיות ומלאי)"
        },
        {
            title: "🧘 בניית הרגלים חיוביים ומעקב",
            text: "🧘 *תוכנית הרגלים עסקית לזכריה: [פרטים]*\n\nכדי לייצר צמיחה יציבה ולמנוע דחיינות, מומלץ לאמץ את 3 ההרגלים הבאים:\n\n1. *הרגלי בוקר (ניהול מלאי)*: בדיקת תקינות של כלי העבודה ברכב וספירת הצילינדרים במלאי (5 דקות בכל בוקר).\n2. *הרגלי שטח (שימור לקוח)*: שליחת הודעת חוות דעת מנוסחת בוואטסאפ לכל לקוח שעבר טיפול (3 דקות בסיום כל עבודה).\n3. *הרגלי ערב (סגירה פיננסית)*: פתיחת הבוט בטלגרם ורישום של כל הוצאה או הכנסה שהיו באותו יום (2 דקות לפני השינה).\n\n*שיטת מעקב*: סמן ביומן פיזי או בדאשבורד V על כל יום שבו ההרגלים בוצעו בהצלחה. הצלחה נמדדת ברציפות!",
            placeholder: "ההרגל שברצונך לחזק (למשל: רישום פיננסי או שימור לקוחות)"
        }
    ]
};

// Initialize Application
window.addEventListener('DOMContentLoaded', async () => {
    // Set date input to today
    const dateInput = document.getElementById('transDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Set lead date input to today
    const leadDateInput = document.getElementById('leadDate');
    if (leadDateInput) {
        leadDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Initialize authentication and configuration load
    await checkAuthAndConfig();
    
    // Load data
    loadData();
});

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // Find button to active
    const btnIndex = tabId === 'finance' ? 0 : tabId === 'agents' ? 1 : tabId === 'crm' ? 2 : 3;
    if (document.querySelectorAll('.tab-btn')[btnIndex]) {
        document.querySelectorAll('.tab-btn')[btnIndex].classList.add('active');
    }
    
    // Render CRM if switched to CRM tab
    if (tabId === 'crm') {
        renderCRM();
    }
}

const GITHUB_REPO_OWNER = 'zaharr1990';
const GITHUB_REPO_NAME = 'zachariah-handyman';
const GITHUB_FILE_PATH = 'data.json';

// Helper for modern UTF-8 safe base64 decoding
function decodeBase64Utf8(base64Str) {
    const cleanStr = base64Str.replace(/\s/g, '');
    const binString = atob(cleanStr);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new TextDecoder().decode(bytes);
}

// Helper for modern UTF-8 safe base64 encoding
function encodeBase64Utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let binString = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binString += String.fromCharCode(bytes[i]);
    }
    return btoa(binString);
}

let pollingInterval = null;

// Check auth token from local config or query param
async function checkAuthAndConfig() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
        // Local proxy mode: bypass token checks, always active
        localStorage.setItem('zachariah_github_token', 'local_proxy');
        updateSyncButtonState('success');
        startPolling();
        return;
    }
    
    // 1. Check query parameter (from scan of QR code)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
        if (urlToken === 'local_proxy') {
            localStorage.removeItem('zachariah_github_token');
        } else {
            localStorage.setItem('zachariah_github_token', urlToken);
            showToast("חיבור מובייל בוצע בהצלחה! 📱☁️");
        }
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    let token = localStorage.getItem('zachariah_github_token');
    updateSyncButtonState(token ? 'success' : 'inactive');
    
    if (token) {
        startPolling();
    }
}

// Background polling for changes from other devices
function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(async () => {
        const token = localStorage.getItem('zachariah_github_token');
        if (!token) return;
        
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        try {
            if (isLocalhost) {
                const response = await fetch('/api/data?t=' + Date.now());
                if (response.ok) {
                    const fetchedData = await response.json();
                    const fetchedStr = JSON.stringify(fetchedData);
                    const localStr = localStorage.getItem('zachariah_business_data');
                    
                    if (fetchedStr !== localStr) {
                        console.log("Local proxy detected cloud database change. Updating local view...");
                        appData = fetchedData;
                        localStorage.setItem('zachariah_business_data', fetchedStr);
                        
                        renderFinance();
                        renderTasks();
                        renderCRM();
                        
                        updateSyncButtonState('success');
                    }
                }
            } else {
                const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}`;
                const response = await fetch(url + '?t=' + Date.now(), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const currentSha = localStorage.getItem('zachariah_github_file_sha');
                    if (data.sha !== currentSha) {
                        console.log("Cloud database changed. Updating local view...");
                        appData = JSON.parse(decodeBase64Utf8(data.content));
                        localStorage.setItem('zachariah_business_data', JSON.stringify(appData));
                        localStorage.setItem('zachariah_github_file_sha', data.sha);
                        
                        renderFinance();
                        renderTasks();
                        renderCRM();
                        
                        updateSyncButtonState('success');
                    }
                }
            }
        } catch (e) {
            console.error("Polling fetch error:", e);
        }
    }, 30000);
}

// Open modal for mobile QR login
async function openMobileSyncModal() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let token = localStorage.getItem('zachariah_github_token');
    
    let realToken = token;
    if (isLocalhost) {
        try {
            const res = await fetch('config.json?t=' + Date.now());
            if (res.ok) {
                const configData = await res.json();
                realToken = configData.github_token || '';
            }
        } catch (e) {
            console.error("Failed to load config.json for QR generation:", e);
        }
    }
    
    const input = document.getElementById('manualTokenInput');
    if (input) {
        input.value = (realToken === 'local_proxy') ? '' : (realToken || '');
    }
    
    // Generate QR code if token exists, otherwise show placeholder/empty
    const tokenForQr = (realToken === 'local_proxy') ? '' : (realToken || '');
    const url = `https://zaharr1990.github.io/zachariah-handyman/?token=${tokenForQr}`;
    const qrUrl = tokenForQr 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`
        : '';
        
    const qrImg = document.getElementById('mobileSyncQrCode');
    const qrContainer = document.getElementById('qrCodeContainer');
    
    if (qrImg) {
        qrImg.src = qrUrl;
        if (qrContainer) {
            qrContainer.style.display = tokenForQr ? 'inline-block' : 'none';
        }
    }
    
    document.getElementById('mobileSyncModal').style.display = 'flex';
}

function closeMobileSyncModal() {
    document.getElementById('mobileSyncModal').style.display = 'none';
}

function saveManualToken() {
    const input = document.getElementById('manualTokenInput');
    if (!input) return;
    const token = input.value.trim();
    if (!token) {
        localStorage.removeItem('zachariah_github_token');
        updateSyncButtonState('inactive');
        showToast("הסנכרון נותק. 🛑");
        closeMobileSyncModal();
        loadData();
        return;
    }
    if (!token.startsWith('ghp_')) {
        alert("מפתח גישה לא תקין. עליו להתחיל ב-ghp_");
        return;
    }
    localStorage.setItem('zachariah_github_token', token);
    showToast("חיבור לענן בוצע בהצלחה! ☁️");
    closeMobileSyncModal();
    loadData();
    startPolling();
}

// Update cloud sync visual button state
function updateSyncButtonState(state, errorMessage = '') {
    const btn = document.getElementById('syncIndicatorBtn');
    const icon = document.getElementById('syncIndicatorIcon');
    const text = document.getElementById('syncIndicatorText');
    if (!btn || !icon || !text) return;
    
    // Reset tooltip
    btn.removeAttribute('title');
    
    // Update modal error container if it exists
    const modalError = document.getElementById('syncModalError');
    if (modalError) {
        if (state === 'error' && errorMessage) {
            modalError.innerText = "שגיאה: " + errorMessage;
            modalError.style.display = 'block';
        } else if (state === 'success' || state === 'inactive' || state === 'syncing') {
            modalError.style.display = 'none';
        }
    }
    
    if (state === 'inactive') {
        btn.style.borderColor = 'var(--border-color)';
        btn.style.color = 'var(--text-muted)';
        icon.className = 'fa-solid fa-cloud';
        text.innerText = 'חיבור ענן';
    } else if (state === 'syncing') {
        btn.style.borderColor = 'var(--primary)';
        btn.style.color = 'var(--primary)';
        icon.className = 'fa-solid fa-cloud-arrow-up fa-bounce';
        text.innerText = 'מסתנכרן...';
    } else if (state === 'success') {
        btn.style.borderColor = 'var(--success)';
        btn.style.color = 'var(--success)';
        icon.className = 'fa-solid fa-cloud-arrow-down';
        text.innerText = 'מסונכרן לענן';
        setTimeout(() => {
            if (localStorage.getItem('zachariah_github_token')) {
                icon.className = 'fa-solid fa-cloud';
            }
        }, 1500);
    } else if (state === 'error') {
        btn.style.borderColor = 'var(--danger)';
        btn.style.color = 'var(--danger)';
        icon.className = 'fa-solid fa-circle-exclamation';
        text.innerText = 'שגיאת סנכרון';
        if (errorMessage) {
            btn.setAttribute('title', errorMessage);
        }
    }
}

// Load data from cloud (fallback to localStorage)
async function loadData() {
    let loaded = false;
    const token = localStorage.getItem('zachariah_github_token');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (token) {
        updateSyncButtonState('syncing');
        try {
            let fetchedData = null;
            
            if (isLocalhost) {
                const response = await fetch('/api/data?t=' + Date.now());
                if (response.ok) {
                    fetchedData = await response.json();
                    localStorage.setItem('zachariah_github_file_sha', 'local_proxy');
                } else {
                    throw new Error(`Local proxy returned status ${response.status} ${response.statusText}`);
                }
            } else {
                const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}?t=${Date.now()}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    fetchedData = JSON.parse(decodeBase64Utf8(data.content));
                    localStorage.setItem('zachariah_github_file_sha', data.sha);
                } else {
                    let errMsg = `GitHub load error: ${response.status} ${response.statusText}`;
                    if (response.status === 401 || response.status === 403) {
                        console.error("Authentication expired or invalid. Resetting sync status.");
                        localStorage.removeItem('zachariah_github_token');
                        updateSyncButtonState('inactive');
                    } else {
                        updateSyncButtonState('error', errMsg);
                    }
                }
            }
            
            if (fetchedData) {
                appData = fetchedData;
                localStorage.setItem('zachariah_business_data', JSON.stringify(appData));
                updateSyncButtonState('success');
                loaded = true;
            }
        } catch (e) {
            console.error("Failed to load business data from GitHub Pages:", e);
            updateSyncButtonState('error', e.message || String(e));
        }
    }
    
    if (!loaded) {
        try {
            const response = await fetch('data.json?t=' + Date.now());
            if (response.ok) {
                const fetchedData = await response.json();
                appData = fetchedData;
                localStorage.setItem('zachariah_business_data', JSON.stringify(appData));
                console.log("Successfully loaded latest public data.json.");
                loaded = true;
            } else {
                throw new Error("Server returned non-ok status");
            }
        } catch (e) {
            console.log("Could not fetch latest public data.json, falling back to local storage cache", e);
            const localData = localStorage.getItem('zachariah_business_data');
            if (localData) {
                appData = JSON.parse(localData);
                loaded = true;
            }
        }
    }
    
    if (!loaded) {
        appData = initialData;
    }
    
    renderFinance();
    renderTasks();
    renderCRM();
}

// Write to Local cache
function saveData() {
    localStorage.setItem('zachariah_business_data', JSON.stringify(appData));
}

// Write to Cloud database (pull first to merge, then push to prevent conflicts)
async function saveDataCloud(changeCallback) {
    // 1. Instantly update local UI for responsive experience
    changeCallback(appData);
    saveData();
    
    renderFinance();
    renderTasks();
    renderCRM();
    
    const token = localStorage.getItem('zachariah_github_token');
    if (!token) return; // Silent local-only fallback
    
    updateSyncButtonState('syncing');
    
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    try {
        if (isLocalhost) {
            // A. Fetch current remote version via proxy
            const getResponse = await fetch('/api/data?t=' + Date.now());
            if (!getResponse.ok) {
                throw new Error(`Cloud proxy fetch failed with status ${getResponse.status}`);
            }
            const remoteData = await getResponse.json();
            
            // B. Apply change callback on remote data (structural merge)
            changeCallback(remoteData);
            
            // C. POST updated data back to proxy
            const putResponse = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(remoteData)
            });
            
            if (putResponse.ok) {
                appData = remoteData;
                saveData();
                renderFinance();
                renderTasks();
                renderCRM();
                updateSyncButtonState('success');
            } else {
                throw new Error(`Local proxy POST failed with status ${putResponse.status}`);
            }
        } else {
            const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}`;
            
            // A. Fetch current remote version to avoid conflict
            const getResponse = await fetch(url + '?t=' + Date.now(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!getResponse.ok) {
                throw new Error(`Cloud fetch failed with status ${getResponse.status}`);
            }
            
            const remoteInfo = await getResponse.json();
            const remoteData = JSON.parse(decodeBase64Utf8(remoteInfo.content));
            
            // B. Apply change callback on remote data (structural merge)
            changeCallback(remoteData);
            
            // C. PUT updated data back to GitHub
            const base64Content = encodeBase64Utf8(JSON.stringify(remoteData, null, 2));
            const putResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: 'Auto-update business data from Web Dashboard',
                    content: base64Content,
                    sha: remoteInfo.sha
                })
            });
            
            if (putResponse.ok) {
                const putData = await putResponse.json();
                localStorage.setItem('zachariah_github_file_sha', putData.content.sha);
                
                // D. Set local state to the merged results
                appData = remoteData;
                saveData();
                
                renderFinance();
                renderTasks();
                renderCRM();
                
                updateSyncButtonState('success');
            } else {
                throw new Error(`GitHub PUT update failed with status ${putResponse.status}`);
            }
        }
    } catch (e) {
        console.error("Error during cloud sync save:", e);
        updateSyncButtonState('error', e.message || String(e));
    }
}


// Finance Section Logic
function renderFinance() {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    let totalIncomeSum = 0;
    let totalExpensesSum = 0;
    
    // Combine transactions
    const allTransactions = [];
    
    appData.income.forEach(item => {
        allTransactions.push({ ...item, type: 'income' });
        totalIncomeSum += parseFloat(item.amount);
    });
    
    appData.expenses.forEach(item => {
        allTransactions.push({ ...item, type: 'expense' });
        totalExpensesSum += parseFloat(item.amount);
    });
    
    // Sort transactions by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update stats cards
    document.getElementById('totalIncome').innerText = `₪${totalIncomeSum.toLocaleString()}`;
    document.getElementById('totalExpenses').innerText = `₪${totalExpensesSum.toLocaleString()}`;
    
    const balance = totalIncomeSum - totalExpensesSum;
    const balanceElement = document.getElementById('netProfit');
    balanceElement.innerText = `${balance >= 0 ? '+' : ''}₪${balance.toLocaleString()}`;
    
    if (balance > 0) {
        balanceElement.className = 'stat-value balance income';
    } else if (balance < 0) {
        balanceElement.className = 'stat-value balance expense';
    } else {
        balanceElement.className = 'stat-value balance';
    }
    
    // Render table rows
    allTransactions.forEach(t => {
        const tr = document.createElement('tr');
        const formattedDate = t.date.split('-').reverse().join('/');
        
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.category}</span></td>
            <td>${t.description}</td>
            <td style="font-weight:700; color: ${t.type === 'income' ? 'var(--success)' : 'var(--danger)'}">
                ${t.type === 'income' ? '+' : '-'}₪${parseFloat(t.amount).toLocaleString()}
            </td>
            <td>
                <button onclick="deleteTransaction(${t.id}, '${t.type}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer;" title="מחק">
                    <i class="fa-solid fa-trash-can" style="color: var(--danger)"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function addTransaction(e) {
    e.preventDefault();
    
    const type = document.getElementById('transType').value;
    const amount = parseFloat(document.getElementById('transAmount').value);
    const category = document.getElementById('transCategory').value;
    const description = document.getElementById('transDesc').value;
    const date = document.getElementById('transDate').value;
    
    const newTransaction = {
        id: Date.now(),
        date,
        category,
        description,
        amount
    };
    
    saveDataCloud(db => {
        if (type === 'income') {
            db.income.push(newTransaction);
        } else {
            db.expenses.push(newTransaction);
        }
    });
    
    // Reset form fields
    document.getElementById('transAmount').value = '';
    document.getElementById('transDesc').value = '';
    
    showToast("התנועה הפיננסית נשמרה בהצלחה! 💰");
}

function deleteTransaction(id, type) {
    if (confirm("האם אתה בטוח שברצונך למחוק תנועה זו?")) {
        saveDataCloud(db => {
            if (type === 'income') {
                db.income = db.income.filter(item => item.id !== id);
            } else {
                db.expenses = db.expenses.filter(item => item.id !== id);
            }
        });
        showToast("התנועה נמחקה. 🗑️");
    }
}

// Tasks Section Logic
function renderTasks() {
    const listContainer = document.getElementById('tasksList');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    // Sort tasks: uncompleted first, then by target date
    const sortedTasks = [...appData.tasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return a.targetDate.localeCompare(b.targetDate);
    });
    
    sortedTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        div.innerHTML = `
            <label class="task-checkbox-label">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="task-text">${task.text}</span>
            </label>
            <span class="task-date"><i class="fa-regular fa-calendar"></i> יעד: ${task.targetDate}</span>
        `;
        listContainer.appendChild(div);
    });
}

function toggleTask(id) {
    saveDataCloud(db => {
        db.tasks = db.tasks.map(t => {
            if (t.id === id) {
                return { ...t, completed: !t.completed };
            }
            return t;
        });
    });
    showToast("סטטוס המשימה עודכן! 🎯");
}

function addTask(e) {
    e.preventDefault();
    
    const text = document.getElementById('taskText').value;
    const targetDate = document.getElementById('taskDate').value;
    
    const newTask = {
        id: Date.now(),
        text,
        completed: false,
        targetDate
    };
    
    saveDataCloud(db => {
        db.tasks.push(newTask);
    });
    
    document.getElementById('taskText').value = '';
    document.getElementById('taskDate').value = '';
    
    showToast("המשימה נוספה בהצלחה! 🚀");
}

// ==========================================
// V2 Multi-Agent Router & CRM Logic
// ==========================================

// Routed agent visual container & askAgentSystem
function askAgentSystem() {
    const query = document.getElementById('agentQueryInput').value.trim();
    if (!query) {
        alert("אנא הזן שאלה או בקשה עבור מערכת הסוכנים!");
        return;
    }
    
    let routedAgent = 'strategist';
    const text = query.toLowerCase();
    
    if (text.includes('רווח') || text.includes('הפסד') || text.includes('כסף') || text.includes('פיננס') || text.includes('רווחי') || text.includes('הכנס') || text.includes('הוצא')) {
        routedAgent = 'strategist';
    } else if (text.includes('שיווק') || text.includes('פרסום') || text.includes('קמפיין') || text.includes('קהל') || text.includes('פייסבוק') || text.includes('ערוץ')) {
        routedAgent = 'cmo';
    } else if (text.includes('תוכן') || text.includes('פוסט') || text.includes('כתיבה') || text.includes('ניסוח') || text.includes('טלפון') || text.includes('סטטוס')) {
        routedAgent = 'content';
    } else if (text.includes('רעיון') || text.includes('חדשנות') || text.includes('אתגר') || text.includes('בעיה') || text.includes('קושי') || text.includes('מוצר')) {
        routedAgent = 'rnd';
    } else if (text.includes('זמן') || text.includes('לו"ז') || text.includes('פומודורו') || text.includes('הרגל') || text.includes('יומן') || text.includes('לוח זמנים')) {
        routedAgent = 'coach';
    }
    
    const indicator = document.getElementById('routedAgentIndicator');
    const agentNameEl = document.getElementById('activeAgentName');
    if (indicator) indicator.style.display = 'flex';
    
    const agentNames = {
        strategist: "האסטרטג הפיננסי (The Strategist)",
        cmo: "מנהל השיווק הדיגיטלי (The CMO)",
        content: "יוצר התוכן והקריאייטיב (The Content Creator)",
        rnd: "סוכן המחקר והחדשנות (The R&D Agent)",
        coach: "המאמן האישי והפרודוקטיביות (The Coach)"
    };
    
    if (agentNameEl) agentNameEl.innerText = agentNames[routedAgent];
    
    const responseArea = document.getElementById('agentResponseArea');
    if (responseArea) responseArea.style.display = 'block';
    
    let outputText = "";
    let visualsHTML = "";
    
    let totalIncome = 0;
    let totalExpenses = 0;
    appData.income.forEach(i => totalIncome += parseFloat(i.amount));
    appData.expenses.forEach(e => totalExpenses += parseFloat(e.amount));
    const netProfit = totalIncome - totalExpenses;
    
    const leads = appData.leads || [];
    const totalLeads = leads.length;
    const closedLeads = leads.filter(l => l.closed === true).length;
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
    
    if (routedAgent === 'strategist') {
        outputText = `📊 *ניתוח רווחיות קצר מהאסטרטג:*\n\n`;
        outputText += `• מחזור הכנסות כולל: ₪${totalIncome.toLocaleString()}\n`;
        outputText += `• הוצאות והשקעה בעסק: ₪${totalExpenses.toLocaleString()}\n`;
        outputText += `• רווח נקי מצטבר: ₪${netProfit.toLocaleString()}\n\n`;
        if (netProfit > 0) {
            outputText += `💡 *תובנה*: העסק מרוויח ושומר על מאזן חיובי. מומלץ להקצות 15% מהרווחים לרכש ציוד או מלאי מנעולים.`;
        } else {
            outputText += `💡 *תובנה*: שים לב שההוצאות עולות על ההכנסות. מומלץ להציע 'בדיקת תקינות דלת חינם' בכל עבודת הנדימן להגדלת ההכנסה ממנעולנות.`;
        }
        
        const incomePct = totalIncome > 0 ? 100 : 0;
        const expensePct = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 100;
        const profitPct = totalIncome > 0 ? Math.max(0, Math.round((netProfit / totalIncome) * 100)) : 0;
        
        visualsHTML = `
            <div class="infographic-wrapper">
                <div class="cro-bar-item">
                    <div class="cro-bar-header">
                        <span>הכנסות (₪${totalIncome.toLocaleString()})</span>
                        <span>100%</span>
                    </div>
                    <div class="cro-bar-track"><div class="cro-bar-fill success" style="width: ${incomePct}%"></div></div>
                </div>
                <div class="cro-bar-item">
                    <div class="cro-bar-header">
                        <span>הוצאות (₪${totalExpenses.toLocaleString()})</span>
                        <span>${expensePct}%</span>
                    </div>
                    <div class="cro-bar-track"><div class="cro-bar-fill danger" style="width: ${Math.min(100, expensePct)}%"></div></div>
                </div>
                <div class="cro-bar-item">
                    <div class="cro-bar-header">
                        <span>רווח נקי (₪${netProfit.toLocaleString()})</span>
                        <span>${profitPct}%</span>
                    </div>
                    <div class="cro-bar-track"><div class="cro-bar-fill primary" style="width: ${profitPct}%"></div></div>
                </div>
            </div>
        `;
    } 
    else if (routedAgent === 'cmo') {
        outputText = `📢 *תוכנית שיווק מהירה ממנהל השיווק:*\n\n`;
        outputText += `• יחס המרת לקוחות נוכחי: ${conversionRate}%\n`;
        outputText += `• ערוצי הגעה מומלצים לירוחם: קבוצות פייסבוק מקומיות וואטסאפ שכונתי.\n\n`;
        outputText += `💡 *המלצה*: פרסם תמיד בין השעות 18:00 ל-20:00. השתמש בתמונה ad_locksmith.png לקידום שירות מנעולנות.`;
        
        visualsHTML = `
            <div class="infographic-wrapper">
                <h4 style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">חלוקת מאמץ שיווקי מומלץ:</h4>
                <div class="cro-bar-item">
                    <div class="cro-bar-header"><span>וואטסאפ (אורגני קבוצות)</span><span>50%</span></div>
                    <div class="cro-bar-track"><div class="cro-bar-fill success" style="width: 50%"></div></div>
                </div>
                <div class="cro-bar-item">
                    <div class="cro-bar-header"><span>פייסבוק ('ירוחם שלי')</span><span>30%</span></div>
                    <div class="cro-bar-track"><div class="cro-bar-fill primary" style="width: 30%"></div></div>
                </div>
                <div class="cro-bar-item">
                    <div class="cro-bar-header"><span>גוגל מפות (חירום)</span><span>20%</span></div>
                    <div class="cro-bar-track"><div class="cro-bar-fill info" style="width: 20%"></div></div>
                </div>
            </div>
        `;
    }
    else if (routedAgent === 'content') {
        outputText = `✍️ *טיוטת פוסט שיווקי מוכן מיוצר התוכן:*\n\n`;
        outputText += `🔑🚪 *תושבי ירוחם, צריכים מנעולן או הנדימן מקומי?*\n`;
        outputText += `עבודה מהירה ומקצועית ללא דמי נסיעה מופקעים! החלפת צילינדרים, כיוון דלתות, ותליית מסכים בשיא הדיוק.\n\n`;
        outputText += `📞 לייעוץ וקריאה מהירה: 050-1234567\n\n`;
        outputText += `📷 תמונת מותג מומלצת: *ad_locksmith.png*`;
        
        visualsHTML = `
            <div class="infographic-wrapper" style="text-align: center;">
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 5px;">תמונת מותג מומלצת לפרסום:</div>
                <img src="ad_locksmith.png" alt="פוסטר מנעולנות" style="max-height: 140px; border-radius: 6px; border: 1px solid var(--primary); box-shadow: 0 0 10px var(--primary-glow); margin: 0 auto; display: block;">
                <div style="font-size: 11px; color: var(--primary); margin-top: 5px; font-weight:700;">ad_locksmith.png</div>
            </div>
        `;
    }
    else if (routedAgent === 'rnd') {
        outputText = `💡 *פתרונות ייעול וחדשנות מ-R&D:*\n\n`;
        outputText += `1. *חבילת השקה*: 'הנדימן מפתח' - תליית טלוויזיה והרכבת ארון + בדיקת דלת חינם ב-₪450 בלבד.\n`;
        outputText += `2. *אוטומציה*: הגדרת הודעה חוזרת בוואטסאפ ללקוחות יום לאחר התיקון לקבלת המלצה.\n\n`;
        outputText += `💡 *מדד כדאיות*: פתרונות אלו בעלי עלות אפסית וישימות של 100%.`;
        
        visualsHTML = `
            <div style="display: flex; gap: 10px; flex-direction: column; width: 100%;">
                <div class="infographic-card">
                    <div style="font-weight: 700; color: var(--success); font-size: 13px; margin-bottom: 3px;">כדאיות חבילות מוצרים:</div>
                    <div style="font-size: 12px; color: var(--text-muted);">הגדלת סל לקוח ממוצע ב-40% על ידי הצעות upsell בשטח.</div>
                </div>
                <div class="infographic-card">
                    <div style="font-weight: 700; color: var(--primary); font-size: 13px; margin-bottom: 3px;">רמת קושי ליישום:</div>
                    <div style="font-size: 12px; color: var(--text-muted);">קלה מאוד - דורשת רק שינוי קל בהצגה מול הלקוח.</div>
                </div>
            </div>
        `;
    }
    else if (routedAgent === 'coach') {
        outputText = `📅 *תכנון זמנים שבועי מהמאמן האישי:*\n\n`;
        outputText += `• יום ראשון 09:00 (שעה): פרסום פוסטים שבועיים.\n`;
        outputText += `• יום שלישי 10:00 (שעה וחצי): בדיקת והשלמת מלאי צילינדרים.\n`;
        outputText += `• יום חמישי 20:00 (חצי שעה): סנכרון הוצאות והכנסות דרך בוט הטלגרם.\n\n`;
        outputText += `🧘 *הרגל*: בצע בדיקת כלי עבודה בכל בוקר (5 דקות בלבד).`;
        
        visualsHTML = `
            <div class="infographic-wrapper">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
                    <span style="font-weight:700;"><i class="fa-solid fa-clock"></i> חלוקת שעות שבועית</span>
                    <span style="color: var(--primary);">3.5 שעות</span>
                </div>
                <div style="display: flex; gap: 5px; justify-content: space-between; margin-top: 10px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; text-align: center; flex: 1;">
                        <div style="font-size:12px; font-weight:700; color:var(--primary);">א' - שיווק</div>
                        <div style="font-size:14px; font-weight:800; margin-top:5px;">60 דק'</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; text-align: center; flex: 1;">
                        <div style="font-size:12px; font-weight:700; color:var(--success);">ג' - מלאי</div>
                        <div style="font-size:14px; font-weight:800; margin-top:5px;">90 דק'</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; text-align: center; flex: 1;">
                        <div style="font-size:12px; font-weight:700; color:hsl(35, 90%, 55%);">ה' - כספים</div>
                        <div style="font-size:14px; font-weight:800; margin-top:5px;">30 דק'</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('outputBox').value = outputText;
    document.getElementById('agentVisualsContainer').innerHTML = visualsHTML;
    
    const calendarBtn = document.getElementById('btnAddToCalendar');
    if (calendarBtn) {
        calendarBtn.style.display = (routedAgent === 'coach') ? 'inline-block' : 'none';
    }
}

// Google calendar linking helper
function addOutputToCalendar() {
    const title = encodeURIComponent("שיווק שבועי וסנכרון - זכריה פתרונות ושירותים לבית");
    const details = encodeURIComponent("זמן ממוקד לפרסום פוסטים שבועיים בקבוצות ירוחם ומעקב פניות.\nהופק על ידי סוכן הפרודוקטיביות בדאשבורד.");
    
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(9, 0, 0, 0);
    
    const startStr = nextSunday.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endSunday = new Date(nextSunday.getTime() + 60 * 60 * 1000); 
    const endStr = endSunday.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startStr}/${endStr}`;
    window.open(url, '_blank');
    showToast("יומן גוגל נפתח בלשונית חדשה! 📅");
}

// CRM Form Toggle Reason Field
function toggleLeadReasonField() {
    const closedVal = document.getElementById('leadClosed').value;
    const reasonGroup = document.getElementById('leadReasonGroup');
    if (reasonGroup) {
        reasonGroup.style.display = (closedVal === 'no') ? 'block' : 'none';
    }
    toggleLeadReasonOtherField();
}

function toggleLeadReasonOtherField() {
    const closedVal = document.getElementById('leadClosed').value;
    const reasonSelect = document.getElementById('leadReason');
    const otherGroup = document.getElementById('leadReasonOtherGroup');
    const otherInput = document.getElementById('leadReasonOther');
    
    if (otherGroup && reasonSelect && otherInput) {
        if (closedVal === 'no' && reasonSelect.value === 'אחר') {
            otherGroup.style.display = 'block';
            otherInput.setAttribute('required', 'true');
        } else {
            otherGroup.style.display = 'none';
            otherInput.removeAttribute('required');
        }
    }
}

// Add New Lead
function addLead(e) {
    e.preventDefault();
    
    const client = document.getElementById('leadClient').value;
    const date = document.getElementById('leadDate').value;
    const service = document.getElementById('leadService').value;
    const source = document.getElementById('leadSource').value;
    const closed = document.getElementById('leadClosed').value === 'yes';
    
    let reason = "";
    if (!closed) {
        const reasonSelect = document.getElementById('leadReason').value;
        if (reasonSelect === 'אחר') {
            const reasonOther = document.getElementById('leadReasonOther').value.trim();
            reason = "אחר: " + reasonOther;
        } else {
            reason = reasonSelect;
        }
    }
    
    const newLead = {
        id: Date.now(),
        date: date || new Date().toISOString().split('T')[0],
        client,
        service,
        source,
        closed,
        reason
    };
    
    saveDataCloud(db => {
        if (!db.leads) db.leads = [];
        db.leads.push(newLead);
    });
    
    // Reset Form
    document.getElementById('leadClient').value = '';
    document.getElementById('leadService').value = '';
    document.getElementById('leadClosed').value = 'yes';
    document.getElementById('leadReason').value = 'מחיר יקר';
    document.getElementById('leadReasonOther').value = '';
    
    // Reset date input to today
    const leadDateInput = document.getElementById('leadDate');
    if (leadDateInput) {
        leadDateInput.value = new Date().toISOString().split('T')[0];
    }
    
    toggleLeadReasonField();
    
    showToast("הפנייה החדשה נשמרה בהצלחה! 👤");
}

// Delete Lead
function deleteLead(id) {
    if (confirm("האם אתה בטוח שברצונך למחוק פנייה זו מהמעקב?")) {
        saveDataCloud(db => {
            db.leads = db.leads.filter(l => l.id !== id);
        });
        showToast("הפנייה נמחקה. 🗑️");
    }
}

// Render CRM Leads Table, Stats & CRO Analysis
function renderCRM() {
    const tableBody = document.getElementById('leadsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    const leads = appData.leads || [];
    
    let totalCount = leads.length;
    let closedCount = 0;
    let lostCount = 0;
    
    const objections = {
        "מחיר יקר": 0,
        "זמן הגעה": 0,
        "חוסר זמינות": 0,
        "אחר": 0
    };
    const sources = {
        "וואטסאפ": 0,
        "פייסבוק": 0,
        "גוגל מפות": 0,
        "המלצה": 0,
        "אחר": 0
    };
    
    const sortedLeads = [...leads].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedLeads.forEach(l => {
        if (l.closed) closedCount++;
        else {
            lostCount++;
            if (objections[l.reason] !== undefined) objections[l.reason]++;
            else objections["אחר"]++;
        }
        
        if (sources[l.source] !== undefined) sources[l.source]++;
        else sources["אחר"]++;
        
        const tr = document.createElement('tr');
        const formattedDate = l.date.split('-').reverse().join('/');
        
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td style="font-weight: 600;">${l.client}</td>
            <td>${l.service}</td>
            <td><span class="badge badge-source">${l.source}</span></td>
            <td>
                <span class="badge ${l.closed ? 'badge-closed-yes' : 'badge-closed-no'}">
                    ${l.closed ? '✔️ כן' : '❌ לא'}
                </span>
            </td>
            <td style="color: var(--text-muted);">${l.closed ? '-' : (l.reason || 'לא צוין')}</td>
            <td>
                <button onclick="deleteLead(${l.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;" title="מחק פנייה">
                    <i class="fa-solid fa-trash-can" style="color: var(--danger)"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    document.getElementById('crmTotalLeads').innerText = totalCount;
    document.getElementById('crmClosedLeads').innerText = closedCount;
    document.getElementById('crmLostLeads').innerText = lostCount;
    
    const conversionRate = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0;
    document.getElementById('crmConversionRate').innerText = `${conversionRate}%`;
    
    updateCROInsights(totalCount, closedCount, objections, sources);
}

// CRO Insights Engine
function updateCROInsights(total, closed, objections, sources) {
    const contentStratEl = document.getElementById('croContentStrategy');
    const objectionStratEl = document.getElementById('croObjectionStrategy');
    
    if (!contentStratEl || !objectionStratEl) return;
    
    if (total === 0) {
        contentStratEl.innerText = "הזן פניות בטבלה כדי שסוכן ה-CRO יוכל לייצר אסטרטגיות מבוססות נתונים.";
        objectionStratEl.innerText = "הזן פניות בטבלה כדי שסוכן ה-CRO יוכל לנתח התנגדויות.";
        return;
    }
    
    let topSource = "וואטסאפ";
    let maxSourceCount = -1;
    for (const src in sources) {
        if (sources[src] > maxSourceCount) {
            maxSourceCount = sources[src];
            topSource = src;
        }
    }
    
    let contentStrategyText = "";
    if (topSource === "וואטסאפ") {
        contentStrategyText = "💬 **וואטסאפ הוא ערוץ ההגעה המוביל**. תושבי ירוחם פונים אליך ישירות בהודעות. *פעולה*: מומלץ לפרסם פעם בשבוע בקבוצות השכונה, להשתמש בכותרות חמות וקהילתיות ולהציע מענה מהיר במיוחד.";
    } else if (topSource === "פייסבוק") {
        contentStrategyText = "👥 **פייסבוק הוא ערוץ ההגעה המוביל**. *פעולה*: המשך לפרסם פוסטים שיווקיים בקבוצות המקומיות כמו 'ירוחם שלי'. הקפד להעלות תמונות מותג ברורות (ad_locksmith.png) המציגות את השירות שלך.";
    } else if (topSource === "גוגל מפות") {
        contentStrategyText = "📍 **גוגל מפות מביא את מירב הפניות**. לקוחות מוצאים אותך בשעת חירום. *פעולה*: בקש מכל לקוח מרוצה לכתוב חוות דעת של 5 כוכבים בגוגל מיד בתום העבודה. דירוגים גבוהים ישפרו את המיקום שלך.";
    } else if (topSource === "המלצה") {
        contentStrategyText = "⭐ **חבר מביא חבר (פה לאוזן) הוא הכוח שלך**. *פעולה*: הצע ללקוחות קיימים הטבה קטנה או הנחה בעבודה הבאה אם הם ממליצים עליך לחברים ושכנים בירוחם.";
    } else {
        contentStrategyText = "🔍 **הפניות מגיעות ממגוון מקורות**. *פעולה*: כדאי להבליט את מספר הטלפון בפוסטים ולתלות פליירים מקומיים בירוחם להגברת המודעות.";
    }
    
    contentStratEl.innerHTML = contentStrategyText;
    
    let topObjection = "מחיר יקר";
    let maxObjCount = -1;
    for (const obj in objections) {
        if (objections[obj] > maxObjCount) {
            maxObjCount = objections[obj];
            topObjection = obj;
        }
    }
    
    let objectionStrategyText = "";
    if (maxObjCount === 0) {
        objectionStrategyText = "✔️ **כל הפניות נסגרו בהצלחה!** המשך באותו קו שירות מקצועי והוגן.";
    } else if (topObjection === "מחיר יקר") {
        objectionStrategyText = "💵 **התנגדות המחיר היא המכשול העיקרי**. *טיפול*: אל תתחרה רק במחיר. הדגש שאתה מנעולן מקומי שמגיע תוך 15 דקות ללא דמי נסיעה גבוהים (שמתחרים מבאר שבע גובים), ושהעבודה כוללת אחריות מלאה.";
    } else if (topObjection === "זמן הגעה") {
        objectionStrategyText = "🕒 **זמן הגעה ארוך מונע סגירות**. *טיפול*: לקוחות מנעולנות צריכים פתרון מיידי. כשפונים אליך, ציין מיד זמן הגעה מדויק ומהיר ('אצלך בתוך 15 דקות'), ופנה חלונות זמן בלו\"ז לחירום.";
    } else if (topObjection === "חוסר זמינות") {
        objectionStrategyText = "📴 **פניות מתפספסות בגלל חוסר זמינות**. *טיפול*: הגדר שעות עבודה ברורות והפעל מענה אוטומטי בוואטסאפ כשאתה לא זמין או לומד במכללה, כדי לקבוע למועד מאוחר יותר.";
    } else {
        objectionStrategyText = "❓ **סיבות אי-סגירה משתנות**. *טיפול*: הקפד לשאול שאלות מנחות לבירור הצורך המדויק של הלקוח, ותן הצעת מחיר שקופה מראש כדי למנוע אי-הבנות.";
    }
    
    objectionStratEl.innerHTML = objectionStrategyText;
    
    const objChartContainer = document.getElementById('croObjectionChart');
    if (objChartContainer) {
        objChartContainer.innerHTML = '';
        let totalObjections = 0;
        for (const k in objections) totalObjections += objections[k];
        
        const colors = ["danger", "warning", "primary", "info"];
        let idx = 0;
        
        for (const k in objections) {
            const count = objections[k];
            const pct = totalObjections > 0 ? Math.round((count / totalObjections) * 100) : 0;
            const item = document.createElement('div');
            item.className = 'cro-bar-item';
            item.innerHTML = `
                <div class="cro-bar-header"><span>${k}</span><span>${count} (${pct}%)</span></div>
                <div class="cro-bar-track"><div class="cro-bar-fill ${colors[idx % colors.length]}" style="width: ${pct}%"></div></div>
            `;
            objChartContainer.appendChild(item);
            idx++;
        }
    }
    
    const srcChartContainer = document.getElementById('croSourceChart');
    if (srcChartContainer) {
        srcChartContainer.innerHTML = '';
        let totalSources = 0;
        for (const k in sources) totalSources += sources[k];
        
        const colors = ["success", "primary", "info", "warning", "danger"];
        let idx = 0;
        
        for (const k in sources) {
            const count = sources[k];
            const pct = totalSources > 0 ? Math.round((count / totalSources) * 100) : 0;
            const item = document.createElement('div');
            item.className = 'cro-bar-item';
            item.innerHTML = `
                <div class="cro-bar-header"><span>${k}</span><span>${count} (${pct}%)</span></div>
                <div class="cro-bar-track"><div class="cro-bar-fill ${colors[idx % colors.length]}" style="width: ${pct}%"></div></div>
            `;
            srcChartContainer.appendChild(item);
            idx++;
        }
    }
}

// Clipboard copy utility
function copyToClipboard() {
    const outputBox = document.getElementById('outputBox');
    outputBox.select();
    outputBox.setSelectionRange(0, 99999); // for mobile devices
    
    navigator.clipboard.writeText(outputBox.value)
        .then(() => {
            showToast("הטקסט הועתק בהצלחה! 📋");
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

// Toast Utility
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
