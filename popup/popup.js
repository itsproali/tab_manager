const allTabs = await chrome.tabs.query({});

const groupedByHost = [];
for (const tab of allTabs) {
  const tabDomain = new URL(tab.url);
  const host = tabDomain.host;

  let group = groupedByHost.find((g) => g.host === host);
  if (!group) {
    group = { host, tabs: [] };
    groupedByHost.push(group);
  }
  group.tabs.push(tab);
}

const wrapper = document.querySelector("#wrapper");

for (const hostGroup of groupedByHost) {
  const elementGroup = document.createElement("div");
  const groupTitle = document.createElement("h2");
  const groupBtn = document.createElement("button");
  const ul = document.createElement("ul");

  for (const tab of hostGroup?.tabs) {
    const tabTitle = document.createElement("h3");
    const tabPath = document.createElement("p");
    const tabUrl = document.createElement("a");
    const element = document.createElement("li");

    const title = tab.title.split("|")[0].trim();
    const pathname = new URL(tab.url).pathname;

    tabTitle.textContent = title;
    tabPath.textContent = pathname;
    tabUrl.addEventListener("click", async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });

    tabUrl.href = tab.url;
    tabUrl.append(tabTitle);
    tabUrl.append(tabPath);
    element.append(tabUrl);
    ul.append(element);
  }

  groupBtn.textContent = `Group: ${hostGroup?.host}`;
  groupBtn.addEventListener("click", async () => {
    const tabIds = hostGroup?.tabs.map(({ id }) => id);
    if (tabIds.length) {
      const group = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(group, { title: hostGroup?.host });
    }
  });

  groupTitle.textContent = `${hostGroup?.host} (${hostGroup?.tabs.length})`;
  elementGroup.classList.add("group");
  elementGroup.append(groupTitle);
  elementGroup.append(groupBtn);
  elementGroup.append(ul);


  wrapper.append(elementGroup);
}
