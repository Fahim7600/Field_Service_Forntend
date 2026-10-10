import fs from "node:fs";
import path from "node:path";

const APP_DIR = path.resolve("src/app");
const DASHBOARD_CONST_FILE = path.resolve("src/constants/dashboard.ts");
const SITE_CONST_FILE = path.resolve("src/constants/site.ts");

// 1. Recursively find all page.tsx files
function getAppPages(dir, baseDir = dir) {
  const pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...getAppPages(fullPath, baseDir));
    } else if (
      entry.isFile() &&
      (entry.name === "page.tsx" || entry.name === "page.jsx")
    ) {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      // Normalize route: strip route groups (xxx) and trailing /page.tsx
      const route =
        "/" +
        rel
          .split("/")
          .filter(
            (segment) => !segment.startsWith("(") || !segment.endsWith(")"),
          )
          .join("/")
          .replace(/\/page\.(tsx|jsx)$/, "")
          .replace(/^page\.(tsx|jsx)$/, "");

      const normalizedRoute = route === "" ? "/" : route;
      pages.push({
        rawPath: rel,
        fullPath,
        route: normalizedRoute,
        isDashboard: rel.includes("(dashboard)"),
      });
    }
  }

  return pages;
}

// 2. Parse links from dashboard.ts
function parseDashboardLinks() {
  const content = fs.readFileSync(DASHBOARD_CONST_FILE, "utf-8");
  const roles = [
    {
      role: "Customer",
      regex: /CUSTOMER_LINKS\s*:\s*DashboardLink\[\]\s*=\s*\[([\s\S]*?)\];/,
    },
    {
      role: "Technician",
      regex: /TECHNICIAN_LINKS\s*:\s*DashboardLink\[\]\s*=\s*\[([\s\S]*?)\];/,
    },
    {
      role: "Admin",
      regex:
        /(?:ADMIN_LINKS|ADMIN_NAV_GROUPS)\s*:\s*(?:DashboardLink\[\]|NavGroup\[\])\s*=\s*\[([\s\S]*?)\];/,
    },
  ];

  const links = [];

  for (const { role, regex } of roles) {
    const match = content.match(regex);
    if (!match) continue;

    const block = match[1];
    const itemRegex =
      /{\s*label:\s*["']([^"']+)["'],\s*href:\s*["']([^"']+)["']/g;
    let itemMatch = itemRegex.exec(block);

    while (itemMatch !== null) {
      links.push({
        role,
        label: itemMatch[1],
        href: itemMatch[2],
      });
      itemMatch = itemRegex.exec(block);
    }
  }

  return links;
}

// 3. Parse public navigation links from site.ts
function parsePublicLinks() {
  const content = fs.readFileSync(SITE_CONST_FILE, "utf-8");
  const links = [];

  // Parse mainNav
  const mainNavMatch = content.match(
    /mainNav\s*:\s*NavItem\[\]\s*=\s*\[([\s\S]*?)\];/,
  );
  if (mainNavMatch) {
    const itemRegex =
      /{\s*title:\s*["']([^"']+)["'],\s*href:\s*["']([^"']+)["']/g;
    let m = itemRegex.exec(mainNavMatch[1]);
    while (m !== null) {
      links.push({
        location: "Navbar",
        label: m[1],
        href: m[2],
      });
      m = itemRegex.exec(mainNavMatch[1]);
    }
  }

  // Parse footerLinks
  const footerIndex = content.indexOf("footerLinks: FooterSection[] = [");
  if (footerIndex !== -1) {
    const footerBlock = content.slice(footerIndex);
    const itemRegex =
      /{\s*title:\s*["']([^"']+)["'],\s*href:\s*["']([^"']+)["']/g;
    let iMatch = itemRegex.exec(footerBlock);
    while (iMatch !== null) {
      links.push({
        location: "Footer",
        label: iMatch[1],
        href: iMatch[2],
      });
      iMatch = itemRegex.exec(footerBlock);
    }
  }

  // Book Service target from marketing action buttons
  links.push({
    location: "CTA Button",
    label: "Book Service",
    href: "/customer/requests/new",
  });

  return links;
}

function runAudit() {
  const allPages = getAppPages(APP_DIR);
  const knownRoutes = new Set(allPages.map((p) => p.route));
  const dashboardLinks = parseDashboardLinks();
  const publicLinks = parsePublicLinks();

  console.log(
    "================================================================================",
  );
  console.log(
    "                         DASHBOARD SIDEBAR LINK AUDIT                           ",
  );
  console.log(
    "================================================================================",
  );
  console.log(
    "| " +
      "Role".padEnd(12) +
      " | " +
      "Label".padEnd(18) +
      " | " +
      "Route (href)".padEnd(26) +
      " | " +
      "Exists?".padEnd(8) +
      " |",
  );
  console.log(
    "|--------------|--------------------|----------------------------|----------|",
  );

  let dashboardMissing = 0;
  const linkedHrefs = new Set();

  for (const link of dashboardLinks) {
    linkedHrefs.add(link.href);
    const cleanRoute = link.href.split("#")[0].split("?")[0];
    const exists = knownRoutes.has(cleanRoute);
    if (!exists) dashboardMissing++;

    const status = exists ? "✅ Yes" : "❌ No";
    console.log(
      `| ${link.role.padEnd(12)} | ${link.label.padEnd(18)} | ${link.href.padEnd(26)} | ${status.padEnd(8)} |`,
    );
  }

  console.log(
    "================================================================================",
  );

  console.log(
    "\n================================================================================",
  );
  console.log(
    "                          PUBLIC NAVIGATION LINK AUDIT                          ",
  );
  console.log(
    "================================================================================",
  );
  console.log(
    "| " +
      "Location".padEnd(20) +
      " | " +
      "Label".padEnd(14) +
      " | " +
      "Route (href)".padEnd(26) +
      " | " +
      "Exists?".padEnd(8) +
      " |",
  );
  console.log(
    "|----------------------|----------------|----------------------------|----------|",
  );

  let publicMissing = 0;

  for (const link of publicLinks) {
    const cleanRoute = link.href.split("#")[0].split("?")[0];
    const exists = knownRoutes.has(cleanRoute);
    if (!exists) publicMissing++;

    const status = exists ? "✅ Yes" : "❌ No";
    console.log(
      `| ${link.location.padEnd(20)} | ${link.label.padEnd(14)} | ${link.href.padEnd(26)} | ${status.padEnd(8)} |`,
    );
  }

  console.log(
    "================================================================================",
  );

  // Find Orphan routes under (dashboard)
  const dashboardPages = allPages.filter((p) => p.isDashboard);
  const orphanRoutes = dashboardPages
    .filter((p) => !linkedHrefs.has(p.route))
    .map((p) => p.route)
    .sort();

  console.log(
    "\nDashboard Routes Not Linked in Sidebar (Subpages / Details / Dynamic / Orphans):",
  );
  for (const orphan of orphanRoutes) {
    console.log(` - ${orphan}`);
  }

  const totalMissing = dashboardMissing + publicMissing;
  console.log(
    `\nAudit Summary: ${dashboardLinks.length} dashboard links (${dashboardMissing} missing), ${publicLinks.length} public links (${publicMissing} missing). Total missing: ${totalMissing}.`,
  );

  if (totalMissing > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit();
