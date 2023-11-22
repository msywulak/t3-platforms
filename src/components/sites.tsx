"use client";
import * as React from "react";
import SiteCard from "./site-card";
import Image from "next/image";
import SitesTable from "./sites-table";
import { type Site } from "@/db/schema";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { Icons } from "./icons";

export default function Sites({ sites }: { sites: Site[] }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return sites.length > 0 ? (
    <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
      <TabList variant="solid">
        <Tab icon={Icons.dashboard}>Cards</Tab>
        <Tab icon={Icons.rows}>List</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sites.map((site) => (
              <SiteCard key={site.id} data={site} />
            ))}
          </div>
        </TabPanel>
        <TabPanel>
          <SitesTable sites={sites} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ) : (
    <div className="mt-20 flex flex-col items-center space-x-4">
      <h1 className="text-4xl">No Sites Yet</h1>
      <Image
        alt="missing site"
        src="https://illustrations.popsy.co/gray/web-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any sites yet. Create one to get started.
      </p>
    </div>
  );
}
