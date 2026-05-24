import React, { useState, useEffect, useCallback } from "react";

// ============================================================
// STORAGE HELPERS
// ============================================================
async function dbGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function dbSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); return true; }
  catch { return false; }
}

// ============================================================
// CONSTANTS
// ============================================================
const RENKLER = {
  bg: "#fdf6ec", bg2: "#fde8d8", kirmizi: "#c0533a",
  koyu: "#7c3328", acik: "#b5704a", cok_acik: "#f5d0bb",
  beyaz: "white", yesil: "#4caf50", sari: "#fef9c3",
};

const inputSt = {
  padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8,
  fontSize: 13, background: "#fffaf7", color: "#7c3328",
  fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box",
};

const kardSt = {
  background: "white", borderRadius: 16, padding: "16px",
  boxShadow: "0 2px 12px rgba(124,51,40,0.10)", marginBottom: 12,
};

const formatTL = (v) => {
  const num = Math.round(v || 0);
  return "₺" + num.toLocaleString("en-US");
};
const bugun = () => new Date().toLocaleDateString("tr-TR");
const bugunISO = () => new Date().toISOString().split("T")[0];

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [sayfa, setSayfa] = useState("dashboard");
  const [yuklendi, setYuklendi] = useState(false);

  // Global veri state'leri
  const [musteriler, setMusteriler] = useState([]);
  const [siparisler, setSiparisler] = useState([]);
  const [urunler, setUrunler] = useState([]);
  const [stoklar, setStoklar] = useState([]);
  const [teklifler, setTeklifler] = useState([]);

  // Yükle
  useEffect(() => {
    (async () => {
      const m = await dbGet("musteriler"); if (m) setMusteriler(m);
      const s = await dbGet("siparisler"); if (s) setSiparisler(s);
      const u = await dbGet("urunler");   if (u) setUrunler(u);
      const st = await dbGet("stoklar");  if (st) setStoklar(st);
      const tk = await dbGet("teklifler"); if (tk) setTeklifler(tk);
      setYuklendi(true);
    })();
  }, []);

  // Kaydet
  useEffect(() => { if (yuklendi) dbSet("musteriler", musteriler); }, [musteriler, yuklendi]);
  useEffect(() => { if (yuklendi) dbSet("siparisler", siparisler); }, [siparisler, yuklendi]);
  useEffect(() => { if (yuklendi) dbSet("urunler", urunler); }, [urunler, yuklendi]);
  useEffect(() => { if (yuklendi) dbSet("stoklar", stoklar); }, [stoklar, yuklendi]);
  useEffect(() => { if (yuklendi) dbSet("teklifler", teklifler); }, [teklifler, yuklendi]);

  if (!yuklendi) return (
    <div style={{ minHeight: "100vh", background: RENKLER.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", color: RENKLER.koyu }}>
      🎂 Yükleniyor...
    </div>
  );

  const sayfalar = [
    { key: "dashboard", label: "📊", title: "Dashboard" },
    { key: "urunler",   label: "🧁", title: "Ürünler" },
    { key: "musteriler",label: "👥", title: "Müşteriler" },
    { key: "siparisler",label: "🚗", title: "Siparişler" },
    { key: "maliyet",    label: "💰", title: "Maliyet" },
    { key: "stok",       label: "📦", title: "Stok" },
    { key: "teklif",     label: "💌", title: "Teklif" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf6ec 0%, #fde8d8 100%)", fontFamily: "'Georgia', serif", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: "white", padding: "14px 16px 10px", boxShadow: "0 2px 8px rgba(124,51,40,0.08)", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ fontSize: 18, fontWeight: "bold", color: RENKLER.koyu }}>🎂 Pasta Yönetim Paneli</div>
        <div style={{ fontSize: 11, color: RENKLER.acik, marginTop: 2 }}>{bugun()}</div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 0" }}>
        {sayfa === "dashboard"  && <Dashboard siparisler={siparisler} musteriler={musteriler} urunler={urunler} setSayfa={setSayfa} stoklar={stoklar} />}
        {sayfa === "urunler"    && <Urunler urunler={urunler} setUrunler={setUrunler} />}
        {sayfa === "musteriler" && <Musteriler musteriler={musteriler} setMusteriler={setMusteriler} siparisler={siparisler} />}
        {sayfa === "siparisler" && <Siparisler siparisler={siparisler} setSiparisler={setSiparisler} musteriler={musteriler} urunler={urunler} />}
        {sayfa === "maliyet" && <MaliyetHesaplayici onUrunKaydet={(u) => { setUrunler(p => [...p, { ...u, id: Date.now(), olusturma: bugunISO() }]); setSayfa("urunler"); }} stoklar={stoklar} setStoklar={setStoklar} setTeklifOlustur={(t) => { setTeklifler(p => [...p, { ...t, id: Date.now(), durum: "Taslak" }]); setSayfa("teklif"); }} />}
        {sayfa === "stok" && <StokYonetimi stoklar={stoklar} setStoklar={setStoklar} />}
        {sayfa === "teklif" && <TeklifYonetimi teklifler={teklifler} setTeklifler={setTeklifler} musteriler={musteriler} />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1.5px solid #f5d0bb", display: "flex", zIndex: 200 }}>
        {sayfalar.map(s => (
          <button key={s.key} onClick={() => setSayfa(s.key)} style={{
            flex: 1, padding: "10px 4px 8px", border: "none", background: "transparent", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <div style={{ fontSize: 20 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: sayfa === s.key ? RENKLER.kirmizi : RENKLER.acik, fontWeight: sayfa === s.key ? "bold" : "normal", fontFamily: "'Georgia', serif" }}>{s.title}</div>
            {sayfa === s.key && <div style={{ width: 20, height: 2, background: RENKLER.kirmizi, borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ siparisler, musteriler, urunler, setSayfa, stoklar }) {
  const bugunStr = bugunISO();
  const bugunSiparisler = siparisler.filter(s => s.tarih === bugunStr);
  const bekleyenler = siparisler.filter(s => s.durum === "Bekliyor" || s.durum === "Hazırlanıyor");
  const buAySiparisler = siparisler.filter(s => s.tarih?.startsWith(new Date().toISOString().slice(0,7)));
  const toplamCiro = buAySiparisler.reduce((a, s) => a + (s.fiyat || 0), 0);
  const teslimEdilen = siparisler.filter(s => s.durum === "Teslim Edildi");

  return (
    <div>
      {/* Özet kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Bu Ay Ciro", value: formatTL(toplamCiro), icon: "💰", color: "#c0533a" },
          { label: "Bekleyen Sipariş", value: bekleyenler.length, icon: "⏳", color: "#e07b39" },
          { label: "Toplam Müşteri", value: musteriler.length, icon: "👥", color: "#7c3328" },
          { label: "Teslim Edildi", value: teslimEdilen.length, icon: "✅", color: "#4caf50" },
        ].map(k => (
          <div key={k.label} style={{ ...kardSt, marginBottom: 0, textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: RENKLER.acik, marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Bugünkü siparişler */}
      <div style={kardSt}>
        <div style={{ fontSize: 14, fontWeight: "bold", color: RENKLER.koyu, marginBottom: 10 }}>📅 Bugünün Siparişleri</div>
        {bugunSiparisler.length === 0 ? (
          <div style={{ color: RENKLER.acik, fontSize: 13, textAlign: "center", padding: "12px 0" }}>Bugün sipariş yok</div>
        ) : bugunSiparisler.map(s => (
          <SiparisSatir key={s.id} siparis={s} />
        ))}
      </div>

      {/* Bekleyenler */}
      <div style={kardSt}>
        <div style={{ fontSize: 14, fontWeight: "bold", color: RENKLER.koyu, marginBottom: 10 }}>⏳ Bekleyen & Hazırlananlar</div>
        {bekleyenler.length === 0 ? (
          <div style={{ color: RENKLER.acik, fontSize: 13, textAlign: "center", padding: "12px 0" }}>Bekleyen sipariş yok 🎉</div>
        ) : bekleyenler.slice(0, 5).map(s => (
          <SiparisSatir key={s.id} siparis={s} />
        ))}
      </div>

      {/* Kritik Stok Uyarıları */}
      {(() => {
        const kritik = stoklar.filter(s => s.miktar <= s.minMiktar);
        if (kritik.length === 0) return null;
        return (
          <div style={{ ...kardSt, border: "1.5px solid #f5a623", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#e07b39", marginBottom: 8 }}>⚠️ Kritik Stok ({kritik.length})</div>
            {kritik.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #fde8d8", fontSize: 13 }}>
                <span style={{ color: "#7c3328" }}>{s.ad}</span>
                <span style={{ color: "#e07b39", fontWeight: "bold" }}>{s.miktar} {s.birim} kaldı</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Hızlı erişim */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Yeni Sipariş", icon: "➕", sayfa: "siparisler" },
          { label: "Yeni Müşteri", icon: "👤", sayfa: "musteriler" },
        ].map(b => (
          <button key={b.label} onClick={() => setSayfa(b.sayfa)} style={{
            padding: "14px", background: RENKLER.kirmizi, color: "white", border: "none",
            borderRadius: 12, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>{b.icon} {b.label}</button>
        ))}
      </div>
    </div>
  );
}

function SiparisSatir({ siparis }) {
  const renkMap = { "Bekliyor": "#e07b39", "Hazırlanıyor": "#c0533a", "Teslim Edildi": "#4caf50", "İptal": "#999" };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #fde8d8" }}>
      <div>
        <div style={{ fontSize: 13, color: RENKLER.koyu, fontWeight: "bold" }}>{siparis.musteriAd}</div>
        <div style={{ fontSize: 11, color: RENKLER.acik }}>{siparis.urunAd} • {siparis.kisiSayisi} kişi</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: "bold", color: RENKLER.kirmizi }}>{formatTL(siparis.fiyat)}</div>
        <div style={{ fontSize: 10, color: renkMap[siparis.durum] || RENKLER.acik, fontWeight: "bold" }}>{siparis.durum}</div>
      </div>
    </div>
  );
}

// ============================================================
// ÜRÜNLER
// ============================================================
function Urunler({ urunler, setUrunler }) {
  const [form, setForm] = useState(false);
  const [yeni, setYeni] = useState({ ad: "", aciklama: "", maliyet: "", fiyat: "", kategori: "Yaş Pasta" });

  const kaydet = () => {
    if (!yeni.ad || !yeni.fiyat) return;
    const urun = { ...yeni, id: Date.now(), olusturma: bugunISO(), maliyet: parseFloat(yeni.maliyet) || 0, fiyat: parseFloat(yeni.fiyat) || 0 };
    setUrunler(p => [...p, urun]);
    setYeni({ ad: "", aciklama: "", maliyet: "", fiyat: "", kategori: "Yaş Pasta" });
    setForm(false);
  };

  const sil = (id) => setUrunler(p => p.filter(u => u.id !== id));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: "bold", color: RENKLER.koyu }}>🧁 Ürün Kataloğu</div>
        <button onClick={() => setForm(p => !p)} style={{ padding: "8px 16px", background: RENKLER.kirmizi, color: "white", border: "none", borderRadius: 20, fontSize: 13, fontFamily: "'Georgia', serif", cursor: "pointer" }}>
          {form ? "✕ İptal" : "+ Ürün Ekle"}
        </button>
      </div>

      {form && (
        <div style={{ ...kardSt, border: "1.5px solid #f5d0bb" }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: RENKLER.koyu, marginBottom: 10 }}>Yeni Ürün</div>
          <input placeholder="Ürün adı *" value={yeni.ad} onChange={e => setYeni(p => ({ ...p, ad: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />
          <input placeholder="Açıklama" value={yeni.aciklama} onChange={e => setYeni(p => ({ ...p, aciklama: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />
          <select value={yeni.kategori} onChange={e => setYeni(p => ({ ...p, kategori: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8, cursor: "pointer" }}>
            {["Yaş Pasta", "Kuru Pasta", "Cupcake", "Tart", "Diğer"].map(k => <option key={k}>{k}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: RENKLER.acik, marginBottom: 3 }}>Maliyet (₺)</div>
              <input type="number" placeholder="0" value={yeni.maliyet} onChange={e => setYeni(p => ({ ...p, maliyet: e.target.value }))} style={hInputSt} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: RENKLER.acik, marginBottom: 3 }}>Satış Fiyatı (₺) *</div>
              <input type="number" placeholder="0" value={yeni.fiyat} onChange={e => setYeni(p => ({ ...p, fiyat: e.target.value }))} style={hInputSt} />
            </div>
          </div>
          <button onClick={kaydet} style={{ width: "100%", padding: "11px", background: RENKLER.kirmizi, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif", cursor: "pointer" }}>
            Kaydet
          </button>
        </div>
      )}

      {urunler.length === 0 && !form && (
        <div style={{ ...kardSt, textAlign: "center", padding: "32px", color: RENKLER.acik }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🧁</div>
          <div>Henüz ürün eklenmedi</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Maliyet hesaplayıcıdan ürün ekleyebilirsiniz</div>
        </div>
      )}

      {urunler.map(u => (
        <div key={u.id} style={kardSt}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: RENKLER.koyu }}>{u.ad}</div>
              <div style={{ fontSize: 11, color: RENKLER.acik, marginTop: 2 }}>{u.kategori} • {u.aciklama}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: RENKLER.acik }}>Maliyet</div>
                  <div style={{ fontSize: 13, color: RENKLER.koyu }}>{formatTL(u.maliyet)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: RENKLER.acik }}>Satış</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: RENKLER.kirmizi }}>{formatTL(u.fiyat)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: RENKLER.acik }}>Kar</div>
                  <div style={{ fontSize: 13, color: "#4caf50" }}>{u.maliyet > 0 ? `%${Math.round((u.fiyat - u.maliyet) / u.fiyat * 100)}` : "-"}</div>
                </div>
              </div>
            </div>
            <button onClick={() => sil(u.id)} style={{ padding: "4px 10px", background: "#fde8d8", color: RENKLER.kirmizi, border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Sil</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MÜŞTERİLER
// ============================================================
function Musteriler({ musteriler, setMusteriler, siparisler }) {
  const [form, setForm] = useState(false);
  const [ara, setAra] = useState("");
  const [yeni, setYeni] = useState({ ad: "", telefon: "", adres: "", notlar: "", yeniMusteri: true });

  const kaydet = () => {
    if (!yeni.ad) return;
    setMusteriler(p => [...p, { ...yeni, id: Date.now(), kayitTarih: bugunISO(), siparisSayisi: 0 }]);
    setYeni({ ad: "", telefon: "", adres: "", notlar: "", yeniMusteri: true });
    setForm(false);
  };

  const sil = (id) => setMusteriler(p => p.filter(m => m.id !== id));

  const filtrelenmis = musteriler.filter(m =>
    m.ad.toLowerCase().includes(ara.toLowerCase()) ||
    (m.telefon || "").includes(ara)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: "bold", color: RENKLER.koyu }}>👥 Müşteriler</div>
        <button onClick={() => setForm(p => !p)} style={{ padding: "8px 16px", background: RENKLER.kirmizi, color: "white", border: "none", borderRadius: 20, fontSize: 13, fontFamily: "'Georgia', serif", cursor: "pointer" }}>
          {form ? "✕ İptal" : "+ Müşteri Ekle"}
        </button>
      </div>

      <input placeholder="🔍 İsim veya telefon ara..." value={ara} onChange={e => setAra(e.target.value)}
        style={{ ...hInputSt, width: "100%", marginBottom: 12 }} />

      {form && (
        <div style={{ ...kardSt, border: "1.5px solid #f5d0bb" }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: RENKLER.koyu, marginBottom: 10 }}>Yeni Müşteri</div>
          <input placeholder="Ad Soyad *" value={yeni.ad} onChange={e => setYeni(p => ({ ...p, ad: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />
          <input placeholder="Telefon" value={yeni.telefon} onChange={e => setYeni(p => ({ ...p, telefon: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />
          <input placeholder="Adres" value={yeni.adres} onChange={e => setYeni(p => ({ ...p, adres: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />
          <textarea placeholder="Notlar (tercihler, alerji vb.)" value={yeni.notlar} onChange={e => setYeni(p => ({ ...p, notlar: e.target.value }))}
            rows={3} style={{ ...hInputSt, width: "100%", marginBottom: 8, resize: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <button onClick={() => setYeni(p => ({ ...p, yeniMusteri: !p.yeniMusteri }))} style={{
              padding: "6px 14px", border: "none", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif",
              background: yeni.yeniMusteri ? RENKLER.kirmizi : "#fdf6ec",
              color: yeni.yeniMusteri ? "white" : RENKLER.koyu,
            }}>🎁 Yeni Müşteri İndirimi</button>
          </div>
          <button onClick={kaydet} style={{ width: "100%", padding: "11px", background: RENKLER.kirmizi, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif", cursor: "pointer" }}>
            Kaydet
          </button>
        </div>
      )}

      {filtrelenmis.length === 0 && !form && (
        <div style={{ ...kardSt, textAlign: "center", padding: "32px", color: RENKLER.acik }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div>{ara ? "Müşteri bulunamadı" : "Henüz müşteri eklenmedi"}</div>
        </div>
      )}

      {filtrelenmis.map(m => {
        const mSiparisler = siparisler.filter(s => s.musteriId === m.id);
        const toplamHarcama = mSiparisler.reduce((a, s) => a + (s.fiyat || 0), 0);
        return (
          <div key={m.id} style={kardSt}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: RENKLER.koyu }}>{m.ad}</div>
                  {m.yeniMusteri && mSiparisler.length === 0 && (
                    <span style={{ fontSize: 10, background: "#fef9c3", color: "#7c5c00", padding: "2px 6px", borderRadius: 8 }}>🎁 Yeni</span>
                  )}
                </div>
                {m.telefon && <div style={{ fontSize: 12, color: RENKLER.acik, marginTop: 2 }}>📞 {m.telefon}</div>}
                {m.adres && <div style={{ fontSize: 12, color: RENKLER.acik, marginTop: 1 }}>📍 {m.adres}</div>}
                {m.notlar && <div style={{ fontSize: 11, color: "#999", marginTop: 4, fontStyle: "italic" }}>{m.notlar}</div>}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <div><div style={{ fontSize: 10, color: RENKLER.acik }}>Sipariş</div><div style={{ fontSize: 13, color: RENKLER.koyu }}>{mSiparisler.length}</div></div>
                  <div><div style={{ fontSize: 10, color: RENKLER.acik }}>Toplam</div><div style={{ fontSize: 13, fontWeight: "bold", color: RENKLER.kirmizi }}>{formatTL(toplamHarcama)}</div></div>
                  <div><div style={{ fontSize: 10, color: RENKLER.acik }}>Kayıt</div><div style={{ fontSize: 12, color: RENKLER.acik }}>{m.kayitTarih}</div></div>
                </div>
              </div>
              <button onClick={() => sil(m.id)} style={{ padding: "4px 10px", background: "#fde8d8", color: RENKLER.kirmizi, border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Sil</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// SİPARİŞLER
// ============================================================
const DURUMLAR = ["Bekliyor", "Hazırlanıyor", "Hazır", "Teslim Edildi", "İptal"];
const DURUM_RENKLER = { "Bekliyor": "#e07b39", "Hazırlanıyor": "#c0533a", "Hazır": "#2196f3", "Teslim Edildi": "#4caf50", "İptal": "#999" };

function Siparisler({ siparisler, setSiparisler, musteriler, urunler }) {
  const [form, setForm] = useState(false);
  const [filtre, setFiltre] = useState("Hepsi");
  const [detay, setDetay] = useState(null);
  const [yeni, setYeni] = useState({ musteriId: "", musteriAd: "", urunAd: "", kisiSayisi: 14, fiyat: "", tarih: bugunISO(), teslimatTarih: "", teslimatAdresi: "", teslimatVar: true, notlar: "", durum: "Bekliyor" });

  const kaydet = () => {
    if (!yeni.musteriAd || !yeni.urunAd || !yeni.fiyat) return;
    setSiparisler(p => [...p, { ...yeni, id: Date.now(), fiyat: parseFloat(yeni.fiyat) || 0, kisiSayisi: parseInt(yeni.kisiSayisi) || 14 }]);
    setYeni({ musteriId: "", musteriAd: "", urunAd: "", kisiSayisi: 14, fiyat: "", tarih: bugunISO(), teslimatTarih: "", teslimatAdresi: "", teslimatVar: true, notlar: "", durum: "Bekliyor" });
    setForm(false);
  };

  const durumGuncelle = (id, durum) => setSiparisler(p => p.map(s => s.id === id ? { ...s, durum } : s));
  const sil = (id) => { setSiparisler(p => p.filter(s => s.id !== id)); setDetay(null); };

  const filtreli = filtre === "Hepsi" ? siparisler : siparisler.filter(s => s.durum === filtre);
  const sirali = [...filtreli].sort((a, b) => (b.tarih || "").localeCompare(a.tarih || ""));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: "bold", color: RENKLER.koyu }}>🚗 Siparişler</div>
        <button onClick={() => setForm(p => !p)} style={{ padding: "8px 16px", background: RENKLER.kirmizi, color: "white", border: "none", borderRadius: 20, fontSize: 13, fontFamily: "'Georgia', serif", cursor: "pointer" }}>
          {form ? "✕ İptal" : "+ Sipariş Ekle"}
        </button>
      </div>

      {/* Filtre */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {["Hepsi", ...DURUMLAR].map(d => (
          <button key={d} onClick={() => setFiltre(d)} style={{
            padding: "5px 12px", border: "none", borderRadius: 16, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif",
            background: filtre === d ? RENKLER.kirmizi : "white",
            color: filtre === d ? "white" : RENKLER.acik,
            boxShadow: "0 1px 4px rgba(124,51,40,0.1)",
          }}>{d} {d !== "Hepsi" && `(${siparisler.filter(s => s.durum === d).length})`}</button>
        ))}
      </div>

      {/* Yeni sipariş formu */}
      {form && (
        <div style={{ ...kardSt, border: "1.5px solid #f5d0bb" }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: RENKLER.koyu, marginBottom: 10 }}>Yeni Sipariş</div>

          {/* Müşteri seç veya yaz */}
          {musteriler.length > 0 ? (
            <select value={yeni.musteriId} onChange={e => {
              const m = musteriler.find(m => m.id === parseInt(e.target.value));
              setYeni(p => ({ ...p, musteriId: e.target.value, musteriAd: m ? m.ad : "", teslimatAdresi: m ? (m.adres || "") : "" }));
            }} style={{ ...hInputSt, width: "100%", marginBottom: 8, cursor: "pointer" }}>
              <option value="">Müşteri seç...</option>
              {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad} {m.telefon ? `- ${m.telefon}` : ""}</option>)}
            </select>
          ) : null}
          <input placeholder="Müşteri adı *" value={yeni.musteriAd} onChange={e => setYeni(p => ({ ...p, musteriAd: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />

          {/* Ürün seç veya yaz */}
          {urunler.length > 0 ? (
            <select value={yeni.urunAd} onChange={e => {
              const u = urunler.find(u => u.ad === e.target.value);
              setYeni(p => ({ ...p, urunAd: e.target.value, fiyat: u ? u.fiyat : p.fiyat }));
            }} style={{ ...hInputSt, width: "100%", marginBottom: 8, cursor: "pointer" }}>
              <option value="">Ürün seç...</option>
              {urunler.map(u => <option key={u.id} value={u.ad}>{u.ad} — {formatTL(u.fiyat)}</option>)}
            </select>
          ) : null}
          <input placeholder="Ürün adı *" value={yeni.urunAd} onChange={e => setYeni(p => ({ ...p, urunAd: e.target.value }))}
            style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: RENKLER.acik, marginBottom: 3 }}>Kişi Sayısı</div>
              <input type="number" value={yeni.kisiSayisi} onChange={e => setYeni(p => ({ ...p, kisiSayisi: e.target.value }))} style={hInputSt} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: RENKLER.acik, marginBottom: 3 }}>Satış Fiyatı (₺) *</div>
              <input type="number" value={yeni.fiyat} onChange={e => setYeni(p => ({ ...p, fiyat: e.target.value }))} style={hInputSt} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: RENKLER.acik, marginBottom: 3 }}>Sipariş Tarihi</div>
              <input type="date" value={yeni.tarih} onChange={e => setYeni(p => ({ ...p, tarih: e.target.value }))} style={hInputSt} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: RENKLER.acik, marginBottom: 3 }}>Teslim Tarihi</div>
              <input type="date" value={yeni.teslimatTarih} onChange={e => setYeni(p => ({ ...p, teslimatTarih: e.target.value }))} style={hInputSt} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <button onClick={() => setYeni(p => ({ ...p, teslimatVar: !p.teslimatVar }))} style={{
              padding: "6px 14px", border: "none", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif",
              background: yeni.teslimatVar ? RENKLER.kirmizi : "#fdf6ec", color: yeni.teslimatVar ? "white" : RENKLER.koyu,
            }}>🚗 {yeni.teslimatVar ? "Teslimat Var" : "Müşteri Alıyor"}</button>
          </div>

          {yeni.teslimatVar && (
            <input placeholder="Teslimat adresi" value={yeni.teslimatAdresi} onChange={e => setYeni(p => ({ ...p, teslimatAdresi: e.target.value }))}
              style={{ ...hInputSt, width: "100%", marginBottom: 8 }} />
          )}

          <textarea placeholder="Notlar (özel istek, tasarım detayı vb.)" value={yeni.notlar} onChange={e => setYeni(p => ({ ...p, notlar: e.target.value }))}
            rows={2} style={{ ...hInputSt, width: "100%", marginBottom: 10, resize: "none" }} />

          <button onClick={kaydet} style={{ width: "100%", padding: "11px", background: RENKLER.kirmizi, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif", cursor: "pointer" }}>
            Siparişi Kaydet
          </button>
        </div>
      )}

      {/* Detay modal */}
      {detay && (() => {
        const s = siparisler.find(x => x.id === detay);
        if (!s) return null;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
            <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: 20, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: "bold", color: RENKLER.koyu }}>Sipariş Detayı</div>
                <button onClick={() => setDetay(null)} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: RENKLER.acik }}>✕</button>
              </div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: RENKLER.koyu, marginBottom: 4 }}>{s.musteriAd}</div>
              <div style={{ fontSize: 13, color: RENKLER.acik, marginBottom: 12 }}>{s.urunAd} • {s.kisiSayisi} kişi • {formatTL(s.fiyat)}</div>
              {s.tarih && <div style={{ fontSize: 12, color: RENKLER.acik, marginBottom: 4 }}>📅 Sipariş: {s.tarih}</div>}
              {s.teslimatTarih && <div style={{ fontSize: 12, color: RENKLER.acik, marginBottom: 4 }}>🚗 Teslim: {s.teslimatTarih}</div>}
              {s.teslimatAdresi && <div style={{ fontSize: 12, color: RENKLER.acik, marginBottom: 4 }}>📍 {s.teslimatAdresi}</div>}
              {s.notlar && <div style={{ fontSize: 12, color: "#666", marginBottom: 12, fontStyle: "italic" }}>{s.notlar}</div>}
              <div style={{ fontSize: 13, fontWeight: "bold", color: RENKLER.koyu, marginBottom: 8 }}>Durum Güncelle:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {DURUMLAR.map(d => (
                  <button key={d} onClick={() => durumGuncelle(s.id, d)} style={{
                    padding: "7px 14px", border: "none", borderRadius: 16, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif",
                    background: s.durum === d ? DURUM_RENKLER[d] : "#fdf6ec",
                    color: s.durum === d ? "white" : RENKLER.koyu, fontWeight: s.durum === d ? "bold" : "normal",
                  }}>{d}</button>
                ))}
              </div>
              <button onClick={() => sil(s.id)} style={{ width: "100%", padding: "10px", background: "#fde8d8", color: RENKLER.kirmizi, border: "none", borderRadius: 10, fontSize: 13, fontFamily: "'Georgia', serif", cursor: "pointer" }}>
                Siparişi Sil
              </button>
            </div>
          </div>
        );
      })()}

      {sirali.length === 0 && !form && (
        <div style={{ ...kardSt, textAlign: "center", padding: "32px", color: RENKLER.acik }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚗</div>
          <div>{filtre === "Hepsi" ? "Henüz sipariş yok" : `${filtre} durumunda sipariş yok`}</div>
        </div>
      )}

      {sirali.map(s => (
        <div key={s.id} style={{ ...kardSt, cursor: "pointer" }} onClick={() => setDetay(s.id)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: RENKLER.koyu }}>{s.musteriAd}</div>
              <div style={{ fontSize: 12, color: RENKLER.acik, marginTop: 2 }}>{s.urunAd} • {s.kisiSayisi} kişi</div>
              {s.teslimatTarih && <div style={{ fontSize: 11, color: RENKLER.acik, marginTop: 2 }}>🚗 {s.teslimatTarih}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: RENKLER.kirmizi }}>{formatTL(s.fiyat)}</div>
              <div style={{ fontSize: 11, color: DURUM_RENKLER[s.durum], fontWeight: "bold", marginTop: 3 }}>{s.durum}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MALİYET HESAPLAYICI
// ============================================================


const hInputSt = {
  padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8,
  fontSize: 13, background: "#fffaf7", color: "#7c3328",
  fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box",
};
const hRowSt = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  background: "#fdf6ec", borderRadius: 10, padding: "10px 14px",
  marginTop: 10, fontSize: 14, color: "#7c3328",
};

const SUSLEME_INIT = {
  muz:   { ad: "Muz",   miktar: 0.5, birim: "kg", birimFiyat: 140 },
  cilek: { ad: "Çilek", miktar: 0.5, birim: "kg", birimFiyat: 200 },
  draje: { ad: "Draje", miktar: 0.2, birim: "kg", birimFiyat: 800 },
};

const FIYAT_DB = [
  { key: "hindistan cevizi", fiyat: 120, birim: "kg" },
  { key: "misir nisastasi", fiyat: 30, birim: "kg" },
  { key: "nisasta", fiyat: 30, birim: "kg" },
  { key: "sut kremasi", fiyat: 180, birim: "lt" },
  { key: "krem santi", fiyat: 50, birim: "adet" },
  { key: "krema", fiyat: 180, birim: "lt" },
  { key: "pudra sekeri", fiyat: 60, birim: "kg" },
  { key: "tereyagi", fiyat: 450, birim: "kg" },
  { key: "margarin", fiyat: 200, birim: "kg" },
  { key: "kabartma tozu", fiyat: 5, birim: "adet" },
  { key: "vanilya", fiyat: 5, birim: "adet" },
  { key: "cikolata", fiyat: 500, birim: "kg" },
  { key: "kakao", fiyat: 300, birim: "kg" },
  { key: "findik", fiyat: 500, birim: "kg" },
  { key: "ceviz", fiyat: 400, birim: "kg" },
  { key: "cilek", fiyat: 180, birim: "kg" },
  { key: "muz", fiyat: 60, birim: "kg" },
  { key: "limon", fiyat: 20, birim: "adet" },
  { key: "portakal", fiyat: 25, birim: "adet" },
  { key: "yogurt", fiyat: 80, birim: "kg" },
  { key: "peynir", fiyat: 400, birim: "kg" },
  { key: "jelatin", fiyat: 10, birim: "adet" },
  { key: "yumurta", fiyat: 8, birim: "adet" },
  { key: "sut", fiyat: 40, birim: "lt" },
  { key: "seker", fiyat: 50, birim: "kg" },
  { key: "un", fiyat: 40, birim: "kg" },
  { key: "tuz", fiyat: 5, birim: "adet" },
  { key: "beyaz cikolata", fiyat: 450, birim: "kg" },
  { key: "siviyag", fiyat: 120, birim: "lt" },
  { key: "sivi yag", fiyat: 120, birim: "lt" },
  { key: "bugday nisastasi", fiyat: 30, birim: "kg" },
  { key: "bitter cikolata", fiyat: 500, birim: "kg" },
  { key: "toz santi", fiyat: 200, birim: "kg" },
  { key: "sivi santi", fiyat: 160, birim: "lt" },
  { key: "limon suyu", fiyat: 40, birim: "lt" },
  { key: "sivi krema", fiyat: 180, birim: "lt" },
];

function tr(str) {
  return (str || "").toLowerCase()
    .replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u")
    .replace(/ö/g,"o").replace(/ı/g,"i").replace(/ç/g,"c")
    .replace(/İ/g,"i").replace(/Ş/g,"s").replace(/Ğ/g,"g")
    .replace(/Ü/g,"u").replace(/Ö/g,"o").replace(/Ç/g,"c");
}

function birimFiyatBul(ad) {
  const norm = tr(ad);
  for (const item of FIYAT_DB) {
    if (norm.includes(item.key)) return item.fiyat;
  }
  return 50;
}

// Başlık/bölüm satırı mı?
function baslikMi(satir) {
  const norm = tr(satir.trim());
  // Sayı içermiyorsa ve bilinen anahtar kelimeler varsa başlık say
  const baslikler = ["icin", "malzemeler", "pandispanya", "krema", "kaplamai", "kaplamak", "sos", "hamur", "tarif", "yapilis", "hazirlanis"];
  const sayiVar = /\d/.test(satir);
  if (satir.trim().endsWith(":") || satir.trim().endsWith(";")) return true;
  if (!sayiVar) {
    for (const b of baslikler) {
      if (norm.includes(b) && satir.trim().length > 15) return true;
    }
  }
  return false;
}

function birlestir(liste) {
  // kg↔lt karşılıklı sıvılar (1kg ≈ 1lt varsayımı)
  const sivilar = ["sut", "krema", "yag", "limon"];
  function ltye(m) {
    if (m.birim === "kg" && sivilar.some(s => tr(m.ad).includes(s))) {
      return { ...m, birim: "lt" };
    }
    return m;
  }
  const normalize = liste.map(ltye);
  const map = new Map();
  for (const m of normalize) {
    const anahtar = tr(m.ad).replace(/\s+/g, " ").trim();
    if (map.has(anahtar)) {
      const mevcut = map.get(anahtar);
      if (mevcut.birim === m.birim) {
        map.set(anahtar, { ...mevcut, miktar: parseFloat((parseFloat(mevcut.miktar) + parseFloat(m.miktar)).toFixed(4)) });
      } else {
        map.set(anahtar + "_2", m);
      }
    } else {
      map.set(anahtar, m);
    }
  }
  return Array.from(map.values());
}

function parseSatir(satir, olcek) {
  satir = satir.trim();
  if (!satir || baslikMi(satir)) return null;

  const norm = tr(satir);

  // Sayıyı bul — "yarım" = 0.5, "1,5" = 1.5
  let miktar = 1;
  if (/yarım/i.test(satir)) {
    miktar = 0.5;
  } else {
    const m = satir.match(/(\d+[.,]?\d*)/);
    if (m) miktar = parseFloat(m[1].replace(",", "."));
  }

  // Birim tespiti ve kg/lt'ye dönüşüm
  let miktarSon = miktar;
  let birimSon = "adet";

  const bardakMi = /su\s+barda[gğ]ı|bardak/i.test(satir);
  const cayBardakMi = /çay\s+barda[gğ]ı/i.test(satir);
  const yemekKasikMi = /tepeleme\s+yemek\s+ka[sş]ı[gğ]ı|yemek\s+ka[sş]ı[gğ]ı/i.test(satir);
  const cayKasikMi = /çay\s+ka[sş]ı[gğ]ı/i.test(satir);

  if (cayBardakMi) {
    // çay bardağı ~100ml
    if (norm.includes("sut") || norm.includes("su") || norm.includes("krema")) { miktarSon = miktar * 0.1; birimSon = "lt"; }
    else { miktarSon = miktar * 0.08; birimSon = "kg"; }
  } else if (bardakMi) {
    if (norm.includes("un") || norm.includes("nisasta")) { miktarSon = miktar * 0.12; birimSon = "kg"; }
    else if (norm.includes("seker")) { miktarSon = miktar * 0.18; birimSon = "kg"; }
    else if (norm.includes("sut") || norm.includes("su") || norm.includes("krema")) { miktarSon = miktar * 0.2; birimSon = "lt"; }
    else { miktarSon = miktar * 0.15; birimSon = "kg"; }
  } else if (yemekKasikMi) {
    if (norm.includes("un") || norm.includes("nisasta")) { miktarSon = miktar * 0.008; birimSon = "kg"; }
    else if (norm.includes("seker") || norm.includes("kakao")) { miktarSon = miktar * 0.012; birimSon = "kg"; }
    else if (norm.includes("tereyag") || norm.includes("margarin")) { miktarSon = miktar * 0.014; birimSon = "kg"; }
    else if (norm.includes("sut") || norm.includes("krema")) { miktarSon = miktar * 0.015; birimSon = "lt"; }
    else { miktarSon = miktar * 0.01; birimSon = "kg"; }
  } else if (cayKasikMi) {
    miktarSon = miktar * 0.003; birimSon = "kg";
  } else if (/\btutam\b/i.test(satir)) {
    miktarSon = 0.002; birimSon = "kg";
  } else if (/\bkg\b/i.test(satir)) {
    miktarSon = miktar; birimSon = "kg";
  } else if (/\bgr?\b|\bgram\b/i.test(satir)) {
    miktarSon = miktar / 1000; birimSon = "kg";
  } else if (/\blt\b|\blitre\b/i.test(satir)) {
    miktarSon = miktar; birimSon = "lt";
  } else if (/\bml\b/i.test(satir)) {
    miktarSon = miktar / 1000; birimSon = "lt";
  } else if (/paket|po[sş]et/i.test(satir)) {
    miktarSon = miktar; birimSon = "adet";
  } else if (/\badet\b|\btane\b/i.test(satir)) {
    miktarSon = miktar; birimSon = "adet";
  } else {
    // Sayı var ama birim yok → büyük ihtimalle adet (yumurta vb)
    miktarSon = miktar; birimSon = "adet";
  }

  // Malzeme adını temizle
  let ad = satir
    .replace(/yarım\s*/i, "")
    .replace(/^\d+[.,]?\d*\s*/, "")
    .replace(/tepeleme\s+yemek\s+kaşığı/gi, "")
    .replace(/yemek\s+kaşığı/gi, "")
    .replace(/çay\s+kaşığı/gi, "")
    .replace(/çay\s+bardağı/gi, "")
    .replace(/su\s+bardağı/gi, "")
    .replace(/bardak/gi, "")
    .replace(/paket/gi, "").replace(/poşet/gi, "")
    .replace(/adet/gi, "").replace(/tane/gi, "")
    .replace(/tutam/gi, "")
    // Başta kalan birim öneklerini temizle (örn. "gr ", "ml ", "kg ", "lt ")
    .replace(/^(gr|ml|kg|lt|g)\s+/i, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Paket halinde satılan malzemeleri düzelt (gr → adet)
  const paketMalzemeler = ["kabartma tozu", "vanilya", "jelatin", "krem santi"];
  const adNorm2 = tr(ad);
  if (birimSon === "kg" && paketMalzemeler.some(p => adNorm2.includes(p))) {
    miktarSon = Math.round(miktarSon * 1000 / 5) || 1; // gr → paket adedi
    birimSon = "adet";
  }

  if (!ad || ad.length < 2) return null;
  ad = ad.charAt(0).toUpperCase() + ad.slice(1).toLowerCase();

  return {
    id: Date.now() + Math.random(),
    ad,
    miktar: parseFloat((miktarSon * olcek).toFixed(4)),
    birim: birimSon,
    birimFiyat: birimFiyatBul(ad),
  };
}

function MaliyetHesaplayici({ onUrunKaydet, stoklar, setStoklar, setTeklifOlustur }) {
  const [malzemeler, setMalzemeler] = useState([]);
  const [yeni, setYeni] = useState({ ad: "", birimFiyat: "", miktar: "", birim: "adet" });
  const [saatUcreti, setSaatUcreti] = useState(300); // TL/saat
  // Kademeli saat: 1-20→6, 21-40→10, 41-60→14, 61-80→18, 81-100→22
  const [ozellesturme, setOzellesturme] = useState({
    baski: { aktif: false, fiyat: 250, label: "🖨️ Baskı", aciklama: "Pasta üzeri baskı" },
    figur: { aktif: false, fiyat: 250, adet: 1, label: "🧸 Özel Figür", aciklama: "Adet başı fiyat (işçilik dahil)" },
    ozelTasarim: { aktif: false, fiyat: 300, extraSaat: 2, label: "🎨 Özel Tasarım", aciklama: "Şeker hamuru vb. + ekstra süre" },
  });
  const [ambalajMum, setAmbalajMum] = useState(100);
  const [teslimat, setTeslimat] = useState(300);
  const [teslimatAktif, setTeslimatAktif] = useState(true); // sabit TL
  const [genel, setGenel] = useState(20);
  const [karOrani, setKarOrani] = useState(30);
  const [kdvOrani, setKdvOrani] = useState(10);
  const [yeniMusteriIndirim, setYeniMusteriIndirim] = useState(10);
  const [yeniMusteriAktif, setYeniMusteriAktif] = useState(true);
  const [kisiSayisi, setKisiSayisi] = useState(16);
  const [tab, setTab] = useState("sonuc");
  const [eklendi, setEklendi] = useState(false);
  const [birimFiyatAcik, setBirimFiyatAcik] = useState(false);
  const [tasarimAcik, setTasarimAcik] = useState(false);
  const [fiyatlandirmaAcik, setFiyatlandirmaAcik] = useState(false);
  const [fiyatTablosuAcik, setFiyatTablosuAcik] = useState(false);
  const [pasaSekil, setPastaSekil] = useState("yuvarlak");
  const [pastaKat, setPastaKat] = useState(1);
  const [pastaBoyut, setPastaBoyut] = useState({ cap: 18, en: 20, boy: 30 });
  const [pastaRenk, setPastaRenk] = useState("krem");
  const [bazGorsel, setBazGorsel] = useState(null);
  const [susleme, setSusleme] = useState({ muz: true, cilek: false, draje: true });
  const [suslemeDetay, setSuslemeDetay] = useState(SUSLEME_INIT);
  const [tarif, setTarif] = useState(`5 adet yumurta
120 gr şeker
50 gr sıvı yağ
50 gr süt
135 gr un
5 gr kabartma tozu
5 gr vanilya
10 gr limon suyu
500 ml süt
50 gr un
50 gr buğday nişastası
1 adet yumurta
200 gr şeker
15 gr kakao
1 paket vanilya
80 gr bitter çikolata
450 ml sıvı krema
400 gr toz şanti
80 gr beyaz çikolata`);
  const [tarifKisi, setTarifKisi] = useState(16);
  const [hata, setHata] = useState("");

  // SUSLEME_DB bileşen dışına taşındı (sabit referans)

  const malzemeMaliyeti = malzemeler.reduce(
    (acc, m) => acc + (parseFloat(m.miktar) || 0) * (parseFloat(m.birimFiyat) || 0), 0
  );
  // Not: suslemeMaliyeti aşağıda hesaplanır, malzemeToplamı UI'da birleşik gösterilir
  const kademeliSaat = Math.round(3 + kisiSayisi * 0.2);
  const ozellesturmeSaat = (ozellesturme.ozelTasarim.aktif ? ozellesturme.ozelTasarim.extraSaat : 0);
  const toplamSaat = kademeliSaat + ozellesturmeSaat;
  const emekMaliyeti = toplamSaat * (parseFloat(saatUcreti) || 0);
  const ozellesturmeMaliyeti =
    (ozellesturme.baski.aktif ? (parseFloat(ozellesturme.baski.fiyat) || 0) : 0) +
    (ozellesturme.figur.aktif ? (parseFloat(ozellesturme.figur.fiyat) || 0) * (parseInt(ozellesturme.figur.adet) || 1) : 0) +
    (ozellesturme.ozelTasarim.aktif ? (parseFloat(ozellesturme.ozelTasarim.fiyat) || 0) : 0);
  const suslemeOlcek = tarifKisi > 0 ? kisiSayisi / tarifKisi : 1;
  const suslemeMaliyeti = Object.entries(susleme)
    .filter(([_, secili]) => secili)
    .reduce((acc, [key]) => {
      const s = suslemeDetay[key];
      return acc + s.miktar * suslemeOlcek * s.birimFiyat;
    }, 0);
  const ambalajMaliyeti = parseFloat(ambalajMum) || 0;
  const genelMaliyet = malzemeMaliyeti * ((parseFloat(genel) || 0) / 100);
  const teslimatMaliyeti = teslimatAktif ? (parseFloat(teslimat) || 0) : 0;
  const toplamMaliyet = malzemeMaliyeti + suslemeMaliyeti + emekMaliyeti + ozellesturmeMaliyeti + ambalajMaliyeti + teslimatMaliyeti + genelMaliyet;
  const kisiBasiMaliyet = kisiSayisi > 0 ? toplamMaliyet / kisiSayisi : 0;
  const kisiBasiKar = kisiBasiMaliyet * ((parseFloat(karOrani) || 0) / 100);
  const kisiBasiSatisFiyati = kisiBasiMaliyet + kisiBasiKar;
  const toplamSatisFiyati = kisiBasiSatisFiyati * kisiSayisi;
  const indirimMiktari = yeniMusteriAktif ? toplamSatisFiyati * ((parseFloat(yeniMusteriIndirim) || 0) / 100) : 0;
  const indirimliSatisFiyati = toplamSatisFiyati - indirimMiktari;
  const kdvMiktari = indirimliSatisFiyati * ((parseFloat(kdvOrani) || 0) / 100);
  const kdvDahilFiyat = indirimliSatisFiyati + kdvMiktari;
  const kisiBasiKdvDahil = kisiSayisi > 0 ? kdvDahilFiyat / kisiSayisi : 0;

  const updateMalzeme = (id, field, value) =>
    setMalzemeler((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  const removeMalzeme = (id) =>
    setMalzemeler((prev) => prev.filter((m) => m.id !== id));
  const addMalzeme = () => {
    if (!yeni.ad || !yeni.birimFiyat) return;
    setMalzemeler((prev) => [...prev, { id: Date.now(), ad: yeni.ad, birimFiyat: parseFloat(yeni.birimFiyat), miktar: parseFloat(yeni.miktar) || 0, birim: yeni.birim }]);
    setYeni({ ad: "", birimFiyat: "", miktar: "", birim: "adet" });
    setEklendi(true);
    setTimeout(() => setEklendi(false), 1500);
  };

  const tarifAnaliz = () => {
    setHata("");
    const olcek = tarifKisi > 0 ? kisiSayisi / tarifKisi : 1;
    const satirlar = tarif.split("\n");
    const sonuc = birlestir(satirlar.map(s => parseSatir(s, olcek)).filter(Boolean));
    if (sonuc.length === 0) { setHata("Malzeme bulunamadı. Her malzemeyi ayrı satıra yaz."); return; }
    setMalzemeler(sonuc);
    setTab("malzeme");
  };



  // Sayfa açılınca default tarifi otomatik parse et
  useEffect(() => {
    if (tarif.trim()) {
      const olcek = tarifKisi > 0 ? kisiSayisi / tarifKisi : 1;
      const satirlar = tarif.split("\n");
      const sonuc = birlestir(satirlar.map(s => parseSatir(s, olcek)).filter(Boolean));
      if (sonuc.length > 0) setMalzemeler(sonuc);
    }
  }, []);

  // Kişi sayısı veya tarifKisi değişince malzemeleri yeniden ölçekle
  useEffect(() => {
    if (tarif.trim() && malzemeler.length > 0) {
      const olcek = tarifKisi > 0 ? kisiSayisi / tarifKisi : 1;
      const satirlar = tarif.split("\n");
      const sonuc = birlestir(satirlar.map(s => parseSatir(s, olcek)).filter(Boolean));
      if (sonuc.length > 0) setMalzemeler(sonuc);
    }
  }, [kisiSayisi, tarifKisi]);

  // 2-4, 6-8, 10-12, 14-16... (4'er artar)
  const kisiAraliklari = Array.from({ length: 25 }, (_, i) => [i * 4 + 2, i * 4 + 4]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdf6ec 0%, #fde8d8 50%, #fce4d6 100%)", fontFamily: "'Georgia', serif", padding: "20px 16px 40px" }}>



      {/* Kişi seçici */}
      
      {/* Sekmeler - sticky */}
      <div style={{ position: "sticky", top: 76, zIndex: 100, background: "transparent", paddingBottom: 0 }}>
        <div style={{ display: "flex", background: "#fff6f0", borderRadius: 14, padding: 4, gap: 3, boxShadow: "0 2px 8px rgba(124,51,40,0.12)", border: "1.5px solid #f5d0bb" }}>
          {[{ key: "tarif", label: "✨ Tarif" }, { key: "malzeme", label: "🧁 Malzeme" }, { key: "emek", label: "⏱ Emek" }, { key: "sonuc", label: "💰 Fiyat" }].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "9px 2px", border: "none", borderRadius: 10,
              fontFamily: "'Georgia', serif", fontSize: 12, cursor: "pointer",
              fontWeight: tab === t.key ? "bold" : "normal",
              background: tab === t.key ? "#c0533a" : "transparent",
              color: tab === t.key ? "#fff" : "#a0614a",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Kişi seçici - normal akışta */}
      <div style={{ background: "white", borderRadius: 12, padding: "8px 12px", marginBottom: 10, marginTop: 8, boxShadow: "0 2px 8px rgba(124,51,40,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", whiteSpace: "nowrap" }}>👥 Kaç kişilik?</span>
        <select value={kisiSayisi} onChange={(e) => setKisiSayisi(Number(e.target.value))}
          style={{ flex: 1, border: "1.5px solid #f5d0bb", borderRadius: 8, fontFamily: "'Georgia', serif", fontSize: 13, color: "#7c3328", background: "#fffaf7", outline: "none", padding: "6px 8px", cursor: "pointer" }}>
          {kisiAraliklari.map(([alt, ust]) => <option key={ust} value={ust}>{alt}-{ust} kişi</option>)}
        </select>
        <div style={{ fontSize: 15, fontWeight: "bold", color: "#c0533a", whiteSpace: "nowrap" }}>{kisiSayisi-2}-{kisiSayisi}</div>
      </div>

      <div style={{ background: "white", borderRadius: 20, padding: "20px 16px", boxShadow: "0 4px 20px rgba(124,51,40,0.12)" }}>

        {/* TARİF */}
        {tab === "tarif" && (
          <div>
            <h2 style={{ fontSize: 15, color: "#7c3328", marginTop: 0, marginBottom: 8 }}>✨ Tarifi Gir</h2>
            <p style={{ fontSize: 12, color: "#b5704a", margin: "0 0 10px" }}>
              Her malzemeyi ayrı satıra yaz. Kişi sayısına göre miktarlar otomatik ölçeklenir.
            </p>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {[
                { label: "🍰 Özel Pasta", kisi: 14, tarif: "5 adet yumurta\n120 gr şeker\n50 gr sıvı yağ\n50 gr süt\n135 gr un\n5 gr kabartma tozu\n5 gr vanilya\n10 gr limon suyu\n500 ml süt\n50 gr un\n50 gr buğday nişastası\n1 adet yumurta\n200 gr şeker\n15 gr kakao\n1 paket vanilya\n80 gr bitter çikolata\n450 ml sıvı krema\n400 gr toz şanti\n80 gr beyaz çikolata" },
                { label: "🍫 Çikolatalı", kisi: 8, tarif: "4 adet yumurta\n1 su bardağı şeker\n1 su bardağı un\n100 gr kakao\n1 paket kabartma tozu\n100 gr tereyağı\n200 ml krema\n150 gr çikolata" },
                { label: "🍓 Çilekli", kisi: 8, tarif: "4 adet yumurta\n1 su bardağı şeker\n1 su bardağı un\n1 paket vanilya\n1 paket kabartma tozu\n500 gr çilek\n400 ml krem şanti\n2 yemek kaşığı pudra şekeri" },
              ].map((s) => (
                <button key={s.label} onClick={() => { setTarif(s.tarif); setTarifKisi(s.kisi); }} style={{
                  padding: "6px 12px", border: "1.5px solid #f5d0bb", borderRadius: 20,
                  background: "#fdf6ec", color: "#7c3328", fontSize: 12,
                  fontFamily: "'Georgia', serif", cursor: "pointer",
                }}>{s.label}</button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, background: "#fdf6ec", borderRadius: 10, padding: "10px 14px" }}>
              <span style={{ fontSize: 13, color: "#7c3328", flex: 1 }}>Bu tarif kaç kişilik?</span>
              <select value={tarifKisi} onChange={(e) => setTarifKisi(Number(e.target.value))}
                style={{ ...hInputSt, width: 110, cursor: "pointer" }}>
                {kisiAraliklari.map(([alt, ust]) => <option key={ust} value={ust}>{alt}-{ust} kişilik</option>)}
              </select>
            </div>

            {tarifKisi !== kisiSayisi && (
              <div style={{ fontSize: 12, color: "#7c5c00", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                ⚖️ Tarif <b>{tarifKisi} kişilik</b> → Pasta <b>{kisiSayisi} kişilik</b> — miktarlar <b>{(kisiSayisi / tarifKisi).toFixed(2)}x</b> ölçeklenecek
              </div>
            )}

            <textarea value={tarif} onChange={(e) => setTarif(e.target.value)}
              placeholder={"5 adet yumurta\n1 su bardağı şeker\n1,5 su bardağı un\n800 ml süt\n3 yemek kaşığı mısır nişastası\n1 paket vanilya\n..."}
              rows={9}
              style={{ ...hInputSt, width: "100%", resize: "vertical", lineHeight: 1.7, fontSize: 13, padding: 12 }}
            />

            {hata && (
              <div style={{ color: "#c0533a", fontSize: 12, marginTop: 8, background: "#fde8d8", borderRadius: 8, padding: "8px 12px" }}>
                ⚠️ {hata}
              </div>
            )}

            <button onClick={tarifAnaliz} disabled={!tarif.trim()} style={{
              width: "100%", marginTop: 10, padding: "13px",
              background: !tarif.trim() ? "#e8c9b8" : "#c0533a",
              color: "white", border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: "bold", fontFamily: "'Georgia', serif",
              cursor: !tarif.trim() ? "not-allowed" : "pointer",
            }}>
              🔍 Malzemeleri Çıkar
            </button>

            {malzemeler.length > 0 && (
              <div style={{ marginTop: 10, background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#166534" }}>
                ✅ {malzemeler.length} malzeme çıkarıldı!
              </div>
            )}
          </div>
        )}

        {/* MALZEME */}
        {tab === "malzeme" && (
          <div>
            {/* Pasta İçeriği */}
            <div style={{ marginBottom: 16, background: "#fdf6ec", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, color: "#7c3328", fontWeight: "bold", marginBottom: 10 }}>🍓 Pasta İçeriği</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {Object.entries(suslemeDetay).map(([key, s]) => (
                  <button key={key} onClick={() => setSusleme(prev => ({ ...prev, [key]: !prev[key] }))} style={{
                    padding: "7px 14px", border: "none", borderRadius: 20,
                    fontFamily: "'Georgia', serif", fontSize: 13, cursor: "pointer",
                    background: susleme[key] ? "#c0533a" : "white",
                    color: susleme[key] ? "white" : "#7c3328",
                    fontWeight: susleme[key] ? "bold" : "normal",
                    boxShadow: "0 1px 4px rgba(124,51,40,0.1)",
                  }}>
                    {key === "muz" ? "🍌 Muz" : key === "cilek" ? "🍓 Çilek" : "🍫 Draje"}
                    {susleme[key] ? " ✓" : ""}
                  </button>
                ))}
              </div>
              {Object.entries(suslemeDetay).filter(([key]) => susleme[key]).map(([key, s]) => {
                const olcekliMiktar = parseFloat((s.miktar * suslemeOlcek).toFixed(3));
                return (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "#b5704a", marginBottom: 4 }}>
                      {key === "muz" ? "🍌" : key === "cilek" ? "🍓" : "🍫"} {s.ad}
                      <span style={{ marginLeft: 6, color: "#d4956a" }}>{olcekliMiktar} {s.birim}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 6, alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#d4956a", marginBottom: 2 }}>Miktar (16 kişilik baz)</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input type="number" value={s.miktar}
                            onChange={(e) => setSuslemeDetay(prev => ({ ...prev, [key]: { ...prev[key], miktar: parseFloat(e.target.value) || 0 } }))}
                            style={{ ...hInputSt, width: "100%", textAlign: "center" }} />
                          <span style={{ fontSize: 11, color: "#b5704a" }}>{s.birim}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#d4956a", marginBottom: 2 }}>Birim fiyat (₺/{s.birim})</div>
                        <input type="number" value={s.birimFiyat}
                          onChange={(e) => setSuslemeDetay(prev => ({ ...prev, [key]: { ...prev[key], birimFiyat: parseFloat(e.target.value) || 0 } }))}
                          style={{ ...hInputSt, width: "100%", textAlign: "right" }} />
                      </div>
                      <div style={{ textAlign: "right", fontSize: 13, fontWeight: "bold", color: "#7c3328", paddingTop: 16 }}>
                        {formatTL(olcekliMiktar * s.birimFiyat)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {Object.values(susleme).some(Boolean) && (
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f5d0bb", paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold" }}>Pasta İçeriği Toplamı</span>
                  <span style={{ fontSize: 12, color: "#c0533a", fontWeight: "bold" }}>{formatTL(suslemeMaliyeti)}</span>
                </div>
              )}
            </div>

            {/* Özelleştirme */}
            <div style={{ marginBottom: 16, background: "#fdf6ec", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, color: "#7c3328", fontWeight: "bold", marginBottom: 10 }}>✨ Özelleştirme</div>
              {Object.entries(ozellesturme).map(([key, item]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: item.aktif ? 8 : 0 }}>
                    <button onClick={() => setOzellesturme(p => ({ ...p, [key]: { ...p[key], aktif: !p[key].aktif } }))} style={{
                      padding: "6px 14px", border: "none", borderRadius: 20,
                      fontFamily: "'Georgia', serif", fontSize: 13, cursor: "pointer",
                      background: item.aktif ? "#c0533a" : "white",
                      color: item.aktif ? "white" : "#7c3328",
                      fontWeight: item.aktif ? "bold" : "normal",
                      boxShadow: "0 1px 4px rgba(124,51,40,0.1)",
                    }}>{item.label}{item.aktif ? " ✓" : ""}</button>
                    <span style={{ fontSize: 11, color: "#b5704a" }}>{item.aciklama}</span>
                  </div>
                  {item.aktif && (
                    <div style={{ display: "grid", gridTemplateColumns: key === "figur" ? "1fr 1fr 70px" : "1fr 70px", gap: 6, paddingLeft: 4 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#d4956a", marginBottom: 2 }}>Fiyat (₺)</div>
                        <input type="number" value={item.fiyat}
                          onChange={(e) => setOzellesturme(p => ({ ...p, [key]: { ...p[key], fiyat: parseFloat(e.target.value) || 0 } }))}
                          style={{ ...hInputSt, width: "100%", textAlign: "right" }} />
                      </div>
                      {key === "figur" && (
                        <div>
                          <div style={{ fontSize: 10, color: "#d4956a", marginBottom: 2 }}>Adet</div>
                          <input type="number" min="1" value={item.adet}
                            onChange={(e) => setOzellesturme(p => ({ ...p, [key]: { ...p[key], adet: parseInt(e.target.value) || 1 } }))}
                            style={{ ...hInputSt, width: "100%", textAlign: "center" }} />
                        </div>
                      )}
                      {key === "ozelTasarim" && (
                        <div>
                          <div style={{ fontSize: 10, color: "#d4956a", marginBottom: 2 }}>+Saat</div>
                          <input type="number" min="0" value={item.extraSaat}
                            onChange={(e) => setOzellesturme(p => ({ ...p, [key]: { ...p[key], extraSaat: parseInt(e.target.value) || 0 } }))}
                            style={{ ...hInputSt, width: "100%", textAlign: "center" }} />
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: "bold", color: "#c0533a" }}>
                          {formatTL(key === "figur" ? item.fiyat * (item.adet || 1) : item.fiyat)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {Object.values(ozellesturme).some(i => i.aktif) && (
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f5d0bb", paddingTop: 8 }}>
                  <span style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold" }}>Özelleştirme Toplamı</span>
                  <span style={{ fontSize: 12, color: "#c0533a", fontWeight: "bold" }}>{formatTL(ozellesturmeMaliyeti)}</span>
                </div>
              )}
            </div>

            <div style={{ background: "#fdf6ec", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: "#7c3328", fontWeight: "bold" }}>
                  🧁 Malzemeler {malzemeler.length > 0 && <span style={{ fontSize: 12, color: "#b5704a", fontWeight: "normal" }}>({malzemeler.length})</span>}
                </div>
                <button onClick={() => setBirimFiyatAcik(!birimFiyatAcik)} style={{ fontSize: 11, color: "#b5704a", background: "white", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", boxShadow: "0 1px 4px rgba(124,51,40,0.1)" }}>
                  {birimFiyatAcik ? "Gizle" : "✏️ Fiyat Düzenle"}
                </button>
              </div>

            {malzemeler.length === 0 && (
              <div style={{ textAlign: "center", padding: "16px 0", color: "#d4956a", fontSize: 13 }}>
                Henüz malzeme yok.<br /><span style={{ fontSize: 12 }}>Tarif sekmesinden doldur.</span>
              </div>
            )}

            {malzemeler.map((m) => (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 80px 30px", gap: 6, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#b5704a" }}>{m.ad}</div>
                    <div style={{ fontSize: 11, color: "#d4956a" }}>{formatTL(m.birimFiyat)} / {m.birim}</div>
                  </div>
                  <input type="number" value={m.miktar || ""} onChange={(e) => updateMalzeme(m.id, "miktar", e.target.value)}
                    style={{ ...hInputSt, textAlign: "center" }} />
                  <div style={{ textAlign: "right", fontSize: 13, fontWeight: "bold", color: "#7c3328" }}>
                    {formatTL((parseFloat(m.miktar) || 0) * m.birimFiyat)}
                  </div>
                  <button onClick={() => removeMalzeme(m.id)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#fde8d8", color: "#c0533a", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
                {birimFiyatAcik && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#b5704a", flex: 1 }}>Birim fiyat (₺/{m.birim})</span>
                    <input type="number" value={m.birimFiyat} onChange={(e) => updateMalzeme(m.id, "birimFiyat", parseFloat(e.target.value) || 0)}
                      style={{ ...hInputSt, width: 90 }} />
                  </div>
                )}
              </div>
            ))}

              <div style={{ marginTop: 10, borderTop: "1px dashed #f5d0bb", paddingTop: 10 }}>
                <div style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", marginBottom: 8 }}>+ Manuel Ekle</div>
                <input placeholder="Malzeme adı" value={yeni.ad} onChange={(e) => setYeni({ ...yeni, ad: e.target.value })}
                  style={{ ...hInputSt, width: "100%", marginBottom: 6 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <input placeholder="₺ Birim fiyat" type="number" value={yeni.birimFiyat} onChange={(e) => setYeni({ ...yeni, birimFiyat: e.target.value })} style={hInputSt} />
                  <input placeholder="Miktar" type="number" value={yeni.miktar} onChange={(e) => setYeni({ ...yeni, miktar: e.target.value })} style={hInputSt} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <select value={yeni.birim} onChange={(e) => setYeni({ ...yeni, birim: e.target.value })} style={{ ...hInputSt, width: "100%", cursor: "pointer" }}>
                    {["adet", "kg", "gr", "lt", "ml", "paket"].map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <button onClick={addMalzeme} style={{ width: "100%", padding: "10px", fontFamily: "'Georgia', serif", background: eklendi ? "#4caf50" : "#c0533a", color: "white", border: "none", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                  {eklendi ? "✓ Eklendi!" : "Ekle"}
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #f5d0bb", paddingTop: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13, color: "#7c3328", fontWeight: "bold" }}>Malzeme Toplamı</span>
                <span style={{ fontSize: 13, fontWeight: "bold", color: "#c0533a" }}>{formatTL(malzemeMaliyeti)}</span>
              </div>
            </div>

            {/* Pasta Tasarım & Görsel */}
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setTasarimAcik(p => !p)} style={{
                width: "100%", padding: "10px", background: tasarimAcik ? "#7c3328" : "#fdf6ec",
                color: tasarimAcik ? "white" : "#7c3328", border: "1.5px solid #f5d0bb",
                borderRadius: 12, fontSize: 13, fontWeight: "bold",
                fontFamily: "'Georgia', serif", cursor: "pointer",
              }}>
                🎂 Pasta Tasarımı & Önizleme {tasarimAcik ? "▲" : "▼"}
              </button>

              {tasarimAcik && (
                <div style={{ background: "#fdf6ec", borderRadius: 12, padding: 14, marginTop: 8 }}>
                  {/* Şekil seçici */}
                  <div style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", marginBottom: 8 }}>Pasta Şekli</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {[
                      { key: "yuvarlak", label: "⭕ Yuvarlak" },
                      { key: "kare", label: "⬛ Kare" },
                      { key: "dikdortgen", label: "▬ Dikdörtgen" },
                      { key: "kalp", label: "❤️ Kalp" },
                    ].map(s => (
                      <button key={s.key} onClick={() => setPastaSekil(s.key)} style={{
                        padding: "6px 12px", border: "none", borderRadius: 16,
                        fontFamily: "'Georgia', serif", fontSize: 12, cursor: "pointer",
                        background: pasaSekil === s.key ? "#c0533a" : "white",
                        color: pasaSekil === s.key ? "white" : "#7c3328",
                        boxShadow: "0 1px 4px rgba(124,51,40,0.1)",
                      }}>{s.label}</button>
                    ))}
                  </div>

                  {/* Boyut */}
                  <div style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", marginBottom: 8 }}>Boyut (cm)</div>
                  <div style={{ display: "grid", gridTemplateColumns: pasaSekil === "dikdortgen" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {pasaSekil === "yuvarlak" || pasaSekil === "kalp" ? (
                      <>
                        <div>
                          <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Çap (cm)</div>
                          <input type="number" value={pastaBoyut.cap} onChange={e => setPastaBoyut(p => ({ ...p, cap: parseInt(e.target.value) || 0 }))} style={{ ...hInputSt, width: "100%" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Kat Sayısı</div>
                          <select value={pastaKat} onChange={e => setPastaKat(parseInt(e.target.value))} style={{ ...hInputSt, width: "100%", cursor: "pointer" }}>
                            {[1,2,3,4].map(k => <option key={k} value={k}>{k} Kat</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>{pasaSekil === "dikdortgen" ? "En (cm)" : "Kenar (cm)"}</div>
                          <input type="number" value={pastaBoyut.en} onChange={e => setPastaBoyut(p => ({ ...p, en: parseInt(e.target.value) || 0 }))} style={{ ...hInputSt, width: "100%" }} />
                        </div>
                        {pasaSekil === "dikdortgen" && (
                          <div>
                            <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Boy (cm)</div>
                            <input type="number" value={pastaBoyut.boy} onChange={e => setPastaBoyut(p => ({ ...p, boy: parseInt(e.target.value) || 0 }))} style={{ ...hInputSt, width: "100%" }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Kat Sayısı</div>
                          <select value={pastaKat} onChange={e => setPastaKat(parseInt(e.target.value))} style={{ ...hInputSt, width: "100%", cursor: "pointer" }}>
                            {[1,2,3,4].map(k => <option key={k} value={k}>{k} Kat</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Renk */}
                  <div style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", marginBottom: 8 }}>Kaplama Rengi</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    {[
                      { key: "krem", label: "🤍 Krem", renk: "#f5e6c8" },
                      { key: "cikolata", label: "🍫 Çikolata", renk: "#5c3317" },
                      { key: "pembe", label: "🌸 Pembe", renk: "#f4a7b9" },
                      { key: "beyaz", label: "⬜ Beyaz", renk: "#fff8f0" },
                      { key: "lacivert", label: "🫐 Lacivert", renk: "#1a237e" },
                    ].map(r => (
                      <button key={r.key} onClick={() => setPastaRenk(r.key)} style={{
                        padding: "6px 12px", border: pastaRenk === r.key ? "2.5px solid #c0533a" : "1.5px solid #f5d0bb",
                        borderRadius: 16, fontFamily: "'Georgia', serif", fontSize: 11, cursor: "pointer",
                        background: r.renk, color: r.key === "lacivert" || r.key === "cikolata" ? "white" : "#7c3328",
                        fontWeight: pastaRenk === r.key ? "bold" : "normal",
                      }}>{r.label}</button>
                    ))}
                  </div>

                  {/* SVG Önizleme */}
                  <div style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", marginBottom: 8 }}>Önizleme</div>
                  <PastaOnizleme
                    sekil={pasaSekil} kat={pastaKat} boyut={pastaBoyut}
                    renk={pastaRenk} susleme={susleme} suslemeDetay={suslemeDetay}
                    ozellesturme={ozellesturme} bazGorsel={bazGorsel}
                  />

                  {/* Baz görsel yükleme */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", marginBottom: 6 }}>📷 Baz Görsel (Referans)</div>
                    <input type="file" accept="image/*" onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setBazGorsel(ev.target.result);
                      reader.readAsDataURL(file);
                    }} style={{ ...hInputSt, width: "100%", cursor: "pointer" }} />
                    {bazGorsel && (
                      <div style={{ marginTop: 8, position: "relative", display: "inline-block" }}>
                        <img src={bazGorsel} alt="Baz görsel" style={{ width: "100%", borderRadius: 10, maxHeight: 200, objectFit: "cover" }} />
                        <button onClick={() => setBazGorsel(null)} style={{
                          position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)",
                          color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 12,
                        }}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dip Toplam */}
            <div style={{ background: "#fff6f0", border: "2px solid #f5d0bb", borderRadius: 12, padding: 12, marginTop: 4 }}>
              <div style={{ fontSize: 13, color: "#7c3328", fontWeight: "bold", marginBottom: 10 }}>📊 Maliyet Özeti</div>
              {[
                ["🧁 Malzeme", malzemeMaliyeti],
                ["🍓 Pasta İçeriği", suslemeMaliyeti],
                ["✨ Özelleştirme", ozellesturmeMaliyeti],
              ].map(([label, val]) => val > 0 && (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13, color: "#b5704a" }}>
                  <span>{label}</span><span style={{ color: "#7c3328" }}>{formatTL(val)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #f5d0bb", paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#7c3328" }}>Toplam Malzeme Maliyeti</span>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#c0533a" }}>{formatTL(malzemeMaliyeti + suslemeMaliyeti + ozellesturmeMaliyeti)}</span>
              </div>
            </div>
          </div>
        )}

        {/* EMEK */}
        {tab === "emek" && (
          <div>
            <h2 style={{ fontSize: 15, color: "#7c3328", marginTop: 0, marginBottom: 16 }}>Giderler</h2>
            <SatirInput label="Saat ücreti" sublabel="" value={saatUcreti} onChange={setSaatUcreti} suffix="₺/saat" />
            <div style={{ background: "#fdf6ec", borderRadius: 10, padding: "10px 14px", marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#b5704a", marginBottom: 4 }}>Kademeli çalışma süresi</div>
              {[[2,10],[20,7],[40,11],[60,15],[80,19],[100,23]].map(([kisi, saat]) => (
                <div key={kisi} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#b5704a", marginBottom: 2 }}>
                  <span>{kisi} kişi</span><span>~{Math.round(3 + kisi * 0.2)} saat</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #f5d0bb", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7c3328", fontWeight: "bold" }}>
                <span>Toplam ({toplamSaat} saat × ₺{saatUcreti})</span>
                <span>{formatTL(emekMaliyeti)}</span>
              </div>
            </div>
            <div style={{ borderTop: "1px dashed #f5d0bb", margin: "16px 0" }} />
            <SatirInput label="Ambalaj & Mum" sublabel="(sabit, pasta başına)" value={ambalajMum} onChange={setAmbalajMum} suffix="₺" />
            <div style={hRowSt}><span>Ambalaj & Mum</span><span style={{ fontWeight: "bold" }}>{formatTL(ambalajMaliyeti)}</span></div>

            <div style={{ borderTop: "1px dashed #f5d0bb", margin: "16px 0" }} />
            <SatirInput label="Sabit giderler oranı" sublabel="(kira, elektrik vb.)" value={genel} onChange={setGenel} suffix="%" />
            <div style={hRowSt}><span>Sabit Giderler (%{genel})</span><span style={{ fontWeight: "bold" }}>{formatTL(genelMaliyet)}</span></div>
            <div style={{ borderTop: "1px dashed #f5d0bb", margin: "16px 0" }} />
            <div style={{ background: "#fdf6ec", borderRadius: 12, padding: "12px 16px" }}>
              {[["Malzeme", malzemeMaliyeti], ["Pasta İçeriği", suslemeMaliyeti], ["İşçilik", emekMaliyeti], ["Özelleştirme", ozellesturmeMaliyeti], ["Ambalaj & Mum", ambalajMaliyeti], ["Teslimat", teslimatMaliyeti], ["Sabit Giderler", genelMaliyet]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#b5704a" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#7c3328" }}>{formatTL(val)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #f5d0bb", paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontSize: 15, fontWeight: "bold", color: "#7c3328" }}>Toplam Maliyet</span>
                <span style={{ fontSize: 15, fontWeight: "bold", color: "#c0533a" }}>{formatTL(toplamMaliyet)}</span>
              </div>
            </div>
          </div>
        )}

        {/* SONUÇ */}
        {tab === "sonuc" && (
          <div>
            <button onClick={() => setFiyatlandirmaAcik(p => !p)} style={{
              width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "none", border: "none", padding: "0 0 12px 0", cursor: "pointer",
              borderBottom: "1.5px solid #f5d0bb", marginBottom: fiyatlandirmaAcik ? 16 : 0,
            }}>
              <span style={{ fontSize: 15, fontWeight: "bold", color: "#7c3328", fontFamily: "'Georgia', serif" }}>💰 Fiyatlandırma</span>
              <span style={{ color: "#b5704a", fontSize: 14 }}>{fiyatlandirmaAcik ? "▲" : "▼"}</span>
            </button>
            {fiyatlandirmaAcik && <div>
            {/* Teslimat */}
            <div style={{ background: "#fdf6ec", borderRadius: 12, padding: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: teslimatAktif ? 10 : 0 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#7c3328", fontWeight: "bold" }}>🚗 Teslimat</div>
                  <div style={{ fontSize: 11, color: "#d4956a" }}>Kapalıysa müşteri teslim alır</div>
                </div>
                <button onClick={() => setTeslimatAktif(p => !p)} style={{
                  padding: "6px 14px", border: "none", borderRadius: 20,
                  fontFamily: "'Georgia', serif", fontSize: 12, cursor: "pointer",
                  background: teslimatAktif ? "#c0533a" : "white",
                  color: teslimatAktif ? "white" : "#7c3328", fontWeight: "bold",
                  boxShadow: "0 1px 4px rgba(124,51,40,0.1)",
                }}>{teslimatAktif ? "✓ Var" : "Yok"}</button>
              </div>
              {teslimatAktif && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#b5704a", flex: 1 }}>Teslimat bedeli</span>
                  <input type="number" value={teslimat} onChange={(e) => setTeslimat(e.target.value)}
                    style={{ ...hInputSt, width: 90, textAlign: "right" }} />
                  <span style={{ fontSize: 12, color: "#b5704a" }}>₺</span>
                </div>
              )}
            </div>

            <SatirInput label="Kar oranı" value={karOrani} onChange={setKarOrani} suffix="%" />
            <SatirInput label="KDV oranı" value={kdvOrani} onChange={setKdvOrani} suffix="%" />
            <div style={{ borderTop: "1px dashed #f5d0bb", margin: "16px 0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#7c3328" }}>Yeni Müşteri İndirimi</div>
                <div style={{ fontSize: 11, color: "#d4956a" }}>Aktifken fiyata uygulanır</div>
              </div>
              <button onClick={() => setYeniMusteriAktif(p => !p)} style={{
                padding: "6px 14px", border: "none", borderRadius: 20,
                fontFamily: "'Georgia', serif", fontSize: 12, cursor: "pointer",
                background: yeniMusteriAktif ? "#c0533a" : "#fdf6ec",
                color: yeniMusteriAktif ? "white" : "#7c3328",
                fontWeight: "bold",
              }}>{yeniMusteriAktif ? "✓ Aktif" : "Pasif"}</button>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input type="number" value={yeniMusteriIndirim} onChange={(e) => setYeniMusteriIndirim(e.target.value)}
                  style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: 60, textAlign: "right", boxSizing: "border-box" }} />
                <span style={{ fontSize: 12, color: "#b5704a" }}>%</span>
              </div>
            </div>
            {yeniMusteriAktif && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#7c5c00", marginBottom: 8 }}>
                🎁 {yeniMusteriIndirim}% indirim uygulandı — {formatTL(indirimMiktari)} düşüldü
              </div>
            )}

            <div style={{ background: "#fdf6ec", borderRadius: 12, padding: "12px 16px", marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#b5704a", marginBottom: 8, fontWeight: "bold" }}>Kişi Başı Hesap ({kisiSayisi-2}-{kisiSayisi} kişi)</div>
              {[["Kişi Başı Maliyet", kisiBasiMaliyet], ["Kar (%" + karOrani + ")", kisiBasiKar]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "#b5704a" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#7c3328" }}>{formatTL(val)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#b5704a" }}>KDV (%{kdvOrani})</span>
                <span style={{ fontSize: 13, color: "#7c3328" }}>{formatTL(kisiBasiMaliyet * (1 + (parseFloat(karOrani)||0)/100) * ((parseFloat(kdvOrani)||0)/100))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #f5d0bb", paddingTop: 8 }}>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#7c3328" }}>Kişi Başı Fiyat (KDV dahil)</span>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#c0533a" }}>{formatTL(Math.ceil(kisiBasiKdvDahil / 5) * 5)}</span>
              </div>
            </div>
            </div>}

            <div style={{ background: "linear-gradient(135deg, #c0533a 0%, #8c3020 100%)", borderRadius: 16, padding: "20px 16px", textAlign: "center", margin: "14px 0 12px", boxShadow: "0 4px 16px rgba(192,83,58,0.3)" }}>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 4 }}>{kisiSayisi - 2}-{kisiSayisi} Kişilik Pasta — Toplam Satış Fiyatı</div>
              {yeniMusteriAktif && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 1 }}>Normal: {formatTL(Math.ceil(toplamSatisFiyati * (1 + (parseFloat(kdvOrani)||0)/100) / 50) * 50)} • 🎁 %{yeniMusteriIndirim} indirim</div>}
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 2 }}>KDV Hariç: {formatTL(Math.ceil(indirimliSatisFiyati / 50) * 50)}</div>
              <div style={{ color: "white", fontSize: 34, fontWeight: "bold", letterSpacing: "-1px" }}>{formatTL(Math.ceil(kdvDahilFiyat / 50) * 50)}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>KDV (%{kdvOrani}) dahil</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 6 }}>{kisiSayisi - 2}-{kisiSayisi} kişilik • Dilim başına {formatTL(Math.ceil(kisiBasiKdvDahil / 5) * 5)}</div>
            </div>


              {onUrunKaydet && (
                <button onClick={() => onUrunKaydet({
                  ad: "Pasta " + kisiSayisi + "-" + (kisiSayisi+2) + " kişilik",
                  kategori: "Yaş Pasta",
                  maliyet: Math.round(toplamMaliyet),
                  fiyat: Math.ceil(kdvDahilFiyat / 50) * 50,
                  aciklama: malzemeler.map(m => m.ad).join(", ").slice(0, 80),
                })} style={{
                  width: "100%", marginTop: 10, padding: "12px",
                  background: "#4caf50", color: "white", border: "none",
                  borderRadius: 12, fontSize: 14, fontWeight: "bold",
                  fontFamily: "'Georgia', serif", cursor: "pointer",
                }}>
                  💾 Bu Ürünü Kataloğa Kaydet
                </button>
              )}
              {setTeklifOlustur && (
                <button onClick={() => setTeklifOlustur({
                  // Kırmızı karttan direkt değerler — hiç yeniden hesaplama yapma
                  fiyat: Math.ceil(kdvDahilFiyat / 50) * 50,
                  // indirimliSatisFiyati = KDV hariç toplam (teslimat dahil, indirim uygulanmış)
                  kdvHaricToplam: Math.ceil(indirimliSatisFiyati / 50) * 50,
                  // teslimat ayrı
                  teslimatBedeliNet: teslimatAktif ? (parseFloat(teslimat) || 0) : 0,
                  // KDV = fiyat - kdvHaricToplam
                  // ham fiyat = kdvHaricToplam - teslimat
                  kisiSayisi: kisiSayisi,
                  kisiAraligi: (kisiSayisi-2) + "-" + kisiSayisi,
                  kdvOrani: kdvOrani,
                  indirimAktif: yeniMusteriAktif,
                  indirimOrani: parseFloat(yeniMusteriIndirim) || 0,
                  indirimMiktariNet: Math.ceil(indirimMiktari / 50) * 50,
                  tarih: new Date().toISOString().split("T")[0],
                  teslimatVar: teslimatAktif,
                  teslimatBedeli: teslimatAktif ? (parseFloat(teslimat) || 0) : 0,
                  kisiBasiFiyat: Math.ceil(kisiBasiKdvDahil / 5) * 5,
                })} style={{
                  width: "100%", marginTop: 8, padding: "12px",
                  background: "#7c3328", color: "white", border: "none",
                  borderRadius: 12, fontSize: 14, fontWeight: "bold",
                  fontFamily: "'Georgia', serif", cursor: "pointer",
                }}>
                  💌 Müşteriye Teklif Oluştur
                </button>
              )}
              {setStoklar && malzemeler.length > 0 && (
                <button onClick={() => {
                  // Malzeme listesindeki her malzemeyi stoktan düş
                  let guncellenenStoklar = [...(stoklar || [])];
                  const eksikler = [];
                  malzemeler.forEach(m => {
                    const adNorm = m.ad.toLowerCase().replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ö/g,"o").replace(/ı/g,"i").replace(/ç/g,"c");
                    const stokIdx = guncellenenStoklar.findIndex(s =>
                      s.ad.toLowerCase().replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ö/g,"o").replace(/ı/g,"i").replace(/ç/g,"c").includes(adNorm.slice(0,4))
                    );
                    if (stokIdx >= 0) {
                      const yeniMiktar = Math.max(0, guncellenenStoklar[stokIdx].miktar - (parseFloat(m.miktar) || 0));
                      guncellenenStoklar[stokIdx] = { ...guncellenenStoklar[stokIdx], miktar: parseFloat(yeniMiktar.toFixed(4)), guncelleme: new Date().toISOString().split("T")[0] };
                    } else {
                      eksikler.push(m.ad);
                    }
                  });
                  setStoklar(guncellenenStoklar);
                  alert(eksikler.length > 0 ? `Stok düşüldü! Stokta bulunamayan: ${eksikler.join(", ")}` : "✅ Tüm malzemeler stoktan düşüldü!");
                }} style={{
                  width: "100%", marginTop: 8, padding: "12px",
                  background: "#e07b39", color: "white", border: "none",
                  borderRadius: 12, fontSize: 14, fontWeight: "bold",
                  fontFamily: "'Georgia', serif", cursor: "pointer",
                }}>
                  📦 Malzemeleri Stoktan Düş
                </button>
              )}

            {/* Fiyat tablosu */}
            <button onClick={() => setFiyatTablosuAcik(p => !p)} style={{
              width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "#fdf6ec", border: "1.5px solid #f5d0bb", borderRadius: 12,
              padding: "10px 14px", cursor: "pointer", marginTop: 8,
            }}>
              <span style={{ fontSize: 13, fontWeight: "bold", color: "#7c3328", fontFamily: "'Georgia', serif" }}>📊 Kişi Sayısına Göre Fiyatlar</span>
              <span style={{ color: "#b5704a", fontSize: 14 }}>{fiyatTablosuAcik ? "▲" : "▼"}</span>
            </button>
            {fiyatTablosuAcik && <div style={{ marginTop: 8 }}>
              {kisiAraliklari.map(([alt, ust]) => { const k = ust;
                // Kart ile tamamen aynı formül
                const olcekK = tarifKisi > 0 ? k / tarifKisi : 1;
                const olcekMevcut = tarifKisi > 0 ? kisiSayisi / tarifKisi : 1;
                const malzemeBase = olcekMevcut > 0 ? malzemeMaliyeti / olcekMevcut : malzemeMaliyeti;
                const malzemeK = malzemeBase * olcekK;
                const suslemeK = Object.entries(susleme)
                  .filter(([_, secili]) => secili)
                  .reduce((acc, [key]) => {
                    const s = suslemeDetay[key];
                    return acc + s.miktar * olcekK * s.birimFiyat;
                  }, 0);
                const kademeliSaatK = Math.round(3 + k * 0.2);
                const emekK = (kademeliSaatK + ozellesturmeSaat) * (parseFloat(saatUcreti) || 0);
                const genelK = malzemeK * ((parseFloat(genel) || 0) / 100);
                const toplamK = malzemeK + suslemeK + emekK + ozellesturmeMaliyeti + ambalajMaliyeti + teslimatMaliyeti + genelK;
                const karK = toplamK * ((parseFloat(karOrani) || 0) / 100);
                const satisK = toplamK + karK;
                const indirimK = yeniMusteriAktif ? satisK * ((parseFloat(yeniMusteriIndirim) || 0) / 100) : 0;
                const satisIndirimliK = satisK - indirimK;
                const kdvK = satisIndirimliK * ((parseFloat(kdvOrani) || 0) / 100);
                const satisKdvK = satisIndirimliK + kdvK;
                const kbsK = k > 0 ? satisKdvK / k : 0;
                return (
                  <div key={k} onClick={() => setKisiSayisi(k)} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                    background: kisiSayisi === ust ? "#fde8d8" : "#fdf6ec",
                    border: kisiSayisi === ust ? "1.5px solid #c0533a" : "1.5px solid transparent",
                  }}>
                    <span style={{ fontSize: 13, color: "#7c3328", fontWeight: kisiSayisi === ust ? "bold" : "normal" }}>{alt}-{ust} kişi</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 13, fontWeight: "bold", color: "#c0533a" }}>{formatTL(Math.ceil(satisKdvK / 50) * 50)}</span>
                      <span style={{ fontSize: 10, color: "#b5704a", marginLeft: 6 }}>({formatTL(Math.ceil(kbsK / 5) * 5)}/kişi)</span>
                    </div>
                  </div>
                );
              })}
            </div>}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: "#b5704a", marginBottom: 8, fontWeight: "bold" }}>Maliyet Dağılımı</div>
              {[{ label: "Malzeme", val: malzemeMaliyeti }, { label: "Pasta İçeriği", val: suslemeMaliyeti }, { label: "İşçilik", val: emekMaliyeti }, { label: "Özelleştirme", val: ozellesturmeMaliyeti }, { label: "Ambalaj", val: ambalajMaliyeti }, { label: "Teslimat", val: teslimatMaliyeti }, { label: "Sabit Gider", val: genelMaliyet }].map((item) => {
                const pct = toplamMaliyet > 0 ? Math.round((item.val / toplamMaliyet) * 100) : 0;
                return (
                  <div key={item.label} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: "#7c3328" }}>{item.label}</span>
                      <span style={{ fontSize: 12, color: "#7c3328" }}>{pct}% — {formatTL(item.val)}</span>
                    </div>
                    <div style={{ background: "#f5d0bb", borderRadius: 6, height: 6 }}>
                      <div style={{ background: "#c0533a", borderRadius: 6, height: 6, width: pct + "%", transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

// ============================================================
// TEKLİF YÖNETİMİ
// ============================================================
function TeklifYonetimi({ teklifler, setTeklifler, musteriler }) {
  const [secili, setSecili] = useState(null);
  const [musteriSec, setMusteriSec] = useState("");
  const [musteriAd, setMusteriAd] = useState("");
  const [not, setNot] = useState("");
  const [gonderiDurum, setGonderiDurum] = useState("");

  const DURUM_RENKLER = { "Taslak": "#999", "Gönderildi": "#2196f3", "Onaylandı": "#4caf50", "Reddedildi": "#f44336" };

  // Kırmızı karttan kaydedilen kdvHaricToplam'ı kullanarak geri hesapla
  const hesapla = (t) => {
    const toplam = t.fiyat;
    const kdvHaric = t.kdvHaricToplam || Math.ceil(toplam / (1 + (t.kdvOrani||10)/100) / 50) * 50;
    const teslF = (t.teslimatVar && t.teslimatBedeli > 0) ? t.teslimatBedeli : 0;
    const kdvT = toplam - kdvHaric;
    const hamF = kdvHaric - teslF;
    const indirimF = t.indirimMiktariNet || (t.indirimAktif ? Math.ceil(t.indirimMiktari / 50) * 50 : 0);
    const araT = toplam + indirimF;
    const kbsAlt = t.kisiBasiFiyat || Math.ceil(toplam / t.kisiSayisi / 5) * 5;
    const kbsUst = Math.ceil(toplam / (t.kisiSayisi - 2) / 5) * 5;
    return { toplam, kdvHaric, teslF, kdvT, hamF, indirimF, araT, kbsAlt, kbsUst };
  };

  const olusturMesaj = (t, ad, platform) => {
    const { hamF, teslF, kdvT, araT, indirimF, kbsAlt, kbsUst } = hesapla(t);
    const teslStr = teslF > 0 ? formatTL(teslF) : "Müşteri teslim alır";

    if (platform === "instagram") {
      return `Merhaba ${ad}! 🎂✨

` +
        `${t.kisiAraligi} kişilik özel pasta teklifiniz hazır 💌

` +
        `🏷️ ${formatTL(hamF)}
` +
        `🚗 Teslimat: ${teslStr}
` +
        `🧾 KDV (%${t.kdvOrani}): +${formatTL(kdvT)}
` +
        `➕ Ara Toplam: ${formatTL(araT)}
` +
        (t.indirimAktif ? `🎁 Hoş Geldin İndirimi: -${formatTL(indirimF)}
` : "") +
        `
💳 TOPLAM: ${formatTL(t.fiyat)}
` +
        `💫 Kişi başı: ${formatTL(kbsUst)} - ${formatTL(kbsAlt)}
` +
        (not ? `
📝 ${not}
` : "") +
        `
Sipariş için mesaj atabilirsiniz 🙏

` +
        `🎂 Anzel Patisserie
📍 Özel Tasarım Pastalar`;
    }

    return `Merhaba ${ad} 👋

` +
      `🎂 *ANZEL PATİSSERİE*
_Özel Tasarım Pastalar_

` +
      `━━━━━━━━━━━━━━━━━━
` +
      `📦 *${t.kisiAraligi} Kişilik Pasta Teklifiniz*
` +
      `━━━━━━━━━━━━━━━━━━

` +
      `🏷️ Fiyat: ${formatTL(hamF)}
` +
      `🚗 Teslimat: ${teslStr}
` +
      `🧾 KDV (%${t.kdvOrani}): ${formatTL(kdvT)}
` +
      `➕ Ara Toplam: *${formatTL(araT)}*
` +
      (t.indirimAktif ? `🎁 Hoş Geldin İndirimi: *-${formatTL(indirimF)}*
` : "") +
      `
┌─────────────────┐
` +
      `│  💳 *TOPLAM: ${formatTL(t.fiyat)}*
` +
      `└─────────────────┘
` +
      `💫 Kişi başı: ${formatTL(kbsUst)} - ${formatTL(kbsAlt)}
` +
      (not ? `
📝 ${not}
` : "") +
      `
✅ Siparişinizi onaylamak için lütfen yanıt verin.

Sevgiyle 🎂
*Anzel Patisserie*`;
  };

  const whatsappGonder = (t) => {
    const musteri = musteriler.find(m => m.id === parseInt(musteriSec));
    const ad = musteriAd || musteri?.ad || t.musteriAd || "Değerli Müşterimiz";
    const tel = (musteri?.telefon || "").replace(/[^0-9]/g, "");
    const mesaj = olusturMesaj(t, ad, "whatsapp");
    const encoded = encodeURIComponent(mesaj);
    const url = tel ? `whatsapp://send?phone=90${tel}&text=${encoded}` : `whatsapp://send?text=${encoded}`;
    window.open(url, "_blank");
    setTeklifler(p => p.map(tk => tk.id === t.id ? { ...tk, durum: "Gönderildi", gonderimTarih: bugunISO(), musteriAd: ad } : tk));
    setGonderiDurum("✅ WhatsApp açıldı!");
    setTimeout(() => setGonderiDurum(""), 3000);
  };

  const kopyala = (t, platform) => {
    const musteri = musteriler.find(m => m.id === parseInt(musteriSec));
    const ad = musteriAd || musteri?.ad || t.musteriAd || "Değerli Müşterimiz";
    const mesaj = olusturMesaj(t, ad, platform);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mesaj).then(() => {
        setGonderiDurum(platform === "instagram" ? "✅ Instagram mesajı kopyalandı!" : "✅ Mesaj kopyalandı!");
        setTimeout(() => setGonderiDurum(""), 3000);
      }).catch(() => {
        setGonderiDurum("❌ Kopyalanamadı, lütfen tekrar deneyin.");
        setTimeout(() => setGonderiDurum(""), 3000);
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = mesaj;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setGonderiDurum("✅ Kopyalandı!");
      setTimeout(() => setGonderiDurum(""), 3000);
    }
  };

  const sil = (id) => { setTeklifler(p => p.filter(t => t.id !== id)); setSecili(null); };

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: "bold", color: "#7c3328", marginBottom: 14 }}>💌 Fiyat Teklifleri</div>

      {teklifler.length === 0 && (
        <div style={{ ...kardSt, textAlign: "center", padding: "32px", color: "#b5704a" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💌</div>
          <div>Henüz teklif yok</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Maliyet sekmesinden "Müşteriye Teklif Oluştur" butonu ile teklif oluşturun</div>
        </div>
      )}

      {teklifler.map(t => {
        const { hamF, teslF, kdvT, araT, indirimF, kbsAlt, kbsUst } = hesapla(t);
        return (
          <div key={t.id} style={{ ...kardSt, border: secili === t.id ? "1.5px solid #c0533a" : "1.5px solid transparent" }}>
            {/* Başlık — tıklanabilir */}
            <div style={{ cursor: "pointer" }} onClick={() => {
              const yeni = secili === t.id ? null : t.id;
              setSecili(yeni);
              if (yeni === t.id) { setMusteriAd(t.musteriAd || ""); setMusteriSec(t.musteriId || ""); setNot(""); }
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: "#7c3328" }}>{t.musteriAd || "Müşteri Atanmadı"}</div>
                  <div style={{ fontSize: 12, color: "#b5704a", marginTop: 2 }}>{t.kisiAraligi} kişilik • {t.tarih}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: "bold", color: "#c0533a" }}>{formatTL(t.fiyat)}</div>
                  <div style={{ fontSize: 10, fontWeight: "bold", color: DURUM_RENKLER[t.durum] || "#999", marginTop: 2 }}>{t.durum}</div>
                </div>
              </div>
            </div>

            {/* Detay */}
            {secili === t.id && (
              <div style={{ marginTop: 14, borderTop: "1px solid #f5d0bb", paddingTop: 14 }}>
                {/* Müşteri */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#7c3328", fontWeight: "bold", marginBottom: 6 }}>👤 Müşteri</div>
                  {musteriler.length > 0 && (
                    <select value={musteriSec} onChange={e => {
                      const m = musteriler.find(m => m.id === parseInt(e.target.value));
                      setMusteriSec(e.target.value);
                      if (m) {
                        setMusteriAd(m.ad);
                        setTeklifler(p => p.map(tk => tk.id === t.id ? { ...tk, musteriAd: m.ad, musteriId: m.id } : tk));
                      }
                    }} style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box", marginBottom: 6, cursor: "pointer" }}>
                      <option value="">Müşteri seç...</option>
                      {musteriler.map(m => <option key={m.id} value={m.id}>{m.ad}{m.telefon ? ` - ${m.telefon}` : ""}</option>)}
                    </select>
                  )}
                  <input placeholder="Müşteri adı" value={musteriAd} onChange={e => {
                    setMusteriAd(e.target.value);
                    setTeklifler(p => p.map(tk => tk.id === t.id ? { ...tk, musteriAd: e.target.value } : tk));
                  }} style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box" }} />
                </div>

                {/* Fiyat özeti */}
                <div style={{ background: "#fdf6ec", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#b5704a", marginBottom: 10, fontWeight: "bold" }}>{t.kisiAraligi} Kişilik Pasta</div>
                  {[
                    { icon: "🏷️", label: "Fiyat", val: formatTL(hamF) },
                    { icon: "🚗", label: "Teslimat", val: teslF > 0 ? formatTL(teslF) : "Müşteri alıyor" },
                    { icon: "🧾", label: `KDV (%${t.kdvOrani})`, val: formatTL(kdvT) },
                    { icon: "➕", label: "Ara Toplam", val: formatTL(araT), bold: true },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#b5704a" }}>{r.icon} {r.label}</span>
                      <span style={{ fontSize: r.bold ? 13 : 12, fontWeight: r.bold ? "bold" : "normal", color: "#7c3328" }}>{r.val}</span>
                    </div>
                  ))}
                  {t.indirimAktif && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#4caf50" }}>🎁 Yeni Müşteri İndirimi</span>
                      <span style={{ fontSize: 12, color: "#4caf50", fontWeight: "bold" }}>-{formatTL(indirimF)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #f5d0bb", paddingTop: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: "bold", color: "#7c3328" }}>💳 Toplam</span>
                    <span style={{ fontSize: 24, fontWeight: "bold", color: "#c0533a" }}>{formatTL(t.fiyat)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#b5704a", textAlign: "right", marginTop: 2 }}>
                    Kişi başı {formatTL(kbsUst)} - {formatTL(kbsAlt)}
                  </div>
                </div>

                {/* Not */}
                <textarea placeholder="Ek not (teslimat detayı, özel istek vb.)" value={not} onChange={e => setNot(e.target.value)}
                  rows={2} style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 12, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box", resize: "none", marginBottom: 10 }} />

                {gonderiDurum && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#166534", marginBottom: 8, textAlign: "center" }}>
                    {gonderiDurum}
                  </div>
                )}

                {/* Butonlar */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <button onClick={() => whatsappGonder(t)} style={{ padding: "11px 8px", background: "#25d366", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif", cursor: "pointer" }}>
                    📱 WhatsApp
                  </button>
                  <button onClick={() => kopyala(t, "genel")} style={{ padding: "11px 8px", background: "#007aff", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif", cursor: "pointer" }}>
                    📋 Kopyala
                  </button>
                </div>
                <button onClick={() => kopyala(t, "instagram")} style={{ width: "100%", padding: "11px", marginBottom: 8, background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif", cursor: "pointer" }}>
                  📸 Instagram Mesajı Kopyala
                </button>

                {/* Durum */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {["Taslak", "Gönderildi", "Onaylandı", "Reddedildi"].map(d => (
                    <button key={d} onClick={() => setTeklifler(p => p.map(tk => tk.id === t.id ? { ...tk, durum: d } : tk))} style={{ padding: "5px 10px", border: "none", borderRadius: 12, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif", background: t.durum === d ? (DURUM_RENKLER[d] || "#999") : "#fdf6ec", color: t.durum === d ? "white" : "#7c3328" }}>
                      {d}
                    </button>
                  ))}
                </div>

                {/* Logo */}
                <div style={{ textAlign: "center", padding: "14px 0 8px", borderTop: "1.5px solid #f5d0bb", marginBottom: 10 }}>
                  <div style={{ background: "linear-gradient(135deg, #c0533a, #7c3328)", borderRadius: 14, padding: "10px 18px", display: "inline-block" }}>
                    <div style={{ fontSize: 20 }}>🎂</div>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "white", fontFamily: "'Georgia', serif", letterSpacing: "2px", marginTop: 3 }}>ANZEL PATİSSERİE</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>✨ Özel Tasarım Pastalar</div>
                  </div>
                </div>

                <button onClick={() => sil(t.id)} style={{ width: "100%", padding: "9px", background: "#fde8d8", color: "#c0533a", border: "none", borderRadius: 10, fontSize: 12, fontFamily: "'Georgia', serif", cursor: "pointer" }}>
                  Teklifi Sil
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// STOK YÖNETİMİ
// ============================================================
const STOK_BIRIMLER = ["kg", "gr", "lt", "ml", "adet", "paket", "kutu"];

function StokYonetimi({ stoklar, setStoklar }) {
  const [form, setForm] = useState(false);
  const [duzenle, setDuzenle] = useState(null);
  const [ara, setAra] = useState("");
  const [yeni, setYeni] = useState({ ad: "", miktar: "", birim: "kg", minMiktar: "", fiyat: "", notlar: "" });

  const kaydet = () => {
    if (!yeni.ad || yeni.miktar === "") return;
    const stok = {
      ...yeni,
      id: duzenle || Date.now(),
      miktar: parseFloat(yeni.miktar) || 0,
      minMiktar: parseFloat(yeni.minMiktar) || 0,
      fiyat: parseFloat(yeni.fiyat) || 0,
      guncelleme: bugunISO(),
    };
    if (duzenle) {
      setStoklar(p => p.map(s => s.id === duzenle ? stok : s));
      setDuzenle(null);
    } else {
      setStoklar(p => [...p, stok]);
    }
    setYeni({ ad: "", miktar: "", birim: "kg", minMiktar: "", fiyat: "", notlar: "" });
    setForm(false);
  };

  const sil = (id) => setStoklar(p => p.filter(s => s.id !== id));

  const duzenleBasla = (stok) => {
    setYeni({ ad: stok.ad, miktar: stok.miktar, birim: stok.birim, minMiktar: stok.minMiktar, fiyat: stok.fiyat, notlar: stok.notlar || "" });
    setDuzenle(stok.id);
    setForm(true);
  };

  const miktarGuncelle = (id, yeniMiktar) => {
    setStoklar(p => p.map(s => s.id === id ? { ...s, miktar: Math.max(0, parseFloat(yeniMiktar) || 0), guncelleme: bugunISO() } : s));
  };

  const filtreli = stoklar.filter(s => s.ad.toLowerCase().includes(ara.toLowerCase()));
  const kritikler = filtreli.filter(s => s.miktar <= s.minMiktar);
  const normallar = filtreli.filter(s => s.miktar > s.minMiktar);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: "bold", color: "#7c3328" }}>📦 Stok Yönetimi</div>
        <button onClick={() => { setForm(p => !p); setDuzenle(null); setYeni({ ad: "", miktar: "", birim: "kg", minMiktar: "", fiyat: "", notlar: "" }); }} style={{
          padding: "8px 16px", background: "#c0533a", color: "white", border: "none",
          borderRadius: 20, fontSize: 13, fontFamily: "'Georgia', serif", cursor: "pointer",
        }}>{form ? "✕ İptal" : "+ Stok Ekle"}</button>
      </div>

      <input placeholder="🔍 Malzeme ara..." value={ara} onChange={e => setAra(e.target.value)}
        style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box", marginBottom: 12 }} />

      {form && (
        <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(124,51,40,0.10)", marginBottom: 12, border: "1.5px solid #f5d0bb" }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#7c3328", marginBottom: 10 }}>
            {duzenle ? "Stok Düzenle" : "Yeni Stok Kalemi"}
          </div>
          <input placeholder="Malzeme adı *" value={yeni.ad} onChange={e => setYeni(p => ({ ...p, ad: e.target.value }))}
            style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box", marginBottom: 8 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Mevcut Miktar *</div>
              <input type="number" value={yeni.miktar} onChange={e => setYeni(p => ({ ...p, miktar: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Birim</div>
              <select value={yeni.birim} onChange={e => setYeni(p => ({ ...p, birim: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box", cursor: "pointer" }}>
                {STOK_BIRIMLER.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Min. Uyarı</div>
              <input type="number" placeholder="0" value={yeni.minMiktar} onChange={e => setYeni(p => ({ ...p, minMiktar: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Birim Fiyat (₺)</div>
              <input type="number" placeholder="0" value={yeni.fiyat} onChange={e => setYeni(p => ({ ...p, fiyat: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#b5704a", marginBottom: 3 }}>Notlar</div>
              <input placeholder="Tedarikçi vb." value={yeni.notlar} onChange={e => setYeni(p => ({ ...p, notlar: e.target.value }))}
                style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: "100%", boxSizing: "border-box" }} />
            </div>
          </div>
          <button onClick={kaydet} style={{ width: "100%", padding: "11px", background: "#c0533a", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", fontFamily: "'Georgia', serif", cursor: "pointer" }}>
            {duzenle ? "Güncelle" : "Ekle"}
          </button>
        </div>
      )}

      {/* Kritik stoklar */}
      {kritikler.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#e07b39", marginBottom: 8 }}>⚠️ Kritik Seviye ({kritikler.length})</div>
          {kritikler.map(s => <StokKart key={s.id} stok={s} onDuzenle={duzenleBasla} onSil={sil} onMiktar={miktarGuncelle} kritik />)}
        </div>
      )}

      {normallar.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#7c3328", marginBottom: 8 }}>✅ Stokta ({normallar.length})</div>
          {normallar.map(s => <StokKart key={s.id} stok={s} onDuzenle={duzenleBasla} onSil={sil} onMiktar={miktarGuncelle} />)}
        </div>
      )}

      {stoklar.length === 0 && !form && (
        <div style={{ background: "white", borderRadius: 16, padding: "32px", textAlign: "center", color: "#b5704a", boxShadow: "0 2px 12px rgba(124,51,40,0.10)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div>Henüz stok eklenmedi</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Malzemeleri ekleyerek stok takibine başlayın</div>
        </div>
      )}
    </div>
  );
}

function StokKart({ stok, onDuzenle, onSil, onMiktar, kritik }) {
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [geciciMiktar, setGeciciMiktar] = useState(stok.miktar);
  const doluluk = stok.minMiktar > 0 ? Math.min((stok.miktar / (stok.minMiktar * 3)) * 100, 100) : 100;

  return (
    <div style={{
      background: "white", borderRadius: 14, padding: "12px 14px", marginBottom: 8,
      boxShadow: "0 2px 8px rgba(124,51,40,0.08)",
      border: kritik ? "1.5px solid #f5a623" : "1.5px solid transparent",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#7c3328" }}>{stok.ad}</div>
          {stok.notlar && <div style={{ fontSize: 11, color: "#b5704a", marginTop: 1 }}>{stok.notlar}</div>}
          {stok.fiyat > 0 && <div style={{ fontSize: 11, color: "#b5704a" }}>₺{stok.fiyat}/{stok.birim}</div>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onDuzenle(stok)} style={{ padding: "3px 8px", background: "#fdf6ec", color: "#7c3328", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>✏️</button>
          <button onClick={() => onSil(stok.id)} style={{ padding: "3px 8px", background: "#fde8d8", color: "#c0533a", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>✕</button>
        </div>
      </div>

      {/* Stok bar */}
      <div style={{ background: "#f5d0bb", borderRadius: 4, height: 6, marginBottom: 8 }}>
        <div style={{ background: kritik ? "#f5a623" : "#4caf50", borderRadius: 4, height: 6, width: doluluk + "%", transition: "width 0.3s" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: kritik ? "#e07b39" : "#4caf50", fontWeight: "bold" }}>
          {stok.miktar} {stok.birim} {kritik && "⚠️"}
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => onMiktar(stok.id, stok.miktar - (stok.birim === "adet" || stok.birim === "paket" ? 1 : 0.1))}
            style={{ width: 26, height: 26, background: "#fde8d8", color: "#c0533a", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
          <input type="number" value={stok.miktar}
            onChange={e => onMiktar(stok.id, e.target.value)}
            style={{ width: 60, padding: "4px 6px", border: "1.5px solid #f5d0bb", borderRadius: 6, fontSize: 12, textAlign: "center", background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none" }} />
          <button onClick={() => onMiktar(stok.id, stok.miktar + (stok.birim === "adet" || stok.birim === "paket" ? 1 : 0.1))}
            style={{ width: 26, height: 26, background: "#fdf6ec", color: "#7c3328", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      </div>
      {stok.minMiktar > 0 && <div style={{ fontSize: 10, color: "#b5704a", marginTop: 4 }}>Min: {stok.minMiktar} {stok.birim}</div>}
    </div>
  );
}

// ============================================================
// PASTA ÖNİZLEME SVG
// ============================================================
function PastaOnizleme({ sekil, kat, boyut, renk, susleme, suslemeDetay, ozellesturme, bazGorsel }) {
  const RENKLER_MAP = {
    krem: { zemin: "#f5e6c8", kenar: "#d4956a", krema: "#fff8f0", kremaKenar: "#f5d0bb" },
    cikolata: { zemin: "#3e2009", kenar: "#1a0a00", krema: "#5c3317", kremaKenar: "#7c4a2a" },
    pembe: { zemin: "#f4a7b9", kenar: "#e07b99", krema: "#fce4ec", kremaKenar: "#f48fb1" },
    beyaz: { zemin: "#fff8f0", kenar: "#f5d0bb", krema: "#ffffff", kremaKenar: "#f5e6c8" },
    lacivert: { zemin: "#1a237e", kenar: "#0d1257", krema: "#283593", kremaKenar: "#3949ab" },
  };
  const r = RENKLER_MAP[renk] || RENKLER_MAP.krem;
  const W = 280, H = 260;
  const cx = W / 2, cy = 130;

  // Boyut bilgisi metni
  const boyutMetni = sekil === "yuvarlak" || sekil === "kalp"
    ? `⌀${boyut.cap} cm`
    : sekil === "dikdortgen"
    ? `${boyut.en} × ${boyut.boy} cm`
    : `${boyut.en} × ${boyut.en} cm`;

  // Kat yükseklikleri
  const katYuksekligi = 38;
  const toplamYukseklik = kat * katYuksekligi;
  const taban = cy + toplamYukseklik / 2;

  // Dekorasyon: draje noktaları
  const drajeVar = susleme?.draje;
  const muzVar = susleme?.muz;
  const cilekVar = susleme?.cilek;
  const baskilVar = ozellesturme?.baski?.aktif;
  const figurVar = ozellesturme?.figur?.aktif;

  const KatSekil = ({ katIdx }) => {
    const y1 = taban - (katIdx + 1) * katYuksekligi;
    const y2 = taban - katIdx * katYuksekligi;
    const scaleX = 1 - katIdx * 0.15;
    const kx = cx;
    const genislik = scaleX;

    if (sekil === "yuvarlak" || sekil === "kalp") {
      const rx = 75 * genislik;
      const ry = katYuksekligi / 2;
      const ymid = (y1 + y2) / 2;
      return (
        <g key={katIdx}>
          {/* Yan yüz */}
          <ellipse cx={kx} cy={y2} rx={rx} ry={8 * genislik} fill={r.kenar} />
          <rect x={kx - rx} y={y1} width={rx * 2} height={y2 - y1} fill={r.zemin} />
          <ellipse cx={kx} cy={y1} rx={rx} ry={8 * genislik} fill={r.zemin} />
          {/* Krema şeridi */}
          <ellipse cx={kx} cy={y1} rx={rx + 3} ry={6 * genislik} fill={r.krema} opacity={0.9} />
          {/* Üst yüz */}
          {katIdx === kat - 1 && <ellipse cx={kx} cy={y1} rx={rx} ry={8 * genislik} fill={r.krema} />}
        </g>
      );
    } else {
      const hw = 70 * genislik;
      const hh = sekil === "dikdortgen" ? 50 * genislik : hw;
      return (
        <g key={katIdx}>
          {/* Ön yüz */}
          <rect x={kx - hw} y={y1} width={hw * 2} height={y2 - y1} fill={r.zemin} />
          {/* Sol yüz (3D) */}
          <polygon points={`${kx - hw},${y1} ${kx - hw - 15},${y1 + 10} ${kx - hw - 15},${y2 + 10} ${kx - hw},${y2}`} fill={r.kenar} />
          {/* Üst yüz (3D) */}
          <polygon points={`${kx - hw},${y1} ${kx - hw - 15},${y1 + 10} ${kx + hw - 15},${y1 + 10} ${kx + hw},${y1}`} fill={r.krema} />
          {/* Krema şeridi */}
          <rect x={kx - hw - 2} y={y1 - 4} width={hw * 2 + 4} height={8} rx={3} fill={r.krema} opacity={0.9} />
          {katIdx === kat - 1 && <rect x={kx - hw} y={y1 - 1} width={hw * 2} height={10} rx={2} fill={r.krema} />}
        </g>
      );
    }
  };

  // Süslemeler üst katta
  const topY = taban - kat * katYuksekligi;
  const topRx = sekil === "yuvarlak" || sekil === "kalp" ? 75 * (1 - (kat-1) * 0.15) : 70 * (1 - (kat-1) * 0.15);

  return (
    <div style={{ background: "white", borderRadius: 14, padding: 12, boxShadow: "0 2px 12px rgba(124,51,40,0.12)", position: "relative" }}>
      {bazGorsel && (
        <div style={{ marginBottom: 8, opacity: 0.3, position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", zIndex: 0 }}>
          <img src={bazGorsel} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Kat gövdeleri — alttan üste */}
        {Array.from({ length: kat }, (_, i) => <KatSekil key={i} katIdx={i} />)}

        {/* Süslemeler */}
        {drajeVar && Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const dx = cx + Math.cos(angle) * (topRx * 0.65);
          const dy = topY + Math.sin(angle) * 6;
          return <circle key={i} cx={dx} cy={dy} r={4} fill={["#c0533a","#7c3328","#f5d0bb","#4a90d9"][i % 4]} />;
        })}

        {muzVar && Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2 + 0.3;
          const dx = cx + Math.cos(angle) * (topRx * 0.5);
          const dy = topY - 2;
          return (
            <g key={i}>
              <ellipse cx={dx} cy={dy} rx={9} ry={5} fill="#f5e030" transform={`rotate(${angle * 57},${dx},${dy})`} />
              <ellipse cx={dx} cy={dy} rx={9} ry={5} fill="#e8c820" opacity={0.5} transform={`rotate(${angle * 57},${dx},${dy})`} />
            </g>
          );
        })}

        {cilekVar && Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2 + 0.8;
          const dx = cx + Math.cos(angle) * (topRx * 0.55);
          const dy = topY - 4;
          return (
            <g key={i}>
              <ellipse cx={dx} cy={dy + 4} rx={7} ry={8} fill="#e53935" />
              <polygon points={`${dx},${dy - 8} ${dx - 5},${dy - 2} ${dx + 5},${dy - 2}`} fill="#2e7d32" />
            </g>
          );
        })}

        {baskilVar && (
          <g>
            <ellipse cx={cx} cy={topY + 2} rx={topRx * 0.5} ry={topRx * 0.15} fill="none" stroke="#c0533a" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={cx} y={topY + 6} textAnchor="middle" fontSize={9} fill="#c0533a" fontFamily="Georgia">BASKI</text>
          </g>
        )}

        {figurVar && (
          <g>
            <circle cx={cx} cy={topY - 14} r={10} fill="#f5d0bb" stroke="#c0533a" strokeWidth={1.5} />
            <text x={cx} y={topY - 10} textAnchor="middle" fontSize={10}>🧸</text>
          </g>
        )}

        {/* Boyut etiketi */}
        <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill="#b5704a" fontFamily="Georgia">{boyutMetni} • {kat} Kat</text>

        {/* Ok/boyut çizgisi */}
        <line x1={20} y1={topY} x2={20} y2={taban} stroke="#f5d0bb" strokeWidth={1} />
        <line x1={15} y1={topY} x2={25} y2={topY} stroke="#f5d0bb" strokeWidth={1} />
        <line x1={15} y1={taban} x2={25} y2={taban} stroke="#f5d0bb" strokeWidth={1} />
        <text x={14} y={(topY + taban) / 2} textAnchor="middle" fontSize={9} fill="#b5704a" fontFamily="Georgia" transform={`rotate(-90, 14, ${(topY + taban) / 2})`}>{kat * 8} cm</text>
      </svg>
    </div>
  );
}

function SatirInput({ label, sublabel, value, onChange, suffix }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#7c3328" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: "#d4956a" }}>{sublabel}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
          style={{ padding: "8px 10px", border: "1.5px solid #f5d0bb", borderRadius: 8, fontSize: 13, background: "#fffaf7", color: "#7c3328", fontFamily: "'Georgia', serif", outline: "none", width: 80, textAlign: "right", boxSizing: "border-box" }} />
        <span style={{ fontSize: 12, color: "#b5704a", minWidth: 30 }}>{suffix}</span>
      </div>
    </div>
  );
}
