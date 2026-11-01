# 🎨 Dora Cars Animation & UI Enhancement Suite

مجموعة متكاملة من مكتبات وتقنيات التحريك الحديثة تم دمجها مباشرة في سورس المنصة للاستخدام الفوري:

---

## 1. 🪐 Antigravity Canvas Animation (`AntigravityCanvas`)
مأخوذة من [davidpelayo/antigravity-animation](https://github.com/davidpelayo/antigravity-animation).
محاكاة فيزيائية عالية الأداء تعتمد على تسريع كرت الشاشة (GPU Acceleration) عبر الـ Offscreen Canvas Sprites والجاذبية المعكوسة (الأشكال الهندسية العائمة مثل تصاميم Google المتطورة)، مع تفاعل مباشر مع مؤشر الماوس واللمس (Repel Physics).

### طريقة الاستخدام:
```jsx
import { AntigravityCanvas } from '@/components/animations';

export default function MyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* خلفية فيزيائية متحركة */}
      <AntigravityCanvas 
        particleCount={45} 
        gravity={-0.05} // سالب للطفو لأعلى، موجب للهبوط
        colors={['#2563EB', '#38BDF8', '#10B981', '#F59E0B']}
        shape="mixed" // 'mixed' | 'circle' | 'square' | 'triangle'
      />

      <div className="relative z-10 p-8">
        {/* محتوى الصفحة */}
      </div>
    </div>
  );
}
```

---

## 2. ⚡ Animista On-Demand CSS Animations
مستخرجة من [Animista.net](https://animista.net) ومربوطة تلقائياً في `index.css`.
يمكنك استخدام أي فئة من الفئات التالية مباشرة على أي عنصر في التطبيق:

### أهم الكلاسات الجاهزة:
- **الدخول والتكبير (Scale & Entrances):**
  - `animate-scale-up-center`: تكبير وانبثاق ناعم من المركز.
  - `animate-scale-up-top`: تكبير متدفق من الأعلى.
  - `animate-scale-in-hor-center`: فتح أفقي سريع.
- **الانزلاق والظهور (Slides & Fades):**
  - `animate-slide-in-bottom`: انزلاق من الأسفل للأعلى مع تلاشي.
  - `animate-slide-in-top`: انزلاق من الأعلى للأسفل.
  - `animate-slide-in-right`: انزلاق من اليمين (ممتاز لـ RTL والقوائم الجانبية).
  - `animate-slide-in-left`: انزلاق من اليسار.
  - `animate-fade-in-fwd`: ظهور ثلاثي الأبعاد مع عمق.
- **التدوير والقلب (Rotate & Flip):**
  - `animate-rotate-scale-up`: دوران 360 درجة مع تكبير.
  - `animate-rotate-90`: دوران ربع دورة (للأزرار والأسهم).
  - `animate-flip-scale-up-hor`: قلب أفقي 3D مع تكبير.
  - `animate-swing-in-top`: أرجحة جميلة من الأعلى للأسفل.
- **لفت الانتباه والتفاعل (Attention & Feedback):**
  - `animate-pulsate-bck`: نبض خفيف مستمر (للإشعارات والتنبيهات).
  - `animate-wobble-bottom`: تمايل وتأرجح جانبي.
  - `animate-jello`: ارتداد مرن يشبه الجيلي عند الضغط أو التفاعل.
- **الظلال والإضاءة (Shadow & Glow):**
  - `animate-shadow-drop-center`: إسقاط ظل ناعم مشع بلون مميز.
  - `animate-shadow-pop-tr`: ظل ثلاثي الأبعاد بارز.
- **النصوص والعناوين (Text Effects):**
  - `animate-tracking-in`: تباعد نصوص فخم للعناوين الرئيسية.
  - `animate-text-focus-in`: انتقال النصوص من البلور (Blur) إلى الوضوح التام.

---

## 3. 💎 React Bits Pro Components
مكونات تفاعلية مستوحاة من مكتبة [React Bits Pro](https://pro.reactbits.dev):

### 1. `SpotlightCard`:
بطاقة ذكية تتبع مؤشر الماوس بإضاءة دائرية مخصصة وحواف تتوهج بالاقتراب.
```jsx
import { SpotlightCard } from '@/components/animations';

<SpotlightCard spotlightColor="rgba(37, 99, 235, 0.15)">
  <h3>عنوان البطاقة</h3>
  <p>محتوى يتفاعل مع الماوس بنعومة فائقة</p>
</SpotlightCard>
```

### 2. `ShinyText`:
نص فاخر يمر عليه شريط ضوء لامع متحرك (Metallic Light Pass).
```jsx
import { ShinyText } from '@/components/animations';

<ShinyText text="بوابة الأنظمة الإدارية" speed={3.5} className="text-xl text-blue-600" />
```

### 3. `DecryptedText`:
نص بأسلوب التشفير السايبر والمصفوفة (Matrix Effect) يفك شفرته تلقائياً عند المرور أو الظهور.
```jsx
import { DecryptedText } from '@/components/animations';

<DecryptedText text="نظام آمن ومحمي بالكامل" animateOn="hover" className="text-emerald-600 font-mono" />
```

### 4. `TiltedCard`:
تأثير البطاقة ثلاثية الأبعاد (3D Perspective Tilt Card) التي تميل وتنعكس عليها الإضاءة وفق حركة الماوس.
```jsx
import { TiltedCard } from '@/components/animations';

<TiltedCard maxRotation={15} scale={1.03}>
  <div className="p-6">محتوى ثلاثي الأبعاد</div>
</TiltedCard>
```

### 5. `MagnetButton`:
زر ذكي ينجذب فيزيائياً نحو مؤشر الماوس عندما يقترب منه.
```jsx
import { MagnetButton } from '@/components/animations';

<MagnetButton className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold">
  ابدأ الآن
</MagnetButton>
```

### 6. `CountUp`:
عداد أرقام ناعم ومتدفق مع Easing لانتقال أرقام المؤشرات والـ KPIs والمالية.
```jsx
import { CountUp } from '@/components/animations';

<CountUp to={128500} prefix="SAR " duration={1.5} />
```

---

## 4. 📁 الملفات الأصلية المستقلة (Standalone Files)
تم حفظ ملفات الـ HTML الأصلية الخاصة بـ Antigravity داخل:
`src/components/animations/vendor/antigravity/`
- `antigravity-basic.html`
- `antigravity-pattern.html`
- `README.md`
- `LICENSE.md`
