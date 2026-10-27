import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

const MENU_SECTIONS_PATH = "/admin-service/api/menu-sections";
const OPTION_SECTIONS = {
  eventType: { sectionCode: "EVENT_TYPE", categoryCode: "EVENT_SUBTYPE" },
  venue: {
    sectionName: "Event Venue Status",
    sectionCode: "EVENT_VENUE_STATUS",
    categoryCode: "VENUE_STATUS",
  },
  priority: {
    sectionName: "Event Priorities",
    sectionCode: "EVENT_PRIORITY",
    categoryCode: "PRIORITY",
  },
};

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

function sectionRequest(path, options = {}) {
  return apiRequest(`${MENU_SECTIONS_PATH}${path}`, { token: requireToken(), ...options });
}

export async function getEventManagementPropertySections() {
  const token = requireToken();
  return getMenuSections(token);
}

export async function getPublicEventManagementPropertyOptions() {
  const sections = await getMenuSections();
  return mapEventManagementPropertySections(sections);
}

async function getMenuSections(token) {
  const firstPage = await apiRequest(`${MENU_SECTIONS_PATH}/list?page=0&size=100`, { token });
  const sections = Array.isArray(firstPage)
    ? [...firstPage]
    : Array.isArray(firstPage?.content)
      ? [...firstPage.content]
      : null;
  if (!sections) {
    throw new Error("The menu section list response did not include a content array.");
  }
  if (Array.isArray(firstPage)) return sections;
  const totalPages = Number(firstPage?.totalPages) || 1;

  for (let page = 1; page < totalPages; page += 1) {
    const result = await apiRequest(`${MENU_SECTIONS_PATH}/list?page=${page}&size=100`, { token });
    if (!Array.isArray(result?.content)) {
      throw new Error(`The menu section response for page ${page} did not include a content array.`);
    }
    sections.push(...result.content);
  }
  return sections;
}

function isActive(record) {
  return typeof record?.status === "string" && record.status.toUpperCase() === "ACTIVE";
}

function activeCategories(section) {
  return (Array.isArray(section?.categories) ? section.categories : [])
    .filter(isActive)
    .sort((left, right) => (left.displayOrder || 0) - (right.displayOrder || 0));
}

export function mapEventManagementPropertySections(sections) {
  const eventTypes = {};
  const venueSection = sections.find((section) => section.sectionCode === OPTION_SECTIONS.venue.sectionCode && isActive(section));
  const prioritySection = sections.find((section) => section.sectionCode === OPTION_SECTIONS.priority.sectionCode && isActive(section));

  sections
    .filter((section) => section.sectionCode === OPTION_SECTIONS.eventType.sectionCode && isActive(section))
    .forEach((section) => {
      if (section.sectionName) {
        eventTypes[section.sectionName] = activeCategories(section)
          .map((category) => category.categoryName)
          .filter(Boolean);
      }
    });

  return {
    eventTypes,
    venueStatus: activeCategories(venueSection).map((category) => category.categoryName).filter(Boolean),
    priorities: activeCategories(prioritySection).map((category) => category.categoryName).filter(Boolean),
  };
}

function getCategoryDescription(categoryName, categoryCode) {
  if (categoryCode === OPTION_SECTIONS.eventType.categoryCode) {
    return `Subtype for ${categoryName}`;
  }
  if (categoryCode === OPTION_SECTIONS.venue.categoryCode) {
    return `Venue status: ${categoryName}`;
  }
  if (categoryCode === OPTION_SECTIONS.priority.categoryCode) {
    return `Event priority: ${categoryName}`;
  }
  return `${categoryName} option`;
}

function makeCategory(categoryName, categoryCode, displayOrder, usedCodes = new Set()) {
  const nameCode = categoryName.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "") || `OPTION_${displayOrder}`;
  const baseCode = `${categoryCode}_${nameCode}`;
  let uniqueCode = baseCode;
  let suffix = 2;
  while (usedCodes.has(uniqueCode)) {
    uniqueCode = `${baseCode}_${suffix}`;
    suffix += 1;
  }
  usedCodes.add(uniqueCode);
  return {
    categoryName,
    categoryCode: uniqueCode,
    description: getCategoryDescription(categoryName, categoryCode),
    displayOrder,
    status: "ACTIVE",
  };
}

async function ensureOptionSection(sections, { sectionName, sectionCode, categoryCode }, categoryNames) {
  const newNames = [...new Set(categoryNames.map((name) => name.trim()).filter(Boolean))];
  if (!newNames.length) return;

  const existing = sections.find((section) =>
    section.sectionCode === sectionCode
    && (!sectionName || section.sectionName === sectionName)
  );

  if (!existing) {
    if (!sectionName) throw new Error(`A section name is required for ${sectionCode}.`);
    await sectionRequest("/add", {
      method: "POST",
      body: JSON.stringify({
        sectionName,
        sectionCode,
        description: `${sectionName} event management options`,
        status: "ACTIVE",
        categories: newNames.reduce((categories, name, index) => {
          categories.push(makeCategory(name, categoryCode, index + 1, new Set(categories.map((category) => category.categoryCode))));
          return categories;
        }, []),
      }),
    });
    return;
  }

  const existingNames = new Set(activeCategories(existing).map((category) => category.categoryName));
  const usedCodes = new Set((Array.isArray(existing.categories) ? existing.categories : []).map((category) => category.categoryCode));
  let displayOrder = Math.max(0, ...activeCategories(existing).map((category) => category.displayOrder || 0));
  for (const name of newNames) {
    if (existingNames.has(name)) continue;
    displayOrder += 1;
    await sectionRequest(`/${existing.id}/values`, {
      method: "POST",
      body: JSON.stringify(makeCategory(name, categoryCode, displayOrder, usedCodes)),
    });
  }
}

export async function addEventManagementPropertyOptions(options) {
  const sections = await getEventManagementPropertySections();
  const desiredTypeNames = Object.keys(options.eventTypes);

  for (const typeName of desiredTypeNames) {
    await ensureOptionSection(
      sections,
      { sectionName: typeName, ...OPTION_SECTIONS.eventType },
      options.eventTypes[typeName],
    );
  }

  await ensureOptionSection(sections, OPTION_SECTIONS.venue, options.venueStatus);
  await ensureOptionSection(sections, OPTION_SECTIONS.priority, options.priorities);
  return getEventManagementPropertySections();
}
