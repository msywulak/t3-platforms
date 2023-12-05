"use client";

import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import Link from "next/link";

import { type Site } from "@/db/schema";
import { catchError, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Icons } from "@/components/icons";
import SiteCard from "@/components/site-card";

interface SitesTableShellProps {
  transaction: Promise<{
    items: Site[];
    count: number;
  }>;
  limit: number;
}

export function SitesShell({ transaction, limit }: SitesTableShellProps) {
  const { items: data, count } = React.use(transaction);
  const pageCount = Math.ceil(count / limit);

  const [isPending] = React.useTransition();
  const [selectedRowIds, setSelectedRowIds] = React.useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("selectedTabIndex") ?? "0", 10);
    } else {
      return 0;
    }
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedTabIndex", selectedIndex.toString());
    }
  }, [selectedIndex]);

  const columns = React.useMemo<ColumnDef<Site, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              setSelectedRowIds((prev) =>
                prev.length === data.length ? [] : data.map((row) => row.id),
              );
            }}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              setSelectedRowIds((prev) =>
                value
                  ? [...prev, row.original.id]
                  : prev.filter((id) => id !== row.original.id),
              );
            }}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "subdomain",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Subdomain" />
        ),
      },
      {
        accessorKey: "customDomain",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Custom domain" />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created at" />
        ),
        cell: ({ cell }) => formatDate(cell.getValue() as Date),
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <DotsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/site/${row.original.id}/settings`}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  toast("Delete");
                }}
                disabled={isPending}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [data, isPending],
  );

  function deleteSelectedRows() {
    toast.promise(
      Promise.all(
        // wait 1s to simulate a real API call
        selectedRowIds.map(
          () => new Promise((resolve) => setTimeout(resolve, 1000)),
        ),
      ),
      {
        loading: "Deleting...",
        success: () => {
          setSelectedRowIds([]);
          return "Products deleted successfully.";
        },
        error: (err: unknown) => {
          setSelectedRowIds([]);
          return catchError(err);
        },
      },
    );
  }

  return data.length > 0 ? (
    <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
      <TabList variant="solid">
        <Tab icon={Icons.dashboard}>Cards</Tab>
        <Tab icon={Icons.rows}>List</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.map((data) => (
              <SiteCard key={data.id} data={data} />
            ))}
          </div>
        </TabPanel>
        <TabPanel>
          <DataTable
            columns={columns}
            data={data}
            pageCount={pageCount}
            filterableColumns={[]}
            searchableColumns={[
              {
                id: "name",
                title: "names",
              },
            ]}
            deleteRowsAction={() => void deleteSelectedRows()}
          />
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
