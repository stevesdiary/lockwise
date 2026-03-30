#!/usr/bin/env node
/**
 * Export demo seed credentials to an Excel workbook.
 * Run AFTER the seeder has been applied:
 *   node scripts/export-demo-credentials.js
 */

'use strict';

const path = require('path');
const XLSX = require('xlsx');

// ─── Must match the seeder exactly ────────────────────────────────────────────

const MANAGER_PASSWORD  = 'Manager@1234';
const RESIDENT_PASSWORD = 'Resident@1234';

const ESTATES = [
  { name: 'Greenview Estate',  city: 'Lagos',         state: 'Lagos'  },
  { name: 'Sunrise Court',     city: 'Abuja',         state: 'FCT'    },
  { name: 'Palm Gardens',      city: 'Port Harcourt', state: 'Rivers' },
  { name: 'Royal Heights',     city: 'Ikeja',         state: 'Lagos'  },
  { name: 'Cedar Park',        city: 'Ibadan',        state: 'Oyo'    },
];

const MANAGER_NAMES = [
  { first_name: 'Adewale',   last_name: 'Okafor'  },
  { first_name: 'Funmilayo', last_name: 'Balogun' },
  { first_name: 'Chukwudi',  last_name: 'Nwosu'   },
  { first_name: 'Yetunde',   last_name: 'Adeyemi' },
  { first_name: 'Emeka',     last_name: 'Eze'     },
];

const RESIDENT_NAMES = [
  [
    { first_name: 'Tunde',    last_name: 'Fashola'   },
    { first_name: 'Ngozi',    last_name: 'Obi'       },
    { first_name: 'Bola',     last_name: 'Tinubu'    },
  ],
  [
    { first_name: 'Amara',    last_name: 'Chukwu'    },
    { first_name: 'Seun',     last_name: 'Kuti'      },
    { first_name: 'Damilola', last_name: 'Okonkwo'   },
  ],
  [
    { first_name: 'Chioma',   last_name: 'Nwachukwu' },
    { first_name: 'Femi',     last_name: 'Otedola'   },
    { first_name: 'Ife',      last_name: 'Bankole'   },
  ],
  [
    { first_name: 'Kemi',     last_name: 'Adeola'    },
    { first_name: 'Dotun',    last_name: 'Olaiya'    },
    { first_name: 'Sola',     last_name: 'Adesanya'  },
  ],
  [
    { first_name: 'Biodun',   last_name: 'Fatoyinbo' },
    { first_name: 'Taiwo',    last_name: 'Afolabi'   },
    { first_name: 'Kehinde',  last_name: 'Salami'    },
  ],
];

// ─── Build rows ───────────────────────────────────────────────────────────────

const managerRows = ESTATES.map((estate, i) => {
  const slug  = estate.name.toLowerCase().replace(/\s+/g, '');
  const name  = MANAGER_NAMES[i];
  return {
    Role:       'Manager',
    Estate:     estate.name,
    City:       estate.city,
    State:      estate.state,
    'Full Name': `${name.first_name} ${name.last_name}`,
    Email:      `manager${i + 1}@${slug}.lockwise.dev`,
    Password:   MANAGER_PASSWORD,
    Phone:      `+2348${String(10000000 + i).slice(1)}`,
  };
});

const residentRows = [];
ESTATES.forEach((estate, estateIdx) => {
  const slug = estate.name.toLowerCase().replace(/\s+/g, '');
  RESIDENT_NAMES[estateIdx].forEach((name, resIdx) => {
    residentRows.push({
      Role:       'Resident',
      Estate:     estate.name,
      City:       estate.city,
      State:      estate.state,
      'Full Name': `${name.first_name} ${name.last_name}`,
      Email:      `${name.first_name.toLowerCase()}.${name.last_name.toLowerCase()}@${slug}.lockwise.dev`,
      Password:   RESIDENT_PASSWORD,
      Phone:      `+2347${String(10000000 + estateIdx * 3 + resIdx).slice(1)}`,
    });
  });
});

// ─── Build workbook ───────────────────────────────────────────────────────────

const wb = XLSX.utils.book_new();

// Sheet 1: All credentials
const allRows = [...managerRows, ...residentRows];
const wsAll   = XLSX.utils.json_to_sheet(allRows);
styleSheet(wsAll, allRows.length + 1);
XLSX.utils.book_append_sheet(wb, wsAll, 'All Accounts');

// Sheet 2: Managers only
const wsMgr = XLSX.utils.json_to_sheet(managerRows);
styleSheet(wsMgr, managerRows.length + 1);
XLSX.utils.book_append_sheet(wb, wsMgr, 'Managers');

// Sheet 3: Residents only
const wsRes = XLSX.utils.json_to_sheet(residentRows);
styleSheet(wsRes, residentRows.length + 1);
XLSX.utils.book_append_sheet(wb, wsRes, 'Residents');

// Per-estate sheets
ESTATES.forEach((estate, i) => {
  const estateRows = [
    managerRows[i],
    ...residentRows.filter(r => r.Estate === estate.name),
  ];
  const ws = XLSX.utils.json_to_sheet(estateRows);
  styleSheet(ws, estateRows.length + 1);
  const sheetName = estate.name.slice(0, 31); // Excel sheet name max 31 chars
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
});

// ─── Write file ───────────────────────────────────────────────────────────────

const outDir  = path.resolve(__dirname, '../docs');
const outFile = path.join(outDir, 'demo-credentials.xlsx');

const fs = require('fs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

XLSX.writeFile(wb, outFile);
console.log(`\n✓ Credentials exported to: ${outFile}`);
console.log(`  Sheets: All Accounts | Managers | Residents | (5 per-estate sheets)\n`);

// ─── Helper: set column widths ────────────────────────────────────────────────

function styleSheet(ws, rowCount) {
  ws['!cols'] = [
    { wch: 10 },  // Role
    { wch: 22 },  // Estate
    { wch: 16 },  // City
    { wch: 10 },  // State
    { wch: 22 },  // Full Name
    { wch: 44 },  // Email
    { wch: 16 },  // Password
    { wch: 16 },  // Phone
  ];
}
