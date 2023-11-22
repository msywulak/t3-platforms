"use client";

import * as React from "react";
import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  MultiSelect,
  MultiSelectItem,
  Badge,
} from "@tremor/react";
import { type Site } from "@/db/schema";
import { env } from "@/env.mjs";

const colors = {
  Deactive: "gray",
  Deleted: "rose",
  Active: "emerald",
};

export default function SitesTable({ sites }: { sites: Site[] }) {
  const [selectedSites, setSelectedSites] = React.useState<string[]>([]);

  const isSiteSelected = (site: Site) =>
    selectedSites.includes(site.name!) || selectedSites.length === 0;

  return (
    <Card>
      <MultiSelect
        onValueChange={setSelectedSites}
        placeholder="Select Site..."
        className="max-w-xs"
      >
        {sites.map((site) => (
          <MultiSelectItem key={site.name} value={site.name ?? ""}>
            {site.name}
          </MultiSelectItem>
        ))}
      </MultiSelect>
      <Table className="mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell className="text-left">URL</TableHeaderCell>
            <TableHeaderCell className="text-left">Subdomain</TableHeaderCell>
            <TableHeaderCell className="text-left">
              Custom Domain
            </TableHeaderCell>
            <TableHeaderCell className="text-right">Status</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sites
            .filter((site) => isSiteSelected(site))
            .map((site) => (
              <TableRow key={site.name}>
                <TableCell>{site.name}</TableCell>
                <TableCell className="text-left">
                  <a
                    href={
                      process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${site.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`
                        : `http://${site.subdomain}.localhost:3000`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                  >
                    {`${site.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`} ↗
                  </a>
                </TableCell>
                <TableCell className="text-left">{site.subdomain}</TableCell>
                <TableCell className="text-left">{site.customDomain}</TableCell>
                <TableCell className="text-right">
                  <Badge color={colors.Active} size="xs">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}
