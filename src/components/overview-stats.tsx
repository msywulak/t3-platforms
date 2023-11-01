"use client";

import { random } from "@/lib/utils";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const numberFormatter = (value: number) =>
  Intl.NumberFormat("us").format(value).toString();

export default function OverviewStats() {
  const dataRand = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return [
      ...months.map((month) => ({
        Month: `${month} 23`,
        TotalVisitors: random(20000, 170418),
      })),
      {
        Month: "Jul 23",
        TotalVisitors: 170418,
      },
    ];
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          Your excercise minutes are ahead of where you normally are.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dataRand}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <XAxis dataKey="Month" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const totalVisitors = payload[0]?.value ?? 0; // Use 0 as a fallback value
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Total Visitors
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {numberFormatter(totalVisitors as number)}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="TotalVisitors"
                label="Total Visitors"
                strokeWidth={2}
                activeDot={{
                  r: 8,
                  style: { fill: "hsl(var(--primary))" },
                }}
                dot={{
                  r: 4,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                }}
                style={
                  {
                    stroke: "hsl(var(--primary))",
                  } as React.CSSProperties
                }
                fill="hsl(var(--primary))"
                opacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
