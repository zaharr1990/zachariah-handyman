import json
import urllib.request
import urllib.parse
import time
import os
import sys
import datetime

# Configure stdout/stderr to support UTF-8 (emojis and Hebrew) on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
DATA_PATH = os.path.join(SCRIPT_DIR, "data.json")

# Load templates from notifier logic
from telegram_notifier import ad_options, weekly_schedule

def load_config():
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return None

def load_data():
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {"expenses": [], "income": [], "tasks": []}

def save_data(data):
    try:
        with open(DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        # Push update to GitHub Pages automatically
        os.system('git add data.json && git commit -m "Auto-update data from Telegram" && git push origin main')
        return True
    except Exception as e:
        print("Error saving/pushing data:", e)
        return False

def send_message(token, chat_id, text):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'Markdown'
    }).encode('utf-8')
    req = urllib.request.Request(url, data=data)
    try:
        urllib.request.urlopen(req)
    except Exception as e:
        print("Error sending message:", e)

def send_photo(token, chat_id, photo_url, caption):
    url = f"https://api.telegram.org/bot{token}/sendPhoto"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'photo': photo_url,
        'caption': caption,
        'parse_mode': 'Markdown'
    }).encode('utf-8')
    req = urllib.request.Request(url, data=data)
    try:
        urllib.request.urlopen(req)
        return True
    except Exception as e:
        print("Error sending photo:", e)
        return False

def get_updates(token, offset=None):
    url = f"https://api.telegram.org/bot{token}/getUpdates"
    if offset:
        url += f"?offset={offset}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print("Error fetching updates:", e)
        return None

