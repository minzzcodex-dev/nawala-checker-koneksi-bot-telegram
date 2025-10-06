import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import https from "https";

// ==========================
// KONFIGURASI
// ==========================
const BOT_TOKEN = "MASUKAN_BOT_TOKEN_DISINI"; // Ganti token BotFather
const DATA_FILE = "./domains.json";
let data = { domains: [], interval: 60 * 1000, lastChatId: null };

// Muat data domain
if (fs.existsSync(DATA_FILE)) {
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) {
    console.error("Gagal membaca domains.json:", e);
  }
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const saveData = () =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ==========================
// CEK DOMAIN
// ==========================
async function checkBatch(domains) {
  return new Promise((resolve) => {
    const url = `https://check.skiddle.id?domains=${domains.join(
      ","
    )}&json=true`;

    https
      .get(url, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(raw);
            const results = domains.map((domain) => {
              const result = data[domain];
              if (!result || typeof result !== "object") {
                return {
                  domain,
                  blocked: null,
                  status: "⚠️ Tidak diketahui",
                };
              }
              if (result.blocked === true) {
                return {
                  domain,
                  blocked: true,
                  status: "❌ Terblokir (ISP/Nawala)",
                };
              } else {
                return {
                  domain,
                  blocked: false,
                  status: "✅ Tidak Terblokir",
                };
              }
            });
            resolve(results);
          } catch (err) {
            console.error("Parse error:", err);
            resolve(
              domains.map((d) => ({
                domain: d,
                blocked: null,
                status: "⚠️ Error parse API",
              }))
            );
          }
        });
      })
      .on("error", (err) => {
        console.error("API error:", err.message);
        resolve(
          domains.map((d) => ({
            domain: d,
            blocked: null,
            status: "⚠️ API Error",
          }))
        );
      });
  });
}

// ==========================
// CEK DNS GOOGLE
// ==========================
async function checkGoogleDNS(domain) {
  return new Promise((resolve) => {
    const url = `https://dns.google/resolve?name=${domain}`;
    https
      .get(url, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(raw);
            if (!json.Answer)
              resolve({ active: false, ip: null, reason: "Tidak resolve" });
            else
              resolve({
                active: true,
                ip: json.Answer.map((a) => a.data)
                  .filter((d) => d.match(/\d+\.\d+\.\d+\.\d+/))
                  .join(", "),
              });
          } catch {
            resolve({ active: false, reason: "Error parsing DNS" });
          }
        });
      })
      .on("error", () => resolve({ active: false, reason: "DNS error" }))
      .setTimeout(5000, function () {
        this.destroy();
        resolve({ active: false, reason: "DNS timeout" });
      });
  });
}

// ==========================
// CEK MASSAL
// ==========================
async function runCheck(chatId) {
  if (!data.domains.length)
    return bot.sendMessage(chatId, "⚠️ Belum ada domain tersimpan.");

  const dnsResults = {};
  for (const d of data.domains) {
    dnsResults[d] = await checkGoogleDNS(d);
  }

  const apiResults = await checkBatch(data.domains);

  const final = apiResults.map((r) => {
    const dns = dnsResults[r.domain];
    if (!dns.active)
      return `🌐 *${r.domain}*\nStatus: ⚠️ Tidak aktif (${dns.reason})`;
    return `🌐 *${r.domain}*\nDNS: ✅ Aktif (${dns.ip})\nStatus: ${r.status}`;
  });

  bot.sendMessage(chatId, `📡 *Hasil Pengecekan:*\n\n${final.join("\n\n")}`, {
    parse_mode: "Markdown",
  });
}

// ==========================
// PENJADWALAN
// ==========================
let job = null;
function restartJob() {
  if (job) clearInterval(job);
  if (data.lastChatId)
    job = setInterval(() => runCheck(data.lastChatId), data.interval);
}
restartJob();

// ==========================
// HANDLER TELEGRAM
// ==========================
bot.onText(/\/start/, (msg) => {
  const text = `👋 *Nawala Checker Bot (BY : @lord_minzzcodex)*\n\nPerintah:\n
/domainadd example.com — tambah domain
/domainlist — lihat daftar domain
/domainclear — hapus semua domain
/setinterval 5 — ubah interval ke 5 menit
/check — cek semua domain sekarang`;
  data.lastChatId = msg.chat.id;
  saveData();
  bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
});

bot.onText(/\/domain(add|_add) (.+)/, (msg, match) => {
  const d = match[2].trim().toLowerCase();
  if (!d) return;
  if (!data.domains.includes(d)) {
    data.domains.push(d);
    saveData();
    bot.sendMessage(msg.chat.id, `✅ Domain *${d}* ditambahkan.`, {
      parse_mode: "Markdown",
    });
  } else {
    bot.sendMessage(msg.chat.id, `⚠️ Domain *${d}* sudah ada.`, {
      parse_mode: "Markdown",
    });
  }
});

bot.onText(/\/domain(list|_list)/, (msg) => {
  if (!data.domains.length)
    return bot.sendMessage(msg.chat.id, "📭 Tidak ada domain tersimpan.");
  const list = data.domains.map((d, i) => `${i + 1}. ${d}`).join("\n");
  bot.sendMessage(msg.chat.id, `📜 *Daftar Domain:*\n${list}`, {
    parse_mode: "Markdown",
  });
});

bot.onText(/\/domain(clear|_clear)/, (msg) => {
  data.domains = [];
  saveData();
  bot.sendMessage(msg.chat.id, "🗑 Semua domain dihapus.");
});

bot.onText(/\/set(interval|_interval) (\d+)/, (msg, match) => {
  const min = parseInt(match[2]);
  if (isNaN(min) || min <= 0)
    return bot.sendMessage(msg.chat.id, "❌ Masukkan angka menit yang valid.");
  data.interval = min * 60 * 1000;
  saveData();
  restartJob();
  bot.sendMessage(
    msg.chat.id,
    `⏱ Interval pengecekan diubah ke *${min} menit*.`,
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/check/, (msg) => runCheck(msg.chat.id));

bot.on("message", (msg) =>
  console.log(`[LOG] ${msg.chat.username || msg.chat.id}: ${msg.text}`)
);
