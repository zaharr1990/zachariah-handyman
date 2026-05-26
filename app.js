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
        { id: 4, text: "להגיע ל-10 לקוחות ראשונים במנעולנות והנדימן", completed: false, targetDate: "2026-08" },
        { id: 5, text: "להגיש בקשה לרישיון חשמלאי מוסמך לאחר סיום הלימודים", completed: false, targetDate: "2026-11" }
    ]
};

let appData = { ...initialData };
let currentAgent = 'marketing';
let selectedTemplateIndex = 0;

// Templates definitions
const agentTemplates = {
    marketing: [
        {
            title: "👋 פוסט היכרות ושירות מקומי",
            text: "שכנים יקרים בירוחם והסביבה, נעים להכיר! 👋\n\nקוראים לי זכריה, תושב ירוחם, מנעולן מוסמך והנדימן לכל עבודות הבית.\nנמאס לכם לחכות שעות לבעל מקצוע שמגיע מרחוק וגובה מאות שקלים רק על הנסיעה?\nבדיוק בשביל זה אני כאן – שירות מקומי, מהיר, והכי חשוב – הוגן ובגובה העיניים.\n\nבין השירותים שאני מציע:\n🔑 מנעולנות: פריצת מנעולים, החלפת צילינדרים (רב-בריח, מולטילוק ועוד), תיקון מנגנוני דלתות.\n🛠️ עבודות הנדימן: התקנת טלוויזיות, הרכבת רהיטים (איקאה ועוד), תליית מדפים ותמונות, תיקונים קטנים בבית.\n\nמתחייב לשירות אמין, עבודה נקייה ומחירים הוגנים לחברים ולשכנים כאן בירוחם!\n\n📞 צריכים עזרה או ייעוץ?\nדברו איתי בטלפון או שלחו הודעה מהירה בוואטסאפ: [טלפון]",
            placeholder: "הכנס את מספר הטלפון שלך"
        },
        {
            title: "🔑 סטטוס חירום - מנעולן מהיר",
            text: "🔑 נתקעתם מחוץ לבית? המפתח מסתובב \"על ריק\"?\nאין צורך להילחץ ולחכות שעות. זכריה מנעולן מוסמך, תושב ירוחם – מגיע אליכם במהירות ובמחיר הוגן.\n\nזמין עבורכם לכל קריאת חירום! 📱 [טלפון]\n(מומלץ לשמור לכל מקרה שלא יהיה!)",
            placeholder: "הכנס את מספר הטלפון שלך"
        },
        {
            title: "🛠️ הרכבה ותלייה - הנדימן",
            text: "קניתם רהיט חדש והוראות ההרכבה נראות כמו סינית? 🤯\nרוצים לתלות את הטלוויזיה החדשה אבל מפחדים שהקיר לא יחזיק?\n\nאל תשאירו את זה לסוף שבוע. אני מגיע אליכם לעשות את העבודה הקשה – עם הכלים הנכונים, פלס, והקפדה על עבודה סופר נקייה ומסודרת (בלי להשאיר אבק!).\n\n* תליית מדפים, תמונות ואביזרי אמבטיה\n* הרכבת ארונות ושידות\n* התקנת זרועות לטלוויזיה\n\n📞 לתיאום מהיר שלחו לי הודעה: [טלפון]",
            placeholder: "הכנס את מספר הטלפון שלך"
        }
    ],
    sales: [
        {
            title: "🔑 הצעת מחיר למנעולנות",
            text: "שלום [שם_הלקוח]! בשמחה, אני יכול לעזור בזה. 😊\n\nהצעת מחיר להחלפת צילינדר לדלת:\n* העבודה כוללת: פירוק הצילינדר הישן, התקנת צילינדר חדש ואיכותי (מגיע בקופסה סגורה עם מפתחות חדשים), ובדיקה שהדלת ננעלת בצורה חלקה לחלוטין.\n* מחיר סופי (עבודה + חלקים): [מחיר] ש\"ח.\n* מתי אני יכול להגיע? אני יכול להיות אצלך היום בסביבות השעה [שעה] או מחר בבוקר.\n\nמה מתאים לך יותר?",
            placeholder: "שם הלקוח, מחיר, שעה (לדוגמה: משה, 350, 17:00)"
        },
        {
            title: "🛠️ הצעת מחיר להנדימן",
            text: "שלום [שם_הלקוח]! בשמחה, להלן פרטי הצעת המחיר עבור [סוג_העבודה]:\n\n* עלות העבודה: [מחיר] ש\"ח.\n* העבודה מבוצעת תוך הקפדה על פילוס מדויק, שימוש בדיבלים וברגים מתאימים לסוג הקיר שלכם, וניקיון מלא בסיום.\n* מתי אני יכול להגיע? [זמן].\n\nאשמח מאוד לעמוד לשירותכם! לתאימום שלחו לי אישור כאן בוואטסאפ. 👍",
            placeholder: "שם הלקוח, סוג העבודה, מחיר, זמן"
        },
        {
            title: "💰 מענה להתנגדות מחיר (\"יקר לי\")",
            text: "אני מבין לחלוטין [שם_הלקוח], זה תמיד חשוב להשוות מחירים. אישית, אני תמיד מקפיד להשתמש בחלקים איכותיים ומקוריים בלבד ונותן אחריות מלאה על העבודה שלי.\nבנוסף, כתושב ירוחם, אני זמין להגיע אליך במהירות לכל צורך או שירות בהמשך – בלי שתצטרך לחכות ימים לבעל מקצוע מהמרכז או מבאר שבע. 😊\nאשמח מאוד לעמוד לשירותך ולעשות עבודה נקייה ומקצועית!",
            placeholder: "שם הלקוח (לדוגמה: משה)"
        },
        {
            title: "⭐ הודעת מעקב וחוות דעת",
            text: "היי [שם_הלקוח], בוקר טוב!\nרק רציתי לוודא שהכול עובד מצוין עם העבודה שביצענו אתמול והאם הכל לשביעות רצונך. 😊\n\nהיה לי העונג לתת לך שירות!\nאם היית מרוצה, אשמח מאוד אם תוכל לכתוב מילה טובה או להמליץ עליי בקבוצת הוואטסאפ השכונתית או בפייסבוק – זה מאוד עוזר לעסק מקומי כמוני בירוחם לצמוח.\nתודה רבה והמשך יום מעולה, זכריה.",
            placeholder: "שם הלקוח (לדוגמה: יוסי)"
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
    document.getElementById('btnAgentMarketing').className = `agent-btn ${agentId === 'marketing' ? 'active' : ''}`;
    document.getElementById('btnAgentSales').className = `agent-btn ${agentId === 'sales' ? 'active' : ''}`;
    
    // Update titles and inputs
    const title = document.getElementById('generatorTitle');
    const label = document.getElementById('inputDetailsLabel');
    const input = document.getElementById('inputDetails');
    
    if (agentId === 'marketing') {
        title.innerText = "📢 מחולל שיווק ופרסום אורגני";
        label.innerText = "הכנס מספר טלפון שלך לפרסום:";
        input.placeholder = "לדוגמה: 050-1234567";
    } else {
        title.innerText = "🤝 עוזר מכירות ושירות לקוחות";
        label.innerText = "הכנס פרטים (מופרדים בפסיקים: שם לקוח, מחיר, שעה):";
        input.placeholder = "לדוגמה: יוסי, 350, 18:00";
    }
    
    // Load template chips
    const chipGrid = document.getElementById('templateGrid');
    chipGrid.innerHTML = '';
    
    agentTemplates[agentId].forEach((tpl, idx) => {
        const chip = document.createElement('div');
        chip.className = `template-chip ${idx === 0 ? 'active' : ''}`;
        chip.innerText = tpl.title;
        chip.onclick = () => {
            document.querySelectorAll('.template-chip').forEach(el => el.classList.remove('active'));
            chip.classList.add('active');
            selectedTemplateIndex = idx;
            input.placeholder = `לדוגמה: ${tpl.placeholder}`;
            generateAgentContent(); // auto regenerate
        };
        chipGrid.appendChild(chip);
    });
    
    generateAgentContent();
}

function generateAgentContent() {
    const inputVal = document.getElementById('inputDetails').value.trim();
    const tpl = agentTemplates[currentAgent][selectedTemplateIndex];
    let outputText = tpl.text;
    
    if (currentAgent === 'marketing') {
        const phone = inputVal || "[הכנס טלפון]";
        outputText = outputText.replace(/\[טלפון\]/g, phone);
    } else {
        // Sales replacements: split by comma
        const parts = inputVal.split(',').map(p => p.trim());
        const clientName = parts[0] || "[שם_הלקוח]";
        
        if (selectedTemplateIndex === 0) {
            // Locksmith quote
            const price = parts[1] || "[מחיר]";
            const time = parts[2] || "[שעה]";
            outputText = outputText
                .replace(/\[שם_הלקוח\]/g, clientName)
                .replace(/\[מחיר\]/g, price)
                .replace(/\[שעה\]/g, time);
        } else if (selectedTemplateIndex === 1) {
            // Handyman quote
            const workType = parts[1] || "[סוג_העבודה]";
            const price = parts[2] || "[מחיר]";
            const time = parts[3] || "[זמן]";
            outputText = outputText
                .replace(/\[שם_הלקוח\]/g, clientName)
                .replace(/\[סוג_העבודה\]/g, workType)
                .replace(/\[מחיר\]/g, price)
                .replace(/\[זמן\]/g, time);
        } else {
            // General Sales templates (objection or follow-up)
            outputText = outputText.replace(/\[שם_הלקוח\]/g, clientName);
        }
    }
    
    document.getElementById('outputBox').value = outputText;
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
