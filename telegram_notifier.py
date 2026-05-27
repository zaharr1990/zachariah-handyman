import json
import urllib.request
import urllib.parse
import sys
import datetime
import os

# Configuration path (relative to script directory)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
GITHUB_PAGES_BASE = "https://zaharr1990.github.io/zachariah-handyman/"

# Brand name
BRAND_NAME = "זכריה - פתרונות ושירותים לבית"

# AD templates (Locksmithing & Handyman only - no electrical, short and punchy, Hebrew only, no ZA)
ad_options = {
    1: """🔑 *תקועים מחוץ לבית? המפתח מסתובב קשה?*
אל תחכו לרגע האחרון!
*זכריה - פתרונות ושירותים לבית* כאן בשבילכם בירוחם והסביבה.

✔️ פריצה שקטה ומורשית של דלתות
✔️ החלפת צילינדרים באריזה סגורה ומקורית
✔️ תיקון דלתות גוררות וכיוון מנגנונים

זמינות מהירה, עבודה מבוטחת ומחירים הוגנים ושקופים מראש!
📞 לייעוץ וקריאת שירות: [טלפון]""",
    
    2: """🖥️🛋️ *קניתם טלוויזיה או רהיט חדש? תשאירו לנו את העבודה הקשה!*
במקום לבזבז את סוף השבוע על הוראות מסובכות וכאבי גב – נדאג להכול:

✔️ תליית מסכי טלוויזיה בפילוס מושלם (קירות בטון, בלוקים וגבס)
✔️ הרכבת ארונות, שידות וספריות (איקאה ועוד)
✔️ התקנת מדפים, וילונות ואביזרי אמבטיה

עבודה מדויקת, סופר-נקייה (בלי אבק מאחורינו) וביטוח מקצועי מלא.
📞 לתיאום והזמנת שירות: [טלפון]""",
    
    3: """🛠️🏠 *דלת הארון נפלה? המגירה תקועה? הגיע הזמן לסגור את כל הפינות בבית!*
במקום לדחות או לחפש בעלי מקצוע שונים, פותרים הכול בביקור אחד יעיל:

✔️ תיקון מגירות, דלתות ארונות וצירים
✔️ החלפת ידיות ומנעולים פנימיים
✔️ פתרונות תחזוקה ותיקון כלליים לכל פינה בבית

שירות מקצועי, אדיב ומקומי בירוחם – בלי דמי נסיעה מופקעים.
📞 לפרטים ותיאום מהיר: [טלפון]"""
}

# Image filenames mapping
ad_images = {
    1: "ad_locksmith.png",
    2: "ad_mounting_assembly.png",
    3: "ad_general_repairs.png"
}

# Publishing strategy schedule
weekly_schedule = {
    # 0 = Monday, 6 = Sunday
    6: { # Sunday
        "time": "09:00",
        "ad_id": 3,
        "rationale": "תחילת השבוע הוא הזמן שבו אנשים רוצים לסגור תיקונים קטנים שהציקו להם בסוף השבוע בבית."
    },
    1: { # Tuesday
        "time": "18:00",
        "ad_id": 1,
        "rationale": "אמצע השבוע הוא זמן מצוין להציע שדרוג אבטחה וכיוון דלתות, כשאנשים פנויים בערב בבית לפני סוף השבוע."
    },
    3: { # Thursday
        "time": "19:00",
        "ad_id": 2,
        "rationale": "חמישי בערב הוא זמן היערכות לסוף השבוע. אנשים מתכננים לקנות או כבר קנו רהיטים ומסכים, ורוצים עזרה מקצועית בהרכבה ותלייה לקראת שישי."
    }
}

def load_config():
    if not os.path.exists(CONFIG_PATH):
        return None
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return None

def send_telegram_message(token, chat_id, message_text):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': message_text,
        'parse_mode': 'Markdown'
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print("Error sending message to Telegram:", e)
        return None

def send_telegram_photo(token, chat_id, photo_url, caption):
    url = f"https://api.telegram.org/bot{token}/sendPhoto"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'photo': photo_url,
        'caption': caption,
        'parse_mode': 'Markdown'
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print("Error sending photo to Telegram:", e)
        # Fallback to standard text message if photo fails
        return send_telegram_message(token, chat_id, caption)

def run_notifications(is_test=False):
    config = load_config()
    if not config or config.get("telegram_bot_token") == "YOUR_BOT_TOKEN_HERE":
        print("Telegram bot is not configured yet in config.json.")
        return
        
    token = config.get("telegram_bot_token")
    chat_id = config.get("telegram_chat_id")
    
    import time
    cache_buster = int(time.time())
    
    if is_test:
        test_caption = f"📸 *חיבור בוט טלגרם של {BRAND_NAME} עבר בהצלחה!*\n\nמעכשיו תקבל כאן התראות פרסום מסודרות, כולל התמונה המעוצבת והטקסט להעתקה מהירה."
        test_photo = f"{GITHUB_PAGES_BASE}ad_locksmith.png?t={cache_buster}"
        send_telegram_photo(token, chat_id, test_photo, test_caption)
        print("Test photo message sent successfully.")
        return

    # Check today's weekday
    today = datetime.datetime.today().weekday()
    if today not in weekly_schedule:
        print("No scheduled posts for today.")
        return
        
    sched = weekly_schedule[today]
    ad_text = ad_options[sched["ad_id"]]
    photo_filename = ad_images[sched["ad_id"]]
    photo_url = f"{GITHUB_PAGES_BASE}{photo_filename}?t={cache_buster}"
    
    msg = f"""📢 *התראת פרסום שבועי - {BRAND_NAME}*

⏰ *מתי לפרסם:* היום בשעה **{sched['time']}**

💡 *למה היום ובשעה זו?* 
{sched['rationale']}

---
📝 *טקסט לפוסט (העתק והדבק):*

{ad_text}

*(אל תשכח להוסיף את מספר הטלפון שלך בסוף הפוסט!)*"""

    send_telegram_photo(token, chat_id, photo_url, msg)
    print("Scheduled marketing advice with photo sent to Telegram.")

if __name__ == "__main__":
    is_test = "--test" in sys.argv
    run_notifications(is_test)