def handle_command(cmd_text, token, chat_id):
    parts = cmd_text.split()
    cmd = parts[0].lower()
    
    # 1. HELP / START
    if cmd in ['/start', '/help', 'עזרה']:
        help_msg = """📱 *בוט הניהול של זכריה - פתרונות ושירותים לבית*

שלום זכריה! הנה הפקודות שתוכל לשלוח לי מכאן:

⚙️ *פיננסים ומעקב כספים:*
• `/status` - צפייה ביתרה, הכנסות והוצאות נוכחיות.
• `/expense [סכום] [תיאור]` - רישום הוצאה חדשה (למשל: `/expense 80 דלק`).
• `/income [סכום] [תיאור]` - רישום הכנסה חדשה (למשל: `/income 250 צילינדר`).

📢 *שיווק, תוכן ומכירות:*
• `/post [1/2/3]` - קבלת פוסט שיווקי מוכן להעתקה (1-3) עם תמונה מתאימה.
• `/review [שם_הלקוח] [סוג_העבודה]` - יצירת בקשת חוות דעת.
• `/content [community/professional/selling]` - פוסט שיווקי לפי סגנון ותמונה מתאימה.

📊 *מערך 5 סוכני הניהול:*
• `/strategist [יוזמה]` - ניתוח מתחרים. ללא יוזמה: יבוצע ניתוח פיננסי חי!
• `/cmo [קמפיין]` - תוכנית שיווק דיגיטלית ותקציב.
• `/innovate [בעיה]` - סיעור מוחות ופתרונות יצירתיים.
• `/coach` - לו"ז עבודה שבועי ופרודוקטיביות (פומודורו).
• `/runflow [יוזמה]` - הפעלת שרשרת הסוכנים האוטומטית וקבלת תיק פרויקט שלם.

🎯 *משימות ויעדים:*
• `/tasks` - רשימת משימות צמיחה פעילות.
• `/done [מספר_משימה]` - סימון משימה כהושלמה.
"""
        send_message(token, chat_id, help_msg)

    # 2. STATUS
    elif cmd == '/status':
        data = load_data()
        total_inc = sum(float(item["amount"]) for item in data["income"])
        total_exp = sum(float(item["amount"]) for item in data["expenses"])
        balance = total_inc - total_exp
        
        status_msg = f"""📊 *דו\"ח פיננסי מהיר - זכריה פתרונות ושירותים לבית*

💵 *סה\"כ הכנסות:* ₪{total_inc:,.2f}
💸 *סה\"כ הוצאות/השקעה:* ₪{total_exp:,.2f}
⚖️ *יתרה נקייה:* **₪{balance:,.2f}**

*(הנתונים מעודכנים ומסונכרנים עם האתר שלך)*"""
        send_message(token, chat_id, status_msg)

    # 3. ADD EXPENSE
    elif cmd == '/expense':
        if len(parts) < 3:
            send_message(token, chat_id, "❌ מבנה פקודה לא תקין. השתמש בפורמט: `/expense [סכום] [תיאור]`")
            return
        try:
            amount = float(parts[1])
            desc = " ".join(parts[2:])
            data = load_data()
            
            cat = "ציוד וכלי עבודה"
            if "דלק" in desc or "נסיעה" in desc:
                cat = "נסיעות ודלק"
            elif "פרסום" in desc or "שיווק" in desc:
                cat = "שיווק ופרסום"
                
            new_exp = {
                "id": int(time.time()),
                "date": datetime.date.today().isoformat(),
                "category": cat,
                "description": desc,
                "amount": amount
            }
            data["expenses"].append(new_exp)
            if save_data(data):
                send_message(token, chat_id, f"✅ *ההוצאה נרשמה בהצלחה!* \nסכום: ₪{amount} | תיאור: {desc}\n(הנתונים עלו לאתר שלך)")
            else:
                send_message(token, chat_id, "❌ תקלה בשמירת הנתונים במערכת.")
        except ValueError:
            send_message(token, chat_id, "❌ סכום לא תקין. אנא הזן מספר.")

    # 4. ADD INCOME
    elif cmd == '/income':
        if len(parts) < 3:
            send_message(token, chat_id, "❌ מבנה פקודה לא תקין. השתמש בפורמט: `/income [סכום] [תיאור]`")
            return
        try:
            amount = float(parts[1])
            desc = " ".join(parts[2:])
            data = load_data()
            
            cat = "הכנסה - מנעולנות"
            if "הנדימן" in desc or "הרכבה" in desc or "תלייה" in desc:
                cat = "הכנסה - הנדימן"
                
            new_inc = {
                "id": int(time.time()),
                "date": datetime.date.today().isoformat(),
                "category": cat,
                "description": desc,
                "amount": amount
            }
            data["income"].append(new_inc)
            if save_data(data):
                send_message(token, chat_id, f"✅ *ההכנסה נרשמה בהצלחה!* \nסכום: ₪{amount} | תיאור: {desc}\n(הנתונים עלו לאתר שלך)")
            else:
                send_message(token, chat_id, "❌ תקלה בשמירת הנתונים במערכת.")
        except ValueError:
            send_message(token, chat_id, "❌ סכום לא תקין. אנא הזן מספר.")

    # 5. GET MARKETING POST
    elif cmd == '/post':
        if len(parts) < 2 or parts[1] not in ['1', '2', '3']:
            send_message(token, chat_id, "❌ אנא בחר מספר פוסט תקין: `/post 1`, `/post 2`, או `/post 3`.")
            return
        post_idx = int(parts[1])
        post_text = ad_options[post_idx]
        
        from telegram_notifier import ad_images, GITHUB_PAGES_BASE
        photo_filename = ad_images[post_idx]
        photo_url = f"{GITHUB_PAGES_BASE}{photo_filename}?t={int(time.time())}"
        
        caption_text = f"📝 *הפוסט השיווקי שלך מוכן להעתקה:*\n\n{post_text}\n\n*(אל תשכח להוסיף את מספר הטלפון שלך בסוף הפוסט!)*"
        
        if not send_photo(token, chat_id, photo_url, caption_text):
            send_message(token, chat_id, caption_text + f"\n\n🖼️ _(שגיאה בטעינת התמונה, אך תוכל לצרף ידנית את: {photo_filename})_")

    # 6. GET REVIEW TEMPLATE
    elif cmd == '/review':
        if len(parts) < 3:
            send_message(token, chat_id, "❌ מבנה פקודה לא תקין. השתמש בפורמט: `/review [שם_הלקוח] [סוג_העבודה]`\n(לדוגמה: `/review משה החלפת צילינדר`)")
            return
        client_name = parts[1]
        work_desc = " ".join(parts[2:])
        
        review_msg = f"""שלום {client_name}, בוקר טוב.

רציתי לוודא שהכול תקין ועובד לשביעות רצונך המלאה עם {work_desc}. שביעות הרצון של לקוחותיי היא הדבר החשוב לי ביותר.

במידה ואכן היית מרוצה מהשירות ומהעבודה, אודה לך מאוד אם תוכל להקדיש דקה מזמנך כדי לכתוב חוות דעת קצרה או להמליץ עליי בקבוצות השכונתיות או בפייסבוק. המלצות אלו קריטיות להמשך מתן שירות הוגן ומקצועי באזורנו.

תודה רבה והמשך יום נעים,
זכריה - פתרונות ושירותים לבית."""
        
        send_message(token, chat_id, f"💬 *הודעת חוות דעת מוכנה להעתקה ושליחה ללקוח בוואטסאפ:*\n\n{review_msg}")

    # 7. TASKS LIST
    elif cmd == '/tasks':
        data = load_data()
        if not data.get("tasks"):
            send_message(token, chat_id, "🎯 אין משימות פעילות כרגע.")
            return
            
        tasks_msg = "🎯 *רשימת משימות צמיחה פעילות:*\n\n"
        for idx, t in enumerate(data["tasks"]):
            status_icon = "✅" if t["completed"] else "⏳"
            tasks_msg += f"{status_icon} *[{idx + 1}]* {t['text']} (יעד: {t['targetDate']})\n"
        
        tasks_msg += "\nלסימון משימה כהושלמה שלח: `/done [מספר]`"
        send_message(token, chat_id, tasks_msg)

    # 8. COMPLETE TASK
    elif cmd == '/done':
        if len(parts) < 2:
            send_message(token, chat_id, "❌ השתמש בפורמט: `/done [מספר]`")
            return
        try:
            task_num = int(parts[1]) - 1
            data = load_data()
            if task_num < 0 or task_num >= len(data["tasks"]):
                send_message(token, chat_id, "❌ מספר משימה לא קיים ברשימה.")
                return
                
            data["tasks"][task_num]["completed"] = True
            if save_data(data):
                send_message(token, chat_id, f"✅ המשימה *\"{data['tasks'][task_num]['text']}\"* סומנה כהושלמה ועודכנה באתר!")
            else:
                send_message(token, chat_id, "❌ תקלה בעדכון המשימה.")
        except ValueError:
            send_message(token, chat_id, "❌ אנא הזן מספר תקין.")

    # 9. STRATEGIST
    elif cmd == '/strategist':
        initiative = " ".join(parts[1:])
        if not initiative:
            data = load_data()
            total_inc = sum(float(item["amount"]) for item in data["income"])
            total_exp = sum(float(item["amount"]) for item in data["expenses"])
            net_profit = total_inc - total_exp
            locksmith_inc = sum(float(item["amount"]) for item in data["income"] if "מנעולנות" in item["category"])
            handyman_inc = sum(float(item["amount"]) for item in data["income"] if "הנדימן" in item["category"])
            
            advice = f"""💰 *דו\"ח ייעוץ ואופטימיזציה פיננסית חי לזכריה*
תאריך ניתוח: {datetime.date.today().strftime('%d/%m/%Y')}

📊 *סיכום נתוני העסק:*
* מחזור הכנסות כולל: ₪{total_inc:,.2f}
* הוצאות והשקעה בעסק: ₪{total_exp:,.2f}
* רווח נקי מצטבר: ₪{net_profit:,.2f}

📈 *ניתוח רווחיות לפי מחלקות:*
* הכנסות ממנעולנות: ₪{locksmith_inc:,.2f}
* הכנסות מהנדימן והתקנות: ₪{handyman_inc:,.2f}

💡 *המלצות אסטרטגיות לייעול:*
"""
            if locksmith_inc >= handyman_inc and locksmith_inc > 0:
                advice += "* מנעולנות היא הקטגוריה המכניסה ביותר שלך כרגע. מומלץ להקצות לפחות 70% מזמנך ומהשיווק שלך לקידום שירותי מנעולנות דחופים בירוחם (החלפת צילינדרים, מנגנוני נעילה).\n* שים לב שהוצאות העסק שלך יכוסו מהר יותר ככל שתתמקד בצילינדרים בעלי שולי רווח גבוהים."
            elif handyman_inc > locksmith_inc:
                advice += "* עבודות הנדימן והרכבות מהוות את רוב ההכנסות שלך כעת. זהו בסיס מצוין לבניית מוניטין ויחסים אישיים עם תושבי ירוחם.\n* מומלץ להציע 'בדיקת תקינות דלת חינם' בכל ביקור הנדימן כדי למכור גם שירותי מנעולנות (Upsell) ולהגדיל את הממוצע ללקוח."
            else:
                advice += "* מומלץ להקפיד על רישום של לפחות 5 עסקאות נוספות החודש כדי לזהות מגמות רווחיות ברורות."
            send_message(token, chat_id, advice)
        else:
            report = f"""🔍 *סוכן אסטרטגיה - ניתוח מתחרים ממוקד עבור: {initiative}*

על בסיס המידע על השוק המקומי בירוחם והסביבה:
1. *מתחרים מרחוק* (מבאר שבע/דימונה): גובים דמי נסיעה גבוהים (150-250 ש"ח) וזמן הגעה ארוך.
2. *חובבנים מקומיים*: עובדים ללא רישיון, ללא ביטוח מקצועי, ורמת גימור נמוכה.

*הפער העסקי וההזדמנות של זכריה:*
✔️ *מקומי ומהיר*: הגעה תוך 15-20 דקות בירוחם.
✔️ *מחיר הוגן*: ללא דמי נסיעה מופקעים מחוץ לעיר.
✔️ *אחריות וביטוח*: עבודה מבוטחת ומורשית לחלוטין (משרה ביטחון בלקוחות).

*המלצה אסטרטגית*: להבליט בכל פרסום את המקומיות ואת תעודת המקצועיות/ביטוח."""
            send_message(token, chat_id, report)

    # 10. CMO
    elif cmd == '/cmo':
        initiative = " ".join(parts[1:]) if len(parts) > 1 else "שירותי מנעולנות והנדימן"
        report = f"""📢 *סוכן מנהל שיווק - תוכנית שיווק דיגיטלית עבור: {initiative}*

*1. ערוצי הפצה מומלצים בירוחם:*
* 💬 *קבוצות וואטסאפ שכונתיות*: הערוץ החזק ביותר בירוחם לחשיפה מיידית.
* 👥 *קבוצות פייסבוק מקומיות* ('ירוחם שלי', 'ירוחם ביחד'): מיועד לחיפוש אורגני והמלצות.
* 📍 *כרטיס גוגל לעסק (Google Maps)*: קריטי למנעולנות חירום (מציאת מנעולן בשעת צורך).

*2. מסגרת תקציב שיווק מוצעת:*
* תקציב פייסבוק/וואטסאפ: 0 ש"ח (שיווק אורגני קבוצתי).
* כרטיס ביקור דיגיטלי / פליירים מקומיים: 150-200 ש"ח הדפסה חד-פעמית.

*3. תוכנית עבודה חודשית:*
* שבוע 1-2: פתיחה ומיקום בגוגל מפות, רישום פוסטים אורגניים בקבוצות.
* שבוע 3-4: שליחת הודעות חוות דעת ללקוחות קיימים וצבירת המלצות ברשת."""
        send_message(token, chat_id, report)

    # 11. CONTENT
    elif cmd == '/content':
        tone = parts[1].lower() if len(parts) > 1 else 'community'
        phone = parts[2] if len(parts) > 2 else '[הכנס טלפון]'
        
        from telegram_notifier import GITHUB_PAGES_BASE
        
        tone_texts = {
            'community': f"""🔑🚪 *שכנים בירוחם, מתי לאחרונה בדקתם את הדלת שלכם?*

כתושב המקום, חשוב לי שהבית שלכם יהיה מוגן ובטוח. אם הדלת נגררת, המפתח מסתובב קשה, או שסתם עברתם דירה ורוצים להחליף צילינדר – אני כאן בשבילכם, ממש ליד הבית.

*זכריה - פתרונות ושירותים לבית* מגיע אליכם עם חיוך, שירות מהיר, בלי דמי נסיעה מופקעים, ועבודה נקייה מכל הלב.

📞 דברו איתי להתייעצות או תיאום: {phone}""",
            
            'professional': f"""🔑 *זכריה - פתרונות ושירותים לבית: שירותי מנעולנות והתקנות מורשים*

אנו מעניקים פתרונות נעילה ותחזוקה מתקדמים לבתים ועסקים בירוחם והסביבה:
* החלפת צילינדרים איכותיים (רב-בריח, מולטילוק ועוד) באריזה מקורית.
* כיוון ותיקון דלתות כניסה ופנים, מנגנוני נעילה וידיות.
* התקנות ותלייה (טלוויזיות, רהיטים ומדפים) בדיוק מקצועי.

כל העבודות מבוצעות ברישיון ובאחריות מלאה, עם כיסוי ביטוחי מקצועי מלא.

📞 לתיאום והצעות מחיר מסודרות: {phone}""",
            
            'selling': f"""⚡ *צריכים מנעולן או הנדימן בירוחם עכשיו? זכריה בדרך!* ⚡

למה להזמין מישהו מבחוץ ולשלם יותר? 
* החלפת צילינדר מהירה ומקצועית באחריות מלאה!
* תליית טלוויזיה או מדף בצורה ישרה ונקייה!
* תיקון דלתות ורהיטים במקום!

הגעה מהירה, שירות אמין ומחירים הוגנים ושקופים מראש לתושבי ירוחם והסביבה.

📞 התקשרו או שלחו הודעה בוואטסאפ: {phone}"""
        }
        
        text_out = tone_texts.get(tone, tone_texts['community'])
        img_map = {
            'community': 'ad_locksmith.png',
            'professional': 'ad_general_repairs.png',
            'selling': 'ad_locksmith.png'
        }
        img_file = img_map.get(tone, 'ad_locksmith.png')
        photo_url = f"{GITHUB_PAGES_BASE}{img_file}?t={int(time.time())}"
        
        caption_text = f"📝 *הפוסט השיווקי שלך ({tone}) מוכן להעתקה:*\n\n{text_out}\n\n*(אל תשכח להוסיף את מספר הטלפון שלך בסוף הפוסט!)*"
        if not send_photo(token, chat_id, photo_url, caption_text):
            send_message(token, chat_id, caption_text)

    # 12. INNOVATE
    elif cmd == '/innovate':
        challenge = " ".join(parts[1:]) if len(parts) > 1 else "הגדלת כמות הלקוחות הראשונים"
        report = f"""💡 *סוכן מחקר וחדשנות - סיעור מוחות עבור: {challenge}*

1. *פתרון א': ייחודיות מבדלת* – הצעת 'שירות בדיקת תקינות דלת חינם' לכל לקוח שמזמין עבודת הנדימן (תליית טלוויזיה או הרכבה). זה יוצר ערך מוסף עצום ומייצר מכירות המשך (Upsell) של צילינדרים או כיוון דלתות.
2. *פתרון ב': שיתוף פעולה מקומי* – יצירת קשר עם מתווכים ומנהלי נכסים בירוחם (המשכירים דירות לסטודנטים או למשפחות) והצעת שירות החלפת מנעול מהיר ומחיר מיוחד במעברי דירה.
3. *פתרון ג': יצירת חבילות (Bundling)* – חבילת 'כניסה לבית חדש' הכוללת הרכבת 2 רהיטים, תליית טלוויזיה והחלפת צילינדר כניסה במחיר קבוצתי מוזל.

*דירוג יישימות:* פתרון א' ו-ב' הם הקלים ביותר ליישום מיידי ללא עלויות."""
        send_message(token, chat_id, report)

    # 13. COACH
    elif cmd == '/coach':
        report = f"""📅 *סוכן אופטימיזציה ואימון - לו\"ז עבודה ופרודוקטיביות*

כדי להוציא את המשימות לפועל ביעילות ובשיטת פומודורו (25 דקות ריכוז, 5 דקות מנוחה):

* 🕒 *חלון זמן א': שיווק ופרסום מקומי*
  * מתי: יום ראשון הקרוב בשעה 09:00 (משך: 60 דקות - 2 מחזורי פומודורו).
  * משימה: פרסום הפוסט השבועי בקבוצות ירוחם ומעקב פניות.

* 🕒 *חלון זמן ב': רכש והצטיידות מלאי*
  * מתי: יום שלישי בשעה 10:00 (משך: 90 דקות - 3 מחזורי פומודורו).
  * משימה: השלמת רכש מנעולים, מברגים וצילינדרים לפלדלת למלאי העסקי.

* 🕒 *חלון זמן ג': סקירה ועדכון פיננסי*
  * מתי: יום חמישי בשעה 20:00 (משך: 30 דקות - מחזור פומודורו אחד).
  * משימה: סנכרון הוצאות והכנסות באמצעות בוט הטלגרם וסקירת רווחיות.

🧘 *הרגלים עסקיים מומלצים ליומיום:*
1. *בוקר*: בדיקת תקינות כלי עבודה ברכב (5 דק').
2. *שטח*: שליחת הודעת חוות דעת לכל לקוח בסיום עבודה (3 דק').
3. *ערב*: עדכון הוצאות/הכנסות בבוט (2 דק')."""
        send_message(token, chat_id, report)

    # 14. RUNFLOW
    elif cmd == '/runflow':
        initiative = " ".join(parts[1:])
        if not initiative:
            send_message(token, chat_id, "❌ אנא הזן יוזמה עסקית לאחר הפקודה. לדוגמה: `/runflow שירות מנעולן חירום`")
            return
            
        send_message(token, chat_id, f"⚡ *מפעיל את שרשרת הסוכנים האוטומטית עבור: '{initiative}'...*")
        
        # Generate outputs
        rnd_out = "💡 *R&D (מחקר וחדשנות)*:\n1. הצעת שדרוג אבטחה מוזל לכל לקוח שמזמין את העבודה.\n2. חבילת השקה לתושבי ירוחם.\n3. שיתופי פעולה עם מתווכים בעיר."
        strat_out = "📊 *אסטרטגיה*:\n* קהל יעד: בעלי בתים בירוחם.\n* יתרון תחרותי: מענה מהיר תוך 15 דקות ללא דמי נסיעה מחוץ לעיר.\n* יעדים: הגעה ל-5 לקוחות ראשונים בשבועיים הקרובים."
        cmo_out = "📢 *שיווק*:\n* ערוצים: קבוצות פייסבוק מקומיות וירוחם בוואטסאפ (0 ש\"ח תקציב).\n* מדד הצלחה: צבירת 5 המלצות חיוביות בשבוע הראשון."
        content_out = f"✍ *קריאייטיב ותוכן*:\n🔑 *שכנים בירוחם, יש לנו פתרון מקצועי קרוב לבית!*\nצריכים שירות עבור '{initiative}'? במקום להמתין לבעל מקצוע מבחוץ ולשלם כפול – זכריה איתכם כאן בירוחם! שירות אמין ומחירים שקופים מראש.\n📞 לייעוץ וקריאת שירות מהירה: [טלפון]"
        coach_out = "📅 *אימון וניהול זמן*:\n* יום ראשון ב-09:00: פרסום פוסטים (60 דק').\n* יום שלישי ב-10:00: הכנת מלאי וציוד (90 דק').\n* יום חמישי ב-20:00: עדכון פיננסי בבוט (30 דק')."
        
        final_report = f"""🏆 *תיק הוצאה לפועל עסקי מאוחד - זכריה פתרונות ושירותים לבית*
שם היוזמה: {initiative}

=================================
{rnd_out}

=================================
{strat_out}

=================================
{cmo_out}

=================================
{content_out}

=================================
{coach_out}"""
        
        send_message(token, chat_id, final_report)

    else:
        send_message(token, chat_id, "❓ פקודה לא מוכרת. שלח `/help` כדי לראות את רשימת הפקודות הזמינות.")



