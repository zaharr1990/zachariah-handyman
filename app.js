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
window.addEventListener('DOMContentLoaded', () => {
    // Set date input to today
    const dateInput = document.getElementById('transDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Load data
    loadData();
    selectAgent('marketing');
});

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // Find button to active
    const btnIndex = tabId === 'finance' ? 0 : tabId === 'agents' ? 1 : 2;
    document.querySelectorAll('.tab-btn')[btnIndex].classList.add('active');
}

// Data management (Local Storage & JSON fetch)
async function loadData() {
    const localData = localStorage.getItem('zachariah_business_data');
    if (localData) {
        appData = JSON.parse(localData);
    } else {
        try {
            const response = await fetch('data.json');
            if (response.ok) {
                const fetchedData = await response.json();
                appData = { ...initialData, ...fetchedData };
            }
        } catch (e) {
            console.log("Could not fetch data.json, using local initial template", e);
        }
        saveData();
    }
    renderFinance();
    renderTasks();
}

function saveData() {
    localStorage.setItem('zachariah_business_data', JSON.stringify(appData));
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
    
    if (type === 'income') {
        appData.income.push(newTransaction);
    } else {
        appData.expenses.push(newTransaction);
    }
    
    saveData();
    renderFinance();
    
    // Reset form fields
    document.getElementById('transAmount').value = '';
    document.getElementById('transDesc').value = '';
    
    showToast("התנועה הפיננסית נשמרה בהצלחה! 💰");
}

