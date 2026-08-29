"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";

const LANG_STORAGE_KEY = "origin_and_oak_lang";

/* ------------------------------------------------------------------ */
/* English dictionary                                                  */
/* ------------------------------------------------------------------ */

const en: Record<string, string> = {
  // Navbar
  "nav.menu": "Menu",
  "nav.lab": "Barista Lab",
  "nav.rewards": "Rewards",
  "nav.locations": "Locations",
  "nav.brandSub": "Roastery & Cafe",
  "nav.darkMode": "Toggle dark mode",
  "nav.cart": "Open shopping cart with {count} items",
  "nav.mobileMenu": "Toggle mobile menu",

  // Hero
  "hero.badge": "Single-Origin Specialty Roasters • Est. 2018",
  "hero.t1": "Pursuing the art of",
  "hero.t2": "exceptional",
  "hero.t3": "coffee.",
  "hero.desc":
    "From direct-trade Ethiopian natural pour-overs to velvety microfoam flat whites, every cup at Origin & Oak is roasted in micro-batches to highlight terroir and nuance.",
  "hero.cta1": "Explore Our Menu",
  "hero.cta2": "Custom Barista Lab",
  "hero.s1v": "14+",
  "hero.s1l": "Origins Direct",
  "hero.s2v": "48h",
  "hero.s2l": "Roast Freshness",
  "hero.s3v": "98.4%",
  "hero.s3l": "Taste Score",
  "hero.fBadge": "Barista Daily Feature",
  "hero.fName": "Caramel Hazelnut Latte",
  "hero.fDesc":
    "Ristretto double shot over toasted hazelnut reduction, creamy steamed oat milk, and house-churned sea salt caramel drizzle.",
  "hero.fAdd": "Add to Order ({price})",

  // Menu section
  "menu.kicker": "Curated Menu",
  "menu.title": "Handcrafted Offerings",
  "menu.sub":
    "Every beverage is dialed in daily by our lead baristas to preserve delicate tasting notes.",
  "cat.espresso": "Espresso & Milk",
  "cat.cold": "Cold Brew & Nitro",
  "cat.specialty": "Signature Crafts",
  "cat.pastries": "Artisan Bakery",
  "menu.espresso-1.n": "Classic Espresso",
  "menu.espresso-1.d": "Bold, rich, and balanced double shot with dense golden crema",
  "menu.espresso-2.n": "Cappuccino",
  "menu.espresso-2.d": "Equal thirds espresso, steamed whole milk, and microfoam cushion",
  "menu.espresso-3.n": "Caffè Latte",
  "menu.espresso-3.d": "Smooth double shot layered with velvety steamed milk",
  "menu.espresso-4.n": "Flat White",
  "menu.espresso-4.d": "Double ristretto poured delicately with glossy microfoam",
  "menu.espresso-5.n": "Cortado",
  "menu.espresso-5.d": "Equal parts espresso and warm textured milk",
  "menu.espresso-6.n": "Americano",
  "menu.espresso-6.d": "Espresso extracted over hot water for clarity and aroma",
  "menu.cold-1.n": "24-Hour Cold Brew",
  "menu.cold-1.d": "Steeped slowly in chilled filtered water for zero astringency",
  "menu.cold-2.n": "Iced Sea Salt Caramel Latte",
  "menu.cold-2.d": "Espresso, organic milk, and house caramel over crystal ice",
  "menu.cold-3.n": "Kyoto Drip Cold Brew",
  "menu.cold-3.d": "Slow Japanese drip brew showcasing delicate floral tasting notes",
  "menu.cold-4.n": "Nitro Cold Brew",
  "menu.cold-4.d": "Nitrogenated cold brew poured on tap with cascading stout body",
  "menu.spec-1.n": "Lavender Oat Latte",
  "menu.spec-1.d": "Espresso with barista oat milk and organic French lavender syrup",
  "menu.spec-2.n": "Maple Cinnamon Cortado",
  "menu.spec-2.d": "Grade-A Vermont maple, Ceylon cinnamon, and velvety espresso",
  "menu.spec-3.n": "Honey Cardamom Latte",
  "menu.spec-3.d": "Aromatic crushed green cardamom paired with wildflower honey",
  "menu.spec-4.n": "Mocha Royale",
  "menu.spec-4.d": "70% single-origin dark chocolate, espresso, and vanilla cream",
  "menu.pasty-1.n": "Butter Croissant",
  "menu.pasty-1.d": "Flaky, multi-layered French pastry baked fresh every morning",
  "menu.pasty-2.n": "Blueberry Lemon Muffin",
  "menu.pasty-2.d": "Loaded with wild blueberries and Meyer lemon zest sugar topping",
  "menu.pasty-3.n": "Cinnamon Brioche Roll",
  "menu.pasty-3.d": "Warm spiced swirl pastry topped with cream cheese glaze",
  "menu.pasty-4.n": "Almond Twice-Baked Biscotti",
  "menu.pasty-4.d": "Crunchy roasted almond cookie crafted for espresso dipping",
  "tag.houseBlend": "House Blend",
  "tag.popular": "Popular",
  "tag.slowSteeped": "Slow Steeped",
  "tag.sweet": "Sweet",
  "tag.onTap": "On Tap",
  "tag.signature": "Signature",
  "tag.indulgent": "Indulgent",
  "tag.freshBaked": "Fresh Baked",
  "menu.add": "Add",
  "menu.added": "Added",

  // Builder
  "b.kicker": "Barista Lab",
  "b.title": "Build Your Recipe",
  "b.sub": "Customize the foundation, volume, dairy alternatives, and artisan house syrups.",
  "b.step1": "01 / Select Foundation",
  "b.step2": "02 / Size & Volume",
  "b.step3": "03 / Milk & Plant Bases",
  "b.step4": "04 / Syrups & Add-ons",
  "drink.latte": "Caffè Latte",
  "drink.cappuccino": "Cappuccino",
  "drink.americano": "Americano",
  "drink.coldBrew": "Cold Brew",
  "size.small": "Small (8oz)",
  "size.medium": "Medium (12oz)",
  "size.large": "Large (16oz)",
  "b.std": "Std",
  "milk.whole": "Whole Milk",
  "milk.oat": "Barista Oat Milk",
  "milk.almond": "Organic Almond",
  "milk.soy": "Soy Milk",
  "milk.coconut": "Coconut Milk",
  "ex.vanilla": "Madagascar Vanilla",
  "ex.caramel": "Sea Salt Caramel",
  "ex.hazelnut": "Toasted Hazelnut",
  "ex.cinnamon": "Ceylon Cinnamon",
  "ex.whipped": "Whipped Cream",
  "ex.extraShot": "Extra Ristretto Shot",
  "b.total": "Calculated Total",
  "b.add": "Add Custom Drink",
  "b.added": "Added to Order!",
  "b.review": "Review Cart",
  "custom.latte": "Custom Caffè Latte",
  "custom.cappuccino": "Custom Cappuccino",
  "custom.americano": "Custom Americano",
  "custom.coldBrew": "Custom Cold Brew",

  // Cart
  "c.cart": "Your Order",
  "c.checkout": "Quick Checkout",
  "c.confirmed": "Order Confirmed",
  "c.selOne": "1 item selected",
  "c.selMany": "{count} items selected",
  "c.emptyT": "Your cart is empty",
  "c.emptyD": "Handcrafted coffees and fresh bakery items are waiting for you.",
  "c.explore": "Explore Menu",
  "c.remove": "Remove item",
  "c.dec": "Decrease quantity",
  "c.inc": "Increase quantity",
  "c.subtotal": "Subtotal",
  "c.discount": "Reward Discount",
  "c.totalDue": "Total Due",
  "c.proceed": "Proceed to Checkout",
  "c.clear": "Clear order",
  "c.close": "Close cart drawer",
  "c.nameL": "Customer Name",
  "c.nameP": "e.g. Alex Smith",
  "c.nameRequired": "Please enter your name.",
  "c.storeL": "Pickup Roastery",
  "st.opt1": "Downtown Flagship — 123 Main St",
  "st.opt2": "Riverside Roastery — 456 River Rd",
  "st.opt3": "University Commons — 789 College Ave",
  "c.readyInfo": "Ready in approx. 8–12 minutes",
  "c.pickupInfo": "Express Counter pickup ready",
  "c.amountDue": "Total Amount",
  "c.confirm": "Confirm & Place Order ({total})",
  "c.back": "Back to cart review",
  "c.successT": "Order In The Works!",
  "c.thanks": "Thank you, {name}!",
  "c.ref": "Order Ref:",
  "c.ready": "Est. Ready:",
  "c.readyVal": "10 mins",
  "c.pts": "Club Points:",
  "c.ptsVal": "+25 pts",
  "c.done": "Done",

  // Product detail modal
  "p.close": "Close product view",
  "p.dec": "Decrease quantity",
  "p.inc": "Increase quantity",

  // Rewards
  "r.kicker": "Member Perks",
  "r.title": "Brew Club Rewards",
  "r.sub":
    "Earn 10 points per dollar spent. Unlock complimentary drinks, pastries, and roastery merch.",
  "tier.bean": "Bean",
  "tier.brew": "Brew",
  "tier.barista": "Barista",
  "tier.legend": "Legend",
  "r.points": "Reward Points",
  "r.current": "Current: {current}",
  "r.next": "Next: {next}",
  "r.unlock": "{points} pts to unlock",
  "r.perksT": "Available Reward Perks",
  "r.auto": "Auto-applies at checkout",
  "rw.1.n": "Free Single-Origin Espresso Shot",
  "rw.2.n": "Free Daily Bakery Croissant",
  "rw.3.n": "Complimentary Artisan Drink (Any Size)",
  "rw.4.n": "$5 Off Any In-Cafe Order",
  "rw.5.n": "Origin & Oak Canvas Roastery Tote",
  "r.line": "{points} pts • Value ${value}",
  "r.redeem": "Redeem",
  "r.applied": "Applied",
  "r.needs": "{points} pts needed",

  // Stores
  "s.kicker": "Our Roasteries",
  "s.title": "Neighborhood Cafes",
  "s.sub": "Spacious seating, natural light, and freshly roasted espresso in every neighborhood.",
  "st.1.name": "Origin & Oak — Downtown Flagship",
  "st.1.hood": "Downtown Core",
  "st.1.address": "123 Main Street, Suite 100",
  "st.1.hours": "Mon–Fri: 6:00 AM – 9:00 PM | Sat–Sun: 7:00 AM – 8:00 PM",
  "st.2.name": "Origin & Oak — Riverside Roastery",
  "st.2.hood": "Waterfront Arts District",
  "st.2.address": "456 River Road",
  "st.2.hours": "Mon–Fri: 6:30 AM – 8:00 PM | Sat–Sun: 7:30 AM – 7:00 PM",
  "st.3.name": "Origin & Oak — University Commons",
  "st.3.hood": "Campus & Tech District",
  "st.3.address": "789 College Ave",
  "st.3.hours": "Mon–Fri: 5:30 AM – 10:00 PM | Sat–Sun: 6:00 AM – 9:00 PM",
  "feat.driveThru": "Drive-thru",
  "feat.patio": "Outdoor Patio",
  "feat.wifi": "High-speed WiFi",
  "feat.roasteryBar": "Roastery Bar",
  "feat.riverView": "River View",
  "feat.petFriendly": "Pet Friendly Patio",
  "feat.bakery": "Bakery",
  "feat.studyRooms": "Quiet Study Rooms",
  "feat.lateNight": "Late Night Brews",
  "s.selectedRoastery": "Selected Roastery",
  "s.open": "Open",
  "s.selectedTag": "Selected",
  "s.directions": "Get Google Maps Route",

  // Footer
  "f.tagline":
    "Pursuing the art of exceptional single-origin coffee, roasted in small batches with uncompromising craft since 2018.",
  "f.col1": "Offerings",
  "f.col2": "Roastery",
  "f.col3": "Customer Care",
  "fl.espresso": "Espresso Drinks",
  "fl.cold": "Cold Brew",
  "fl.crafts": "Signature Crafts",
  "fl.bakery": "Artisan Bakery",
  "fc.story": "Our Story",
  "fc.sourcing": "Roastery Sourcing",
  "fc.wholesale": "Wholesale & Events",
  "fc.careers": "Careers",
  "fs.contact": "Contact Us",
  "fs.faq": "Order FAQ",
  "fs.perks": "Brew Club Perks",
  "fs.find": "Find a Cafe",
  "f.legal": "© 2026 Origin & Oak Coffee Roasters. All rights reserved.",
  "f.roasted": "Roasted with care",
  "f.location": "in Portland & Austin",
};

