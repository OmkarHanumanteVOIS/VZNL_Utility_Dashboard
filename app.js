// ------------------------------
// CONFIG
// ------------------------------
const VALID_USERS = ["omkar", "akshay", "prajakta", "amar", "shrikant", "sander", "mathijs", "dirk", "rohit", "kedar"];
const RESET_USERS = ["omkar", "akshay", "shrikant"];

let data = [];   // CSV rows stored in memory only (read-only)
let usedMap = {}; // Tracks "Used" rows in browser memory only

// ------------------------------
// LOAD CSV (READ-ONLY)
// ------------------------------
async function loadCSV() {
    const response = await fetch("data.csv");
    const text = await response.text();

    const rows = text.split("\n").map(r => r.trim()).filter(r => r.length > 0);
    const headers = rows[0].split(",").map(h => h.trim());

    data = rows.slice(1).map(row => {
        const values = row.split(",").map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || "");
        return obj;
    });

    console.log("Loaded rows:", data.length);
}

// ------------------------------
// USER VERIFICATION
// ------------------------------
function verifyUser(username) {
    username = username.trim().toLowerCase();
    if (VALID_USERS.includes(username)) {
        return {
            status: "success",
            user: username,
            can_reset: RESET_USERS.includes(username)
        };
    }
    return { status: "fail" };
}

// ------------------------------
// DROPDOWNS
// ------------------------------
function getDropdowns() {
    const available = data.filter(row => !usedMap[row["Customer ID"]]);

    const types = [...new Set(available.map(r => r["Type"]))].sort();
    const offers = [...new Set(available.map(r => r["Offer"]))].sort();
    const cycles = [...new Set(available.map(r => r["BILL CYCLE"]))].sort();

    return { types, offers, cycles };
}

// ------------------------------
// RETRIEVE CUSTOMER (READ-ONLY)
// ------------------------------
function retrieveCustomer(user, type, offer, cycle) {
    for (const row of data) {
        if (
            row["Type"] === type &&
            row["Offer"] === offer &&
            row["BILL CYCLE"] === cycle &&
            !usedMap[row["Customer ID"]]
        ) {
            usedMap[row["Customer ID"]] = true; // Mark as used (browser only)

            return {
                status: "success",
                details: {
                    "Customer ID": row["Customer ID"],
                    "Type": row["Type"],
                    "Offer": row["Offer"],
                    "IMSI": row["IMSI"],
                    "SIM": row["SIM"],
                    "MSISDN": row["MSISDN"],
                    "Bill Cycle": row["BILL CYCLE"]
                }
            };
        }
    }
    return { status: "fail" };
}

// ------------------------------
// RESET (BROWSER ONLY)
// ------------------------------
function resetAll() {
    usedMap = {}; // Clears only browser memory
    return { status: "reset" };
}

// ------------------------------
// EXPORT FUNCTIONS FOR HTML
// ------------------------------
window.App = {
    loadCSV,
    verifyUser,
    getDropdowns,
    retrieveCustomer,
    resetAll
};