function deleteTransaction(id, type) {
    if (confirm("האם אתה בטוח שברצונך למחוק תנועה זו?")) {
        if (type === 'income') {
            appData.income = appData.income.filter(item => item.id !== id);
        } else {
            appData.expenses = appData.expenses.filter(item => item.id !== id);
        }
        saveData();
        renderFinance();
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
    appData.tasks = appData.tasks.map(t => {
        if (t.id === id) {
            return { ...t, completed: !t.completed };
        }
        return t;
    });
    saveData();
    renderTasks();
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
    
    appData.tasks.push(newTask);
    saveData();
    renderTasks();
    
    document.getElementById('taskText').value = '';
    document.getElementById('taskDate').value = '';
    
    showToast("המשימה נוספה בהצלחה! 🚀");
}

// Agent AI Generator Logic
function selectAgent(agentId) {
    currentAgent = agentId;
    selectedTemplateIndex = 0;
    
    // Toggle active state in buttons
    const agentIds = ['strat', 'cmo', 'content', 'rnd', 'coach'];
    agentIds.forEach(id => {
        const btn = document.getElementById(`btnAgent_${id}`);
        if (btn) {
            btn.className = `agent-btn ${agentId.startsWith(id) || id.startsWith(agentId) ? 'active' : ''}`;
        }
    });
    
    // Show/hide Tone Selector (only for content creator)
    const toneSelector = document.getElementById('toneSelectorContainer');
    if (toneSelector) {
        toneSelector.style.display = agentId === 'content' ? 'block' : 'none';
    }
    
    // Show/hide Add to Calendar button
    const calendarBtn = document.getElementById('btnAddToCalendar');
    if (calendarBtn) {
        calendarBtn.style.display = 'none'; // reset
    }
    
    // Update titles and inputs
    const title = document.getElementById('generatorTitle');
    const label = document.getElementById('inputDetailsLabel');
    const input = document.getElementById('inputDetails');
    
    const titles = {
        strategist: "📊 סוכן אסטרטגיה וניתוח (The Strategist)",
        cmo: "📢 סוכן מנהל שיווק דיגיטלי (The CMO)",
        content: "✍️ סוכן קריאייטיב ויצירת תוכן (The Content Creator)",
        rnd: "💡 סוכן מחקר, פיתוח וחדשנות (The R&D Agent)",
        coach: "📅 סוכן אופטימיזציה ואימון אישי (The Coach)"
    };
    
    const inputLabels = {
        strategist: "הזן שם שירות או יוזמה עסקית לניתוח:",
        cmo: "הזן נושא לקמפיין שיווקי:",
        content: "הזן מספר טלפון ליצירת הנעה לפעולה (CTA):",
        rnd: "הזן את האתגר או הבעיה בעסק לסיעור מוחות:",
        coach: "הזן את סוג המשימה לניהול זמן:"
    };
    
    const inputPlaceholders = {
        strategist: "לדוגמה: החלפת מנגנונים לדלתות כניסה",
        cmo: "לדוגמה: קמפיין תליית מסכים בשישי",
        content: "לדוגמה: 050-1234567",
        rnd: "לדוגמה: קושי בהשגת לקוחות ראשונים",
        coach: "לדוגמה: הכנות שיווקיות ורכישת מלאי מנעולים"
    };
    
    if (title) title.innerText = titles[agentId] || "עוזר AI";
    if (label) label.innerText = inputLabels[agentId] || "פרטים:";
    if (input) {
        input.placeholder = inputPlaceholders[agentId] || "";
        input.value = ""; // clear
    }
    
    // Load template chips
    const chipGrid = document.getElementById('templateGrid');
    if (chipGrid) {
        chipGrid.innerHTML = '';
        agentTemplates[agentId].forEach((tpl, idx) => {
            const chip = document.createElement('div');
            chip.className = `template-chip ${idx === 0 ? 'active' : ''}`;
            chip.innerText = tpl.title;
            chip.onclick = () => {
                document.querySelectorAll('.template-chip').forEach(el => el.classList.remove('active'));
                chip.classList.add('active');
                selectedTemplateIndex = idx;
                
                // Show calendar button if coach's weekly schedule is selected
                if (calendarBtn) {
                    calendarBtn.style.display = (agentId === 'coach' && idx === 0) ? 'inline-block' : 'none';
                }
                
                generateAgentContent(); // auto regenerate
            };
            chipGrid.appendChild(chip);
        });
    }
    
    // Default show recommended image block for content generator and first template
    const imgRec = document.getElementById('imageRecommendation');
    if (imgRec) {
        imgRec.style.display = agentId === 'content' ? 'block' : 'none';
    }
    
    generateAgentContent();
}

function generateAgentContent() {
    const inputVal = document.getElementById('inputDetails').value.trim();
    const tpl = agentTemplates[currentAgent][selectedTemplateIndex];
    let outputText = tpl.text;
    
    if (currentAgent === 'strategist') {
        if (selectedTemplateIndex === 0) {
            const service = inputVal || "[שירות]";
            outputText = outputText.replace(/\[פרטים\]/g, service);
        } else if (selectedTemplateIndex === 1) {
            // Live financial analysis
            let totalIncome = 0;
            let totalExpenses = 0;
            appData.income.forEach(i => totalIncome += parseFloat(i.amount));
            appData.expenses.forEach(e => totalExpenses += parseFloat(e.amount));
            const netProfit = totalIncome - totalExpenses;
            
            // Handyman vs Locksmith income
            let locksmithIncome = 0;
            let handymanIncome = 0;
            appData.income.forEach(i => {
                if (i.category.includes("מנעולנות")) locksmithIncome += parseFloat(i.amount);
                if (i.category.includes("הנדימן")) handymanIncome += parseFloat(i.amount);
            });
            
            let advice = "אין מספיק נתונים פיננסיים רשומים במערכת לייצור דו\"ח חכם. רשום הכנסות והוצאות בטאב הפיננסי כדי לקבל ייעוץ פיננסי חי.";
            if (appData.income.length > 0 || appData.expenses.length > 0) {
                advice = `💰 *דו"ח ייעוץ ואופטימיזציה פיננסית חי לזכריה*
תאריך ניתוח: ${new Date().toLocaleDateString('he-IL')}

📊 *סיכום נתוני העסק:*
* מחזור הכנסות כולל: ₪${totalIncome.toLocaleString()}
* הוצאות והשקעה בעסק: ₪${totalExpenses.toLocaleString()}
* רווח נקי מצטבר: ₪${netProfit.toLocaleString()}

📈 *ניתוח רווחיות לפי מחלקות:*
* הכנסות ממנעולנות: ₪${locksmithIncome.toLocaleString()}
* הכנסות מהנדימן והתקנות: ₪${handymanIncome.toLocaleString()}

💡 *המלצות אסטרטגיות לייעול:*
`;
                if (locksmithIncome >= handymanIncome && locksmithIncome > 0) {
                    advice += `* מנעולנות היא הקטגוריה המכניסה ביותר שלך כרגע. מומלץ להקצות לפחות 70% מזמנך ומהשיווק שלך לקידום שירותי מנעולנות דחופים בירוחם (החלפת צילינדרים, מנגנוני נעילה).
* שים לב שהוצאות העסק שלך (כגון מברגות או קורסים) יכוסו מהר יותר ככל שתתמקד בצילינדרים בעלי שולי רווח גבוהים.`;
                } else if (handymanIncome > locksmithIncome) {
                    advice += `* עבודות הנדימן והרכבות מהוות את רוב ההכנסות שלך כעת. זהו בסיס מצוין לבניית מוניטין ויחסים אישיים עם תושבי ירוחם.
* מומלץ להציע 'בדיקת תקינות דלת חינם' בכל ביקור הנדימן כדי למכור גם שירותי מנעולנות (Upsell) ולהגדיל את הממוצע ללקוח.`;
                } else {
                    advice += `* מומלץ להקפיד על רישום של לפחות 5 עסקאות נוספות החודש כדי לזהות מגמות רווחיות ברורות.`;
                }
            }
            outputText = advice;
        }
    } 
    else if (currentAgent === 'cmo') {
        const campaign = inputVal || "[קמפיין]";
        outputText = outputText.replace(/\[פרטים\]/g, campaign);
    } 
    else if (currentAgent === 'content') {
        if (selectedTemplateIndex === 0) {
            // Dynamic Tone copy
            const tone = document.getElementById('postTone').value;
            const phone = inputVal || "[הכנס טלפון]";
            
            const toneTexts = {
                community: `🔑🚪 *שכנים בירוחם, מתי לאחרונה בדקתם את הדלת שלכם?*\n\nכתושב המקום, חשוב לי שהבית שלכם יהיה מוגן ובטוח. אם הדלת נגררת, המפתח מסתובב קשה, או שסתם עברתם דירה ורוצים להחליף צילינדר – אני כאן בשבילכם, ממש ליד הבית.\n\n*זכריה - פתרונות ושירותים לבית* מגיע אליכם עם חיוך, שירות מהיר, בלי דמי נסיעה מופקעים, ועבודה נקייה מכל הלב.\n\n📞 דברו איתי להתייעצות או תיאום: ${phone}`,
                
                professional: `🔑 *זכריה - פתרונות ושירותים לבית: שירותי מנעולנות והתקנות מורשים*\n\nאנו מעניקים פתרונות נעילה ותחזוקה מתקדמים לבתים ועסקים בירוחם והסביבה:\n* החלפת צילינדרים איכותיים (רב-בריח, מולטילוק ועוד) באריזה מקורית.\n* כיוון ותיקון דלתות כניסה ופנים, מנגנוני נעילה וידיות.\n* התקנות ותלייה (טלוויזיות, רהיטים ומדפים) בדיוק מקצועי.\n\nכל העבודות מבוצעות ברישיון ובאחריות מלאה, עם כיסוי ביטוחי מקצועי מלא.\n\n📞 לתיאום והצעות מחיר מסודרות: ${phone}`,
                
                selling: `⚡ *צריכים מנעולן או הנדימן בירוחם עכשיו? זכריה בדרך!* ⚡\n\nלמה להזמין מישהו מבחוץ ולשלם יותר? \n* החלפת צילינדר מהירה ומקצועית באחריות מלאה!\n* תליית טלוויזיה או מדף בצורה ישרה ונקייה!\n* תיקון דלתות ורהיטים במקום!\n\nהגעה מהירה, שירות אמין ומחירים הוגנים ושקופים מראש לתושבי ירוחם והסביבה.\n\n📞 התקשרו או שלחו הודעה בוואטסאפ: ${phone}`
            };
            outputText = toneTexts[tone] || "";
            
            // Set dynamic ad image based on selected tone context
            const adImage = document.getElementById('recommendedAdImage');
            const adImageDesc = document.getElementById('recommendedAdImageDesc');
            if (adImage && adImageDesc) {
                // If locksmithing is implied
                if (tone === 'community' || tone === 'selling') {
                    adImage.src = 'ad_locksmith.png';
                    adImageDesc.innerText = `קובץ התמונה שמור בתיקיית העסק שלך תחת השם: ad_locksmith.png`;
                } else {
                    adImage.src = 'ad_general_repairs.png';
                    adImageDesc.innerText = `קובץ התמונה שמור בתיקיית העסק שלך תחת השם: ad_general_repairs.png`;
                }
            }
        } else {
            const phone = inputVal || "[הכנס טלפון]";
            outputText = outputText.replace(/\[טלפון\]/g, phone);
        }
    } 
    else if (currentAgent === 'rnd') {
        const challenge = inputVal || "[אתגר/בעיה]";
        outputText = outputText.replace(/\[פרטים\]/g, challenge);
    } 
    else if (currentAgent === 'coach') {
        const task = inputVal || "[משימה]";
        outputText = outputText.replace(/\[פרטים\]/g, task);
    }
    
    document.getElementById('outputBox').value = outputText;
}

// Cooperative Multi-Agent Workflow Engine
let workflowSteps = [];
let currentWorkflowStepIndex = 0;
let workflowInitiativeText = "";
let workflowData = {};

function startWorkflow() {
    const initiative = document.getElementById('workflowInitiative').value.trim();
    if (!initiative) {
        alert("אנא הזן יוזמה עסקית בתיבת הטקסט!");
        return;
    }
    
    workflowInitiativeText = initiative;
    const mode = document.getElementById('workflowMode').value;
    
    // Switch to agents tab if not active
    switchTab('agents');
    
    // Show status area
    document.getElementById('workflowStatusArea').style.display = 'block';
    
    // Reset indicators
    const indicators = ['rnd', 'strat', 'cmo', 'content', 'coach'];
    indicators.forEach(ind => {
        const el = document.getElementById(`step_${ind}`);
        if (el) el.className = 'flow-step-indicator';
    });
    
    workflowSteps = ['rnd', 'strat', 'cmo', 'content', 'coach'];
    currentWorkflowStepIndex = 0;
    workflowData = {};
    
    if (mode === 'auto') {
        document.getElementById('interactiveControls').style.display = 'none';
        runAutoWorkflow();
    } else {
        document.getElementById('interactiveControls').style.display = 'flex';
        runInteractiveWorkflowStep();
    }
}

function updateProgressBar(percentage) {
    const bar = document.getElementById('workflowProgressBar');
    if (bar) bar.style.width = `${percentage}%`;
}

function executeStep(stepId, percentage) {
    const el = document.getElementById(`step_${stepId}`);
    if (el) el.className = 'flow-step-indicator completed';
    updateProgressBar(percentage);
    generateStepData(stepId);
}

function generateStepData(stepId) {
    const init = workflowInitiativeText;
    if (stepId === 'rnd') {
        workflowData.rnd = `💡 *סוכן מחקר וחדשנות - 3 רעיונות יצירתיים עבור "${init}":*\n\n1. *הצעה מבדלת*: הצעת שדרוג בטיחות לדלת במחיר מוזל לכל לקוח שמזמין את העבודה הזו.\n2. *חבילת השקה*: מחיר חבילה אטרקטיבי מוגבל בזמן לתושבי ירוחם.\n3. *קידום מקומי*: קמפיין שיתוף פעולה עם מתווכים ומנהלי נכסים בעיר.`;
    } else if (stepId === 'strat') {
        workflowData.strat = `📊 *סוכן אסטרטגיה וניתוח - יעדים ומתחרים עבור "${init}":*\n\n* קהל היעד: תתושבי ירוחם ובעלי עסקים מקומיים.\n* ניתוח פער בשוק: מתחרים מבחוץ לוקחים מחיר כפול על הגעה. אנחנו נותנים מענה מקומי מהיר ללא עלות נסיעה.\n* אבני דרך: הגעה ל-5 לקוחות ראשונים בשבועיים הקרובים.`;
    } else if (stepId === 'cmo') {
        workflowData.cmo = `📢 *סוכן מנהל שיווק - תקציב וקמפיין עבור "${init}":*\n\n* ערוץ שיווק: קבוצות פייסבוק מקומיות וירוחם בוואטסאפ (0 ש"ח תקציב).\n* הגדרת קמפיין: קמפיין מודעות 'שירות מקומי, אמין וזול' - שימוש בתמונות המעוצבות החדשות.\n* מדד הצלחה: צבירת 5 המלצות חיוביות בשבוע הראשון.`;
    } else if (stepId === 'content') {
        workflowData.content = `✍️ *סוכן קריאייטיב ותוכן - פוסט שיווקי מוכן להפצה עבור "${init}":*\n\n🔑 *שכנים בירוחם, יש לנו פתרון קרוב לבית!*\n\nצריכים שירות מקצועי עבור "${init}"? במקום להמתין שעות לבעל מקצוע מבחוץ ולשלם כפול – זכריה איתכם כאן בירוחם! \nשירות אמין, עבודה סופר-נקייה, מחירים הוגנים ושקופים מראש ואחריות מלאה.\n\n📞 לייעוץ וקריאת שירות מהירה: [טלפון]`;
    } else if (stepId === 'coach') {
        workflowData.coach = `📅 *סוכן אופטימיזציה ואימון - לו"ז ביצוע שבועי עבור "${init}":*\n\n* חלון א': יום ראשון ב-09:00 (60 דקות) – פרסום פוסטים ומענה לפניות ברשת.\n* חלון ב': יום שלישי ב-10:00 (90 דקות) – רכישת מלאי והצטיידות לקראת הזמנות.\n* חלון ג': יום חמישי ב-20:00 (30 דקות) – עדכון פיננסי של ההכנסות/הוצאות בבוט.`;
    }
}

function runAutoWorkflow() {
    updateProgressBar(0);
    setTimeout(() => executeStep('rnd', 20), 300);
    setTimeout(() => executeStep('strat', 40), 600);
    setTimeout(() => executeStep('cmo', 60), 900);
    setTimeout(() => executeStep('content', 80), 1200);
    setTimeout(() => {
        executeStep('coach', 100);
        showFinalWorkflowOutput();
    }, 1500);
}

function showFinalWorkflowOutput() {
    const finalReport = `🏆 *תיק הוצאה לפועל עסקי מאוחד - זכריה פתרונות ושירותים לבית*
שם היוזמה: ${workflowInitiativeText}

=================================

${workflowData.rnd}

=================================

${workflowData.strat}

=================================

${workflowData.cmo}

=================================

${workflowData.content}

=================================

${workflowData.coach}`;
    
    document.getElementById('outputBox').value = finalReport;
    document.getElementById('workflowStepTitle').innerText = "השרשרת הושלמה בהצלחה! התיק העסקי מוכן להעתקה.";
    
    // Enable calendar button
    const calendarBtn = document.getElementById('btnAddToCalendar');
    if (calendarBtn) calendarBtn.style.display = 'inline-block';
}

function runInteractiveWorkflowStep() {
    const stepId = workflowSteps[currentWorkflowStepIndex];
    
    // De-activate all and activate current
    const indicators = ['rnd', 'strat', 'cmo', 'content', 'coach'];
    indicators.forEach(ind => {
        const el = document.getElementById(`step_${ind}`);
        if (el && el.className.includes('active')) el.className = 'flow-step-indicator';
    });
    
    const curEl = document.getElementById(`step_${stepId}`);
    if (curEl) curEl.className = 'flow-step-indicator active';
    
    // Set step title
    const stepNames = {
        rnd: "1. סוכן מחקר וחדשנות - פיתוח רעיונות",
        strat: "2. סוכן אסטרטגיה וניתוח - קביעת יעדים",
        cmo: "3. סוכן מנהל שיווק - תקציב וערוצים",
        content: "4. סוכן קריאייטיב ותוכן - כתיבת פוסט",
        coach: "5. סוכן אופטימיזציה - לו\"ז ביצוע שבועי"
    };
    document.getElementById('workflowStepTitle').innerText = stepNames[stepId];
    
    // Generate step data
    generateStepData(stepId);
    
    // Incorporate previous step data as context in outputBox text if applicable
    let outputVal = workflowData[stepId];
    if (stepId === 'strat' && workflowData.rnd) {
        outputVal += `\n\n*(הערה: סוכן האסטרטגיה יבנה את היעדים על בסיס רעיונות ה-R&D מהשלב הקודם)*`;
    }
    
    document.getElementById('outputBox').value = outputVal;
    
    // Update progress bar
    const progress = (currentWorkflowStepIndex / workflowSteps.length) * 100;
    updateProgressBar(progress);
}

function nextWorkflowStep() {
    // Save current output box content (including any user edits)
    const stepId = workflowSteps[currentWorkflowStepIndex];
    workflowData[stepId] = document.getElementById('outputBox').value;
    
    const curEl = document.getElementById(`step_${stepId}`);
    if (curEl) curEl.className = 'flow-step-indicator completed';
    
    currentWorkflowStepIndex++;
    
    if (currentWorkflowStepIndex < workflowSteps.length) {
        runInteractiveWorkflowStep();
    } else {
        // Complete
        updateProgressBar(100);
        document.getElementById('interactiveControls').style.display = 'none';
        showFinalWorkflowOutput();
    }
}

// Add to Google Calendar Link Generator
function addOutputToCalendar() {
    const title = encodeURIComponent("שיווק שבועי וסנכרון - זכריה פתרונות ושירותים לבית");
    const details = encodeURIComponent("זמן ממוקד לפרסום פוסטים שבועיים בקבוצות ירוחם ומעקב פניות.\nהופק על ידי סוכן הפרודוקטיביות בדאשבורד.");
    
    // Set date to next Sunday at 09:00 AM
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(9, 0, 0, 0);
    
    const startStr = nextSunday.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endSunday = new Date(nextSunday.getTime() + 60 * 60 * 1000); // 1 hour later
    const endStr = endSunday.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startStr}/${endStr}`;
    window.open(url, '_blank');
    showToast("יומן גוגל נפתח בלשונית חדשה! 📅");
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