/* ------------------------------------------------------------------ */
/* Arabic dictionary                                                   */
/* ------------------------------------------------------------------ */

const ar: Record<string, string> = {
  // Navbar
  "nav.menu": "القائمة",
  "nav.lab": "مختبر الباريستا",
  "nav.rewards": "المكافآت",
  "nav.locations": "الفروع",
  "nav.brandSub": "محمصة ومقهى",
  "nav.darkMode": "تبديل الوضع الداكن",
  "nav.cart": "فتح سلة التسوق — {count} منتج",
  "nav.mobileMenu": "فتح قائمة الجوال",

  // Hero
  "hero.badge": "محمصات متخصصة بحبوب أحادية المنشأ • تأسست عام 2018",
  "hero.t1": "نُتقن فنّ",
  "hero.t2": "القهوة",
  "hero.t3": "الاستثنائية.",
  "hero.desc":
    "من القهوة الإثيوبية المعالجة طبيعياً إلى الفلات وايت الحريرية، كل كوب في أوريجن آند أوك يُحمَّص بدفعات صغيرة لإبراز أصل الحبة ونكهتها الفريدة.",
  "hero.cta1": "تصفح قائمتنا",
  "hero.cta2": "مختبر الباريستا",
  "hero.s1l": "منشأ مباشر",
  "hero.s2l": "طزاجة التحميص",
  "hero.s3l": "تقييم الطعم",
  "hero.fBadge": "مشروب اليوم المميز",
  "hero.fName": "لاتيه الكراميل والبندق",
  "hero.fDesc":
    "جرعة ريستريتو مزدوجة مع خلاصة البندق المحمّص، وحليب الشوفان الكريمي، ورشة كراميل ملح البحر المصنوع في المحل.",
  "hero.fAdd": "أضف إلى الطلب ({price})",

  // Menu section
  "menu.kicker": "قائمة مختارة",
  "menu.title": "إبداعات يدوية",
  "menu.sub": "كل مشروب يضبطه رؤساء الباريستا يومياً للحفاظ على النكهات الدقيقة.",
  "cat.espresso": "إسبريسو بالحليب",
  "cat.cold": "كولد برو ونيترو",
  "cat.specialty": "وصفات مميزة",
  "cat.pastries": "مخبوزات فاخرة",
  "menu.espresso-1.n": "إسبريسو كلاسيكي",
  "menu.espresso-1.d": "جرعة مزدوجة جريئة ومتوازنة بكريمة ذهبية كثيفة",
  "menu.espresso-2.n": "كابتشينو",
  "menu.espresso-2.d": "أثلاث متساوية: إسبريسو، حليب مبخّر، وطبقة رغوة ناعمة",
  "menu.espresso-3.n": "لاتيه",
  "menu.espresso-3.d": "جرعة مزدوجة ناعمة بطبقات من الحليب المخملي المبخّر",
  "menu.espresso-4.n": "فلات وايت",
  "menu.espresso-4.d": "ريستريتو مزدوج يُسكب بعناية مع رغوة حريرية لامعة",
  "menu.espresso-5.n": "كورتادو",
  "menu.espresso-5.d": "أجزاء متساوية من الإسبريسو والحليب الدافئ المُخملي",
  "menu.espresso-6.n": "أمريكانو",
  "menu.espresso-6.d": "إسبريسو يُستخلص فوق ماء ساخن للصفاء والعطر",
  "menu.cold-1.n": "كولد برو ٢٤ ساعة",
  "menu.cold-1.d": "منقوع ببطء في مياه مبررة مصفاة بلا أي حموضة حادة",
  "menu.cold-2.n": "لاتيه مثلج بالكراميل وملح البحر",
  "menu.cold-2.d": "إسبريسو، حليب عضوي، وكراميل المحل فوق ثلج صافٍ",
  "menu.cold-3.n": "كولد برو تنقيط كيوتو",
  "menu.cold-3.d": "تنقيط ياباني بطيء يُبرز نفحات زهرية رقيقة",
  "menu.cold-4.n": "نيترو كولد برو",
  "menu.cold-4.d": "كولد برو مشبع بالنيتروجين يُقدّم من الصنبور بقوام كثيف",
  "menu.spec-1.n": "لاتيه الخزامى بالشوفان",
  "menu.spec-1.d": "إسبريسو مع حليب شوفان باريستا وشراب الخزامى الفرنسية العضوية",
  "menu.spec-2.n": "كورتادو القيقب والقرفة",
  "menu.spec-2.d": "شراب القيقب الفاخر، قرفة سيلان، وإسبريسو مخملي",
  "menu.spec-3.n": "لاتيه العسل والهيل",
  "menu.spec-3.d": "هيل أخضر مطحون عبق مع عسل الأزهار البرية",
  "menu.spec-4.n": "موكا رويال",
  "menu.spec-4.d": "شوكولاتة داكنة ٧٠٪ أحادية المنشأ مع إسبريسو وكريمة الفانيلا",
  "menu.pasty-1.n": "كرواسون بالزبدة",
  "menu.pasty-1.d": "معجنات فرنسية هشّة متعددة الطبقات تُخبز طازجة كل صباح",
  "menu.pasty-2.n": "مافن التوت والليمون",
  "menu.pasty-2.d": "محشو بالتوت البري وقمة سكر قشر الليمون",
  "menu.pasty-3.n": "بريوش بالقرفة",
  "menu.pasty-3.d": "عجينة دافئة متبّلة بالتوابل مع طبقة جبن كريمي",
  "menu.pasty-4.n": "بسكوتي اللوز المخبوز مرتين",
  "menu.pasty-4.d": "بسكويت لوز مقرمش مصنوع خصيصاً لغمس الإسبريسو",
  "tag.houseBlend": "خلطة المحل",
  "tag.popular": "الأكثر طلباً",
  "tag.slowSteeped": "نقوع بطيء",
  "tag.sweet": "حلو",
  "tag.onTap": "من الصنبور",
  "tag.signature": "توقيعنا",
  "tag.indulgent": "فاخر",
  "tag.freshBaked": "طازج يومياً",
  "menu.add": "أضف",
  "menu.added": "تمت الإضافة",

  // Builder
  "b.kicker": "مختبر الباريستا",
  "b.title": "اصنع وصفتك",
  "b.sub": "خصّص الأساس والحجم وبدائل الألبان وشراب المحل الحرفي.",
  "b.step1": "٠١ / اختر الأساس",
  "b.step2": "٠٢ / الحجم",
  "b.step3": "٠٣ / الحليب والبدائل النباتية",
  "b.step4": "٠٤ / الشراب والإضافات",
  "drink.latte": "لاتيه",
  "drink.cappuccino": "كابتشينو",
  "drink.americano": "أمريكانو",
  "drink.coldBrew": "كولد برو",
  "size.small": "صغير (8oz)",
  "size.medium": "وسط (12oz)",
  "size.large": "كبير (16oz)",
  "b.std": "قياسي",
  "milk.whole": "حليب كامل الدسم",
  "milk.oat": "حليب شوفان باريستا",
  "milk.almond": "حليب لوز عضوي",
  "milk.soy": "حليب صويا",
  "milk.coconut": "حليب جوز الهند",
  "ex.vanilla": "فانيلا مدغشقر",
  "ex.caramel": "كراميل ملح البحر",
  "ex.hazelnut": "بندق محمّص",
  "ex.cinnamon": "قرفة سيلان",
  "ex.whipped": "كريمة مخفوقة",
  "ex.extraShot": "جرعة ريستريتو إضافية",
  "b.total": "الإجمالي",
  "b.add": "أضف المشروب",
  "b.added": "أُضيف إلى الطلب!",
  "b.review": "مراجعة السلة",
  "custom.latte": "لاتيه مخصص",
  "custom.cappuccino": "كابتشينو مخصص",
  "custom.americano": "أمريكانو مخصص",
  "custom.coldBrew": "كولد برو مخصص",

  // Cart
  "c.cart": "طلبك",
  "c.checkout": "الدفع السريع",
  "c.confirmed": "تم تأكيد الطلب",
  "c.selOne": "منتج واحد محدد",
  "c.selMany": "{count} منتجات محددة",
  "c.emptyT": "سلتك فارغة",
  "c.emptyD": "قهوة يدوية ومخبوزات طازجة بانتظارك.",
  "c.explore": "تصفح القائمة",
  "c.remove": "إزالة المنتج",
  "c.dec": "إنقاص الكمية",
  "c.inc": "زيادة الكمية",
  "c.subtotal": "المجموع الفرعي",
  "c.discount": "خصم المكافأة",
  "c.totalDue": "الإجمالي المستحق",
  "c.proceed": "المتابعة للدفع",
  "c.clear": "إفراغ الطلب",
  "c.close": "إغلاق السلة",
  "c.nameL": "اسم العميل",
  "c.nameP": "مثال: أحمد محمد",
  "c.nameRequired": "يرجى إدخال اسمك.",
  "c.storeL": "فرض الاستلام",
  "st.opt1": "الفرع الرئيسي وسط المدينة — شارع الرئيسي 123",
  "st.opt2": "محمصة الريف — طريق النهر 456",
  "st.opt3": "المجمع الجامعي — شارع الكلية 789",
  "c.readyInfo": "جاهز خلال ٨–١٢ دقيقة تقريباً",
  "c.pickupInfo": "جاهز عند كاونتر الاستلام السريع",
  "c.amountDue": "المبلغ الإجمالي",
  "c.confirm": "تأكيد وإتمام الطلب ({total})",
  "c.back": "العودة لمراجعة السلة",
  "c.successT": "طلبك قيد التحضير!",
  "c.thanks": "شكراً لك، {name}!",
  "c.ref": "رقم الطلب:",
  "c.ready": "الجاهزية المتوقعة:",
  "c.readyVal": "١٠ دقائق",
  "c.pts": "نقاط النادي:",
  "c.ptsVal": "+٢٥ نقطة",
  "c.done": "تم",

  // Product detail modal
  "p.close": "إغلاق تفاصيل المنتج",
  "p.dec": "إنقاص الكمية",
  "p.inc": "زيادة الكمية",

  // Rewards
  "r.kicker": "مزايا الأعضاء",
  "r.title": "مكافآت نادي التخمير",
  "r.sub": "اكسب ١٠ نقاط عن كل دولار تنفقه. افتح مشروبات ومعجنات وهدايا المحمصة مجاناً.",
  "tier.bean": "حبّة",
  "tier.brew": "تخمير",
  "tier.barista": "باريستا",
  "tier.legend": "أسطورة",
  "r.points": "نقاط المكافآت",
  "r.current": "الحالي: {current}",
  "r.next": "التالي: {next}",
  "r.unlock": "{points} نقطة للفتح",
  "r.perksT": "المكافآت المتاحة",
  "r.auto": "تُطبَّق تلقائياً عند الدفع",
  "rw.1.n": "جرعة إسبريسو مجانية أحادية المنشأ",
  "rw.2.n": "كرواسون مخبوزات مجاني يومياً",
  "rw.3.n": "مشروب حرفي مجاني (بأي حجم)",
  "rw.4.n": "خصم ٥$ على أي طلب داخل المقهى",
  "rw.5.n": "حقيبة محمصة أوريجن آند أوك القماشية",
  "r.line": "{points} نقطة • بقيمة ${value}",
  "r.redeem": "استبدل",
  "r.applied": "مُطبَّقة",
  "r.needs": "{points} نقطة متبقية",

  // Stores
  "s.kicker": "محمصاتنا",
  "s.title": "مقاهي الحي",
  "s.sub": "جلوس واسع، إضاءة طبيعية، وإسبريسو محمّص طازجاً في كل حي.",
  "st.1.name": "أوريجن آند أوك — فرع وسط المدينة الرئيسي",
  "st.1.hood": "قلب المدينة",
  "st.1.address": "شارع الرئيسي 123، جناح 100",
  "st.1.hours": "الاثنين–الجمعة: 6 ص – 9 م | السبت–الأحد: 7 ص – 8 م",
  "st.2.name": "أوريجن آند أوك — محمصة الواجهة المائية",
  "st.2.hood": "حي الفنون الواجهة المائية",
  "st.2.address": "طريق النهر 456",
  "st.2.hours": "الاثنين–الجمعة: 6:30 ص – 8 م | السبت–الأحد: 7:30 ص – 7 م",
  "st.3.name": "أوريجن آند أوك — مجمع الجامعة والتقنية",
  "st.3.hood": "حي الجامعة والتقنية",
  "st.3.address": "شارع الكلية 789",
  "st.3.hours": "الاثنين–الجمعة: 5:30 ص – 10 م | السبت–الأحد: 6 ص – 9 م",
  "feat.driveThru": "سيارات",
  "feat.patio": "مجلس خارجي",
  "feat.wifi": "واي فاي فائق السرعة",
  "feat.roasteryBar": "بار المحمصة",
  "feat.riverView": "إطلالة نهرية",
  "feat.petFriendly": "مسموح بالحيوانات",
  "feat.bakery": "مخبز",
  "feat.studyRooms": "غرف دراسة هادئة",
  "feat.lateNight": "مفتوح حتى وقت متأخر",
  "s.selectedRoastery": "المحمصة المحددة",
  "s.open": "مفتوح",
  "s.selectedTag": "محدد",
  "s.directions": "احصل على المسار عبر خرائط جوجل",

  // Footer
  "f.tagline":
    "نتقن فن القهوة الاستثنائية أحادية المنشأ، محمّصة بدفعات صغيرة بحرفية لا تقبل المساومة منذ 2018.",
  "f.col1": "مشروباتنا",
  "f.col2": "المحمصة",
  "f.col3": "خدمة العملاء",
  "fl.espresso": "مشروبات الإسبريسو",
  "fl.cold": "الكولد برو",
  "fl.crafts": "الوصفات المميزة",
  "fl.bakery": "المخبوزات الفاخرة",
  "fc.story": "قصتنا",
  "fc.sourcing": "مصادر التحميص",
  "fc.wholesale": "الجملة والفعاليات",
  "fc.careers": "الوظائف",
  "fs.contact": "اتصل بنا",
  "fs.faq": "أسئلة الطلب الشائعة",
  "fs.perks": "مزايا نادي التخمير",
  "fs.find": "اعثر على مقهى",
  "f.legal": "© 2026 محمصة أوريجن آند أوك. جميع الحقوق محفوظة.",
  "f.roasted": "محمّصة بعناية",
  "f.location": "في بورتلاند وأوستن",
};

const dict: Record<Lang, Record<string, string>> = { en, ar };

/* ------------------------------------------------------------------ */
/* External store (mirrors theme-context pattern)                      */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Lang {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(LANG_STORAGE_KEY) === "ar" ? "ar" : "en";
}

function getServerSnapshot(): Lang {
  return "en";
}

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(LANG_STORAGE_KEY, next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    notifyListeners();
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  const { lang, setLang } = ctx;

  const t = useCallback(
    (key: string) => dict[lang][key] ?? dict.en[key] ?? key,
    [lang]
  );

  const tf = useCallback(
    (key: string, vars: Record<string, string | number>) =>
      (dict[lang][key] ?? dict.en[key] ?? key).replace(
        /\{(\w+)\}/g,
        (_, k) => String(vars[k] ?? "")
      ),
    [lang]
  );

  return useMemo(
    () => ({
      lang,
      setLang,
      t,
      tf,
      isRtl: lang === "ar",
      dir: (lang === "ar" ? "rtl" : "ltr") as "rtl" | "ltr",
    }),
    [lang, setLang, t, tf]
  );
}
