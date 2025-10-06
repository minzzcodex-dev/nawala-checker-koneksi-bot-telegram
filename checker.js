import { exec } from "child_process";

export function checkDomain(domain) {
  return new Promise((resolve) => {
    exec(`node index.js ${domain}`, (error, stdout) => {
      if (error) {
        resolve({ domain, status: "Error", message: error.message });
        return;
      }

      const text = stdout.toLowerCase();
      if (text.includes("tidak terblokir")) {
        resolve({ domain, status: "✅ Tidak Terblokir" });
      } else if (text.includes("terblokir")) {
        resolve({ domain, status: "❌ Terblokir" });
      } else {
        resolve({ domain, status: "⚠️ Tidak Diketahui" });
      }
    });
  });
}

