import { Blob, Bottle, Heart, Jar, Lipstick, Sparkle, Tube } from '../ui/Art'
import './landing.css'

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M8 4.5V8l2.2 1.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
)
const CashIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden><rect x="1" y="2" width="16" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><circle cx="8" cy="6.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M4.3 12.4c1-1.4 2.2-2 3.7-2s2.7.6 3.7 2" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
)
const ScanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M1.5 5V2.5a1 1 0 0 1 1-1H5M11 1.5h2.5a1 1 0 0 1 1 1V5M14.5 11v2.5a1 1 0 0 1-1 1H11M5 14.5H2.5a1 1 0 0 1-1-1V11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8" cy="8" r="2.5" fill="currentColor" /></svg>
)

export default function Landing() {
  return (
    <div className="landing">
      <nav className="nav">
        <a href="#/" className="logo"><Blob size={28} mood="happy" /> mira</a>
        <a href="#/chat" className="nav-cta">Text Mira</a>
      </nav>

      <section className="hero">
        <div className="hero-blob pink"><Blob size={130} mood="happy" color="#F59AC9" /><Heart style={{ position: 'absolute', right: -18, top: -24 }} size={40} /></div>
        <div className="hero-blob green"><Blob size={130} mood="squint" color="#9BE15D" /><Sparkle style={{ position: 'absolute', right: -12, top: -30 }} size={38} /><Sparkle style={{ position: 'absolute', right: 18, top: -6, opacity: 0.6 }} size={16} /></div>
        <h1>Meet Mira</h1>
        <p className="sub">Your free AI beauty &amp; style assistant, right in iMessage</p>
        <a href="#/chat" className="cta">Text Mira</a>

        <div className="stickers">
          <figure className="sticker s1">
            <Bottle tint="#EEF3FF" label="BHA 2%" className="obj" />
            <span className="pill-tag" style={{ ['--r' as string]: '-4deg', top: '38%', left: '-30%' }}><ScanIcon /> skin score 86</span>
          </figure>
          <figure className="sticker s2">
            <Lipstick color="#A24A57" className="obj" />
            <span className="pill-tag" style={{ ['--r' as string]: '3deg', top: '62%', left: '-20%' }}><ClockIcon /> tried on 2 min ago</span>
          </figure>
          <figure className="sticker s3">
            <img src="/samples/garment-full.png" alt="" className="obj photo-obj" />
            <span className="pill-tag" style={{ ['--r' as string]: '-6deg', top: '70%', left: '6%' }}><UserIcon /> shared by amy</span>
          </figure>
          <figure className="sticker s4">
            <Tube tint="#E8F6EA" label="CICA" className="obj" />
            <span className="pill-tag" style={{ ['--r' as string]: '-5deg', top: '14%', left: '-36%' }}><CashIcon /> mira saved you $30</span>
          </figure>
          <figure className="sticker s5">
            <Jar tint="#FFF3DD" label="CERAMIDE" className="obj" />
            <span className="pill-tag" style={{ ['--r' as string]: '4deg', top: '72%', left: '4%' }}><ClockIcon /> bought 2 days ago</span>
          </figure>
        </div>
      </section>

      <section className="statement">
        <p>
          Mira is an AI shopping assistant <span className="emo">🛍️</span> that reads your skin, tries everything on you <span className="emo">💄</span> and checks every store <span className="emo">🛒</span> so you buy the right thing for less.
        </p>
        <div className="note">
          <span>Finds what works for <em>your skin</em></span>
          <svg width="50" height="40" viewBox="0 0 50 40" aria-hidden><path d="M44 4 C30 6 14 14 10 34 M10 34 L4 24 M10 34 L18 27" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <div className="deck">
          <div className="dcard side left">
            <div className="dtitle">Nude Petal Matte</div>
            <div className="dsub">◎ Overview</div>
            <div className="ghost" /><div className="ghost short" /><div className="ghost" />
            <div className="dart"><Lipstick color="#C0816F" style={{ height: 120 }} /><Lipstick color="#A24A57" style={{ height: 120 }} /><Lipstick color="#7A1F3D" style={{ height: 120 }} /></div>
          </div>
          <div className="dcard main">
            <div className="dtitle">Clear Days 2% BHA Serum</div>
            <div className="dsub">◎ Overview <span className="chev">›</span></div>
            <div className="dpills">
              <span><i className="o" />Mixed for dry skin</span>
              <span><i className="g" />Calms breakouts in 2 weeks</span>
              <span><i className="r" />Pills under SPF</span>
            </div>
            <div className="dsrc"><b /><b /><b /> 6 sources · matched to your skin score</div>
            <div className="dart big"><Bottle tint="#EEF3FF" label="BHA 2%" style={{ height: 230 }} /></div>
          </div>
          <div className="dcard side right">
            <div className="dtitle">Faux Fur Crop Jacket</div>
            <div className="dsub">◎ Overview</div>
            <div className="ghost" /><div className="ghost short" /><div className="ghost" />
            <div className="dart"><img src="/samples/garment-full.png" alt="" /></div>
          </div>
        </div>
      </section>

      <section className="compare-sec">
        <h2>Shopping, before and after Mira</h2>
        <div className="vs">
          <div className="col without">
            <h3>Without Mira</h3>
            <ul>
              <li>Guessing your skin type from a quiz</li>
              <li>Buying a serum that breaks you out</li>
              <li>Lipstick that looked better on the model</li>
              <li>Paying full price at the first store</li>
              <li>Returns because the jacket didn't suit you</li>
            </ul>
          </div>
          <div className="col with">
            <h3>With Mira</h3>
            <ul>
              <li><b>Skin read in 10 seconds</b> from one selfie</li>
              <li><b>Picks matched</b> to your 3 weakest scores</li>
              <li><b>Tried on your face</b> before you pay</li>
              <li><b>Best price</b> across every store, $30 saved</li>
              <li><b>Full look on your body</b> with AI clothes</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="where">
        <h2>Lives where you already text</h2>
        <div className="where-grid">
          <div className="wcard">
            <div className="wmini">
              <div className="b me">is this serum ok for me?</div>
              <div className="b mira">your pores score 61, so yes 🫶 it's $5 cheaper at Shelf</div>
            </div>
            <h3>iMessage</h3>
            <p>Text Mira a selfie or a product. No app, no account, answers in seconds.</p>
          </div>
          <div className="wcard">
            <div className="wmini center"><Blob size={70} mood="wink" color="#9BE15D" /></div>
            <h3>Skin AI</h3>
            <p>YouCam AI Skin Analysis scores 8 concerns and maps exactly where they show up.</p>
          </div>
          <div className="wcard">
            <div className="wmini center"><Lipstick color="#C8183A" style={{ height: 80 }} /><img src="/samples/garment-full.png" alt="" style={{ height: 80, borderRadius: 10 }} /></div>
            <h3>Virtual try-on</h3>
            <p>YouCam Makeup VTO and AI Clothes put the lipstick and the outfit on you, not a model.</p>
          </div>
        </div>
      </section>

      <section className="learns">
        <h2>Learns how you shop.</h2>
        <p className="lead">Every scan teaches Mira what works on you. It never forgets your skin.</p>
        <div className="cloud">
          {['skin type', 'undertone', 'pores on the T zone', 'fragrance free', 'your lip shade', 'skin age', 'acne safe', 'budget per item', 'trusted sellers', 'favourite brands', 'size', 'style', 'ingredients to avoid', 'score history'].map((t, i) => (
            <span key={t} className={`ctag c${i % 4}`}>{t}</span>
          ))}
        </div>
      </section>

      <section className="final">
        <Blob size={90} mood="happy" color="#F59AC9" />
        <h2>Your skin, your face, your price.</h2>
        <a href="#/chat" className="cta">Text Mira</a>
      </section>

      <footer className="foot">
        <span>Built for the YouCam API Skin AI &amp; eCommerce VTO Hackathon</span>
        <span>Powered by YouCam AI Skin Analysis, Makeup VTO and AI Clothes</span>
      </footer>
    </div>
  )
}
