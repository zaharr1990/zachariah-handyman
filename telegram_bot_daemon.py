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

CONFIG_PATH = r"C:\antigravety\projects\business_manager\config.json"
DATA_PATH = r"C:\antigravety\projects\business_manager\data.json"

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
• `/expense [סכום] [תיאור]` - רישום הוצאה חדשה (לדוגמה: `/expense 80 דלק לדימונה`).
• `/income [סכום] [תיאור]` - רישום הכנסה חדשה (לדוגמה: `/income 250 צילינדר משה`).

📢 *שיווק ומכירות:*
• `/post [1/2/3]` - קבלת פוסט שיווקי מוכן להעתקה (1-3) עם תמונה מתאימה.
• `/review [שם_הלקוח] [סוג_העבודה]` - יצירת בקשת חוות דעת מקצועית (לדוגמה: `/review יוסי החלפת מנעול`).

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
            
            # Simple category detection
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
            
            # Simple category detection
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
        
        # Send as photo
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

    else:
        send_message(token, chat_id, "❓ פקודה לא מוכרת. שלח `/help` כדי לראות את רשימת הפקודות הזמינות.")

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
                    handle_command('/help', token, chat_id)
                    
        time.sleep(2)

if __name__ == "__main__":
    main()