def send_weekday_recommendation(token, chat_id, weekday_idx):
    from telegram_notifier import ad_images, GITHUB_PAGES_BASE
    
    sched = weekly_schedule[weekday_idx]
    ad_text = ad_options[sched["ad_id"]]
    photo_filename = ad_images[sched["ad_id"]]
    photo_url = f"{GITHUB_PAGES_BASE}{photo_filename}?t={int(time.time())}"
    
    weekday_names = {6: "ראשון", 1: "שלישי", 3: "חמישי"}
    day_name = weekday_names[weekday_idx]
    
    msg = f"""📢 *המלצת פרסום מוכנה ליום {day_name}*

⏰ *שעת פרסום מומלצת:* **{sched['time']}**

💡 *הרציונל השיווקי:*
{sched['rationale']}

---
📝 *הפוסט מוכן להעתקה (העתק והדבק):*

{ad_text}

*(אל תשכח להוסיף את הטלפון שלך בסוף הפוסט!)*"""

    if not send_photo(token, chat_id, photo_url, msg):
        send_message(token, chat_id, msg)

def handle_free_text(text, token, chat_id):
    text_lower = text.lower()
    
    # 1. Weekday queries
    if any(kw in text_lower for kw in ["ראשון", "sunday"]):
        send_weekday_recommendation(token, chat_id, 6) # Sunday
    elif any(kw in text_lower for kw in ["שלישי", "tuesday"]):
        send_weekday_recommendation(token, chat_id, 1) # Tuesday
    elif any(kw in text_lower for kw in ["חמישי", "thursday"]):
        send_weekday_recommendation(token, chat_id, 3) # Thursday
    elif any(kw in text_lower for kw in ["היום", "today"]):
        today_wd = datetime.datetime.today().weekday()
        if today_wd == 6:
            send_weekday_recommendation(token, chat_id, 6)
        elif today_wd == 1:
            send_weekday_recommendation(token, chat_id, 1)
        elif today_wd == 3:
            send_weekday_recommendation(token, chat_id, 3)
        else:
            send_message(token, chat_id, """📅 *היום אין פרסום קבוע בלוח הזמנים העסקי שלך.*

הפרסומים הקבועים הם:
• *יום ראשון* ב-09:00: פוסט תיקונים והנדימן.
• *יום שלישי* ב-18:00: פוסט מנעולנות.
• *יום חמישי* ב-19:00: פוסט תליית טלוויזיות והרכבות.

תוכל לבקש פוסט שיווקי מוכן בכל עת על ידי הפקודות: `/post 1`, `/post 2`, או `/post 3`.""")
            
    # 2. FAQ & Learning queries
    elif any(kw in text_lower for kw in ["פייסבוק", "facebook", "פרסום", "איפה לפרסם", "קבוצות"]):
        guide = """👥 *איך ואיפה הכי נכון לפרסם בירוחם?*

כדי לקבל את מירב החשיפה ללא עלות:
1. *קבוצות פייסבוק מקומיות* (הכי חזק):
   • 'ירוחם שלי'
   • 'ירוחם ביחד'
   • 'לוח דרושים ועסקים ירוחם'
2. *קבוצות וואטסאפ שכונתיות*:
   • פרסם פעם בשבוע בקבוצות השכונה שלך ובקבוצת 'עסקים בירוחם'.
3. *טיפ שיווקי*: פרסם תמיד בשעות הערב (18:00-21:00) או בבוקר מוקדם (08:00-09:30) כשאנשים פנויים בטלפון. אל תשכח להוסיף את התמונה ששלחתי לך ואת מספר הטלפון שלך!"""
        send_message(token, chat_id, guide)
        
    elif any(kw in text_lower for kw in ["לקוח", "חוות דעת", "ביקורת", "המלצה", "שירות"]):
        guide = """💬 *איך לבקש חוות דעת מלקוח בצורה נעימה?*

חוות דעת חיוביות הן המנוע הכי חזק לעסק שלך בירוחם! בסיום כל עבודה:
1. ודא שהלקוח מרוצה ב-100% והשטח נקי.
2. שלח לו הודעה מנוסחת בוואטסאפ. תוכל ליצור אותה ברגע זה בבוט על ידי שליחת הפקודה: `/review [שם הלקוח] [סוג העבודה]`
3. לדוגמה: `/review משה החלפת צילינדר` - הבוט יחזיר לך הודעה אישית מוכנה להעתקה ושליחה ללקוח!"""
        send_message(token, chat_id, guide)
        
    elif any(kw in text_lower for kw in ["מחיר", "יקר", "התנגדות", "כמה עולה", "תמחור"]):
        guide = """💵 *איך להתמודד עם לקוח שאומר שאתה יקר?*

כמנעולן והנדימן מקצועי ומורשה, אל תיגרר למלחמת מחירים. כשלקוח אומר "יקר לי":
1. *הדגש את המקומיות*: "אני תושב ירוחם, מגיע אליך תוך 15 דקות. אם יש בעיה מחר - יש לך למי לפנות ואני פה בשבילך מיד."
2. *תעודה ואחריות*: "אני עובד ברישיון מנעולן ועם ביטוח מקצועי מלא. עבודה על דלת כניסה צריכה להיות בטוחה ב-100%."
3. *השוואה למתחרים מבחוץ*: "בעל מקצוע מבאר שבע או דימונה יגבה ממך 200 ש\"ח רק על נסיעה, ובמקרה של תקלה לא יחזור לתקן. אצלי השירות כולל אחריות מלאה בבית שלך." """
        send_message(token, chat_id, guide)
        
    elif any(kw in text_lower for kw in ["צילינדר", "מנעול", "דלת", "מנעולנות", "מפתח"]):
        guide = """🔑 *טיפים מקצועיים למכירת שירותי מנעולנות (Upsell):*

בכל פעם שאתה מגיע ללקוח לביצוע עבודת הנדימן (תליית טלוויזיה, הרכבת רהיט):
1. *בדיקת דלת חינם*: הצעה מנצחת - "מכיוון שאני כבר כאן, אני עושה בדיקה מהירה חינם לדלת הכניסה שלך לוודא שהיא בטוחה ומכוונת."
2. *הבחנה בבעיות*: אם המפתח מסתובב קשה, הצע לשמן או להחליף צילינדר במקום.
3. *החלפת דירה*: שאל דיירים חדשים אם הם החליפו מפתח כשנכנסו. רובם לא חושבים על זה וישמחו להחליף צילינדר לשקט נפשי."""
        send_message(token, chat_id, guide)

    elif any(kw in text_lower for kw in ["היי", "שלום", "בוקר", "ערב", "תודה"]):
        send_message(token, chat_id, "היי זכריה! שמח לשמוע ממך. 😊\n\nספר לי, איזה אתגר עסקי או שאלה יש לך היום? תוכל לשאול אותי על שיווק, תמחור, מנעולנות או לבקש לדעת מה לפרסם היום.")
        
    else:
        # Default help options for free text
        fallback = """❓ *היי זכריה, לא מצאתי תשובה מדויקת לשאלתך.*

אך תוכל לשאול אותי שאלות חופשיות בנושאים הבאים:
• 📅 *"מה מפרסמים היום?"* או *"מה מפרסמים ביום שלישי?"*
• 👥 *"איך מפרסמים בפייסבוק ובוואטסאפ?"*
• 💬 *"איך לבקש המלצה או חוות דעת מלקוח?"*
• 💵 *"איך לענות ללקוח שטוען שהמחיר יקר?"*
• 🔑 *"איך להציע שירותי מנעולנות בביקור הנדימן?"*

לחלופין, שלח `/help` כדי לראות את כל פקודות הניהול המהירות של הסוכנים!"""
        send_message(token, chat_id, fallback)

def main():
    config = load_config()
    if not config:
        print("Error: config.json not found or invalid.")
        sys.exit(1)
        
    token = config.get("telegram_bot_token")
    chat_id = str(config.get("telegram_chat_id"))
    
    print("Telegram Interactive Bot Daemon started...")
    print("Listening for messages from Chat ID:", chat_id)
    
    import datetime
    
    # Track offset to read only new updates
    last_update_id = None
    
    while True:
        updates = get_updates(token, offset=last_update_id)
        if updates and updates.get("ok"):
            for update in updates.get("result", []):
                last_update_id = update["update_id"] + 1
                
                # Verify sender is only the authorized user (Zachariah)
                message = update.get("message")
                if not message:
                    continue
                    
                sender_id = str(message["from"]["id"])
                if sender_id != chat_id:
                    print(f"Ignored unauthorized message from sender: {sender_id}")
                    continue
                    
                text = message.get("text", "").strip()
                if text.startswith('/'):
                    print(f"Received command: {text}")
                    handle_command(text, token, chat_id)
                elif text:
                    print(f"Received text: {text}")
                    # default command trigger
                    handle_free_text(text, token, chat_id)
                    
        time.sleep(2)

if __name__ == "__main__":
    main()
