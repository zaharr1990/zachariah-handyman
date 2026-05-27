import json
import urllib.request
import urllib.parse
import sys
import datetime
import os

# Configuration path
CONFIG_PATH = r"C:\antigravety\projects\business_manager\config.json"

# AD templates (Locksmithing & Handyman only - no electrical)
ad_options = {
    1: """🏠 *אפשרות 1: פתרון כולל לבית (מטריית שירותים)*

הכתובת שלכם לכל תיקון, התקנה ונעילה בבית! 🛠️🔑

נמאס לכם לחפש בעל מקצוע שונה לכל בעיה קטנה בבית, או לחכות שעות למישהו שיגיע מרחוק ויגבה מחיר מופקע?

ZA - פתרונות ושירותי בית מביא לכם את השקט הנפשי שאתם צריכים, כאן בירוחם והסביבה.

אנו מרכזים עבורכם את כל פתרונות התחזוקה והנעילה לבית:
🔑 נעילה ואבטחה: פריצה שקטה, החלפת צילינדרים איכותיים (רב-בריח, מולטילוק ועוד), ותיקון מנגנונים.
🛠️ תיקונים והתקנות (הנדימן): תליית טלוויזיות, הרכבת רהיטים, מדפים, ותיקונים כלליים.

מתחייב לעבודה מקצועית, פילוס מדויק, שמירה על סדר וניקיון מופתי בסיום העבודה, ומחיר הוגן ושקוף!""",
    
    2: """🔒 *אפשרות 2: שומרים על בטיחות ותקינות הבית*

שומרים על הבית בטוח ותקין - ZA פתרונות ושירותי בית 🔒🛠️

הקיץ מתקרב וזה הזמן לוודא שמערכות הנעילה והדלתות בבית שלכם בטוחות לחלוטין ותקינות.

אנו מציעים שירות מקיף לבדיקה, תיקון ושדרוג מערכות הנעילה והתחזוקה בבית:
* בטיחות נעילה: שדרוג לצילינדרים מוגני פריצה בדלתות הכניסה.
* תיקון דלתות: פתרון לדלתות גוררות, מפתחות קשים לסיבוב או מנגנונים תקועים.
* תחזוקה כללית: פתרון בעיות בלאי בבית, חיזוק צירים, ותיקונים קטנים.

שירות מקומי מהיר בירוחם והסביבה. אמינות ללא פשרות ומחירים הגונים לתושבי האזור.""",
    
    3: """🖥️ *אפשרות 3: פרויקטים, הרכבות ותלייה*

קניתם רהיט או טלוויזיה חדשה? תשאירו את העבודה הקשה לנו! 🖥️🛋️

עברתם דירה? רוצים לחדש את מראה הבית? אל תבזבזו את סוף השבוע שלכם על מדידות, הוראות הרכבה מסובכות או פחד שהקיר לא יחזיק.

ZA - פתרונות ושירותי בית מגיע אליכם לעשות סדר:
* הרכבה מקצועית ומהירה של ארונות, שידות ורהיטים מכל הסוגים (איקאה ועוד).
* תליית מסכי טלוויזיה בזווית מושלמת (כולל קירות גבס ובטון).
* התקנת מדפים, וילונות, תמונות ואביזרי אמבטיה בפילוס מושלם.
* עבודות נעילה ותיקונים נלווים לפי הצורך.

מתחייב לעבודה סופר-נקייה (לא משאירים אבק מאחורינו!) ושירות הוגן ואדיב."""
}

# Publishing strategy schedule
weekly_schedule = {
    # 0 = Monday, 6 = Sunday
    6: { # Sunday
        "time": "18:00",
        "ad_id": 3,
        "rationale": "יום ראשון בערב הוא הזמן שבו אנשים חוזרים לשבוע העבודה ומבינים שאין להם פנאי להרכיב את הרהיטים או לתלות את הטלוויזיה שהם קנו בשבוע שעבר. הפרסום פוגש אותם בדיוק כשהם מתכננים את השבוע."
    },
    1: { # Tuesday (Python weekday for Tuesday is 1 if Monday is 0)
        "time": "11:00",
        "ad_id": 2,
        "rationale": "אמצע השבוע הוא זמן מצוין לפנות לבעלי בתים ועסקים לגבי שדרוגי אבטחה ותיקון דלתות תקועות. אנשים פעילים בנייד בשעות הבוקר המאוחרות ונוח להם לתאם עבודה לימים הקרובים."
    },
    3: { # Thursday (Python weekday for Thursday is 3 if Monday is 0)
        "time": "19:00",
        "ad_id": 1,
        "rationale": "יום חמישי בערב הוא זמן ההיערכות לסוף השבוע. אנשים עוברים על רשימת התיקונים המצטברת בבית ורוצים 'לסגור' אותם עם בעל מקצוע לקראת שישי או תחילת שבוע הבא."
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

def run_notifications(is_test=False):
    config = load_config()
    if not config or config.get("telegram_bot_token") == "YOUR_BOT_TOKEN_HERE":
        print("Telegram bot is not configured yet in config.json.")
        return
        
    token = config.get("telegram_bot_token")
    chat_id = config.get("telegram_chat_id")
    
    if is_test:
        test_msg = "🔌 *חיבור בוט טלגרם ZA פתרונות ושירותי בית עבר בהצלחה!* \n\nמעכשיו תקבל כאן הנחיות פרסום ופוסטים מוכנים להעתקה."
        send_telegram_message(token, chat_id, test_msg)
        print("Test message sent successfully.")
        return

    # Check today's weekday
    today = datetime.datetime.today().weekday()
    if today not in weekly_schedule:
        print("No scheduled posts for today.")
        return
        
    sched = weekly_schedule[today]
    ad_text = ad_options[sched["ad_id"]]
    
    msg = f"""📢 *התראת פרסום שבועי - ZA פתרונות ושירותי בית*

⏰ *מתי לפרסם:* היום בשעה **{sched['time']}**

💡 *למה היום ובשעה זו?* 
{sched['rationale']}

🖼️ *הנחיות לתמונה:* פרסם פוסט זה יחד עם תמונת המותג הכהה **ad_banner_generic.png** השמורה בתיקיית העסק שלך!

---
📝 *טקסט לפוסט (העתק והדבק):*

{ad_text}

📱 [אל תשכח להוסיף את מספר הטלפון שלך כאן בסוף!]"""

    send_telegram_message(token, chat_id, msg)
    print("Scheduled marketing advice sent to Telegram.")

if __name__ == "__main__":
    is_test = "--test" in sys.argv
    run_notifications(is_test)
