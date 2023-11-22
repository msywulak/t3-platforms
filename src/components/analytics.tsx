"use client";

import Image from "next/image";
import {
  Card,
  Text,
  Title,
  BarList,
  Flex,
  Grid,
  Bold,
  AreaChart,
} from "@tremor/react";

const chartdata = [
  {
    date: "Jan 23",
    Visitors: 2890,
  },
  {
    date: "Feb 23",
    Visitors: 2756,
  },
  {
    date: "Mar 23",
    Visitors: 3322,
  },
  {
    date: "Apr 23",
    Visitors: 3470,
  },
  {
    date: "May 23",
    Visitors: 3475,
  },
  {
    date: "Jun 23",
    Visitors: 3129,
  },
];

type Page = {
  name: string;
  value: number;
};

type Referrer = {
  name: string;
  value: number;
};

type Country = {
  name: string;
  value: number;
  code: string;
};

type DataItem = Page | Referrer | Country;

const pages: Page[] = [
  { name: "/platforms-starter-kit", value: 1230 },
  { name: "/vercel-is-now-bercel", value: 751 },
  { name: "/nextjs-conf", value: 471 },
  { name: "/150m-series-d", value: 280 },
  { name: "/about", value: 78 },
];

const referrers: Referrer[] = [
  { name: "t.co", value: 453 },
  { name: "vercel.com", value: 351 },
  { name: "linkedin.com", value: 271 },
  { name: "google.com", value: 191 },
  {
    name: "news.ycombinator.com",
    value: 71,
  },
];

const countries: Country[] = [
  { name: "United States of America", value: 789, code: "US" },
  { name: "India", value: 676, code: "IN" },
  { name: "Germany", value: 564, code: "DE" },
  { name: "United Kingdom", value: 234, code: "GB" },
  { name: "Spain", value: 191, code: "ES" },
];

const categories = [
  {
    title: "Top Pages",
    subtitle: "Page",
    data: pages,
  },
  {
    title: "Top Referrers",
    subtitle: "Source",
    data: referrers,
  },
  {
    title: "Countries",
    subtitle: "Country",
    data: countries,
  },
];

const isCountry = (item: DataItem): item is Country => {
  return (item as Country).code !== undefined;
};

export default function AnalyticsMockup() {
  return (
    <div className="grid gap-6">
      <Card decoration="bottom">
        <Title>Visitors</Title>
        <AreaChart
          className="mt-4 h-72"
          data={chartdata}
          index="date"
          categories={["Visitors"]}
          colors={["green"]}
          valueFormatter={(number: number) =>
            Intl.NumberFormat("us").format(number).toString()
          }
        />
      </Card>
      <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
        {categories.map(({ title, subtitle, data }) => (
          <Card key={title} className="max-w-lg" decoration="bottom">
            <Title>{title}</Title>
            <Flex className="mt-4">
              <Text>
                <Bold>{subtitle}</Bold>
              </Text>
              <Text>
                <Bold>Visitors</Bold>
              </Text>
            </Flex>
            <BarList
              data={data.map((item: DataItem) => ({
                name: item.name,
                value: item.value,
                icon: () => {
                  if (title === "Top Referrers") {
                    return (
                      <Image
                        src={`https://www.google.com/s2/favicons?sz=64&domain_url=${item.name}`}
                        alt={item.name}
                        className="mr-2.5"
                        width={20}
                        height={20}
                      />
                    );
                  } else if (isCountry(item)) {
                    return (
                      <Image
                        src={`https://flag.vercel.app/m/${item.code}.svg`}
                        className="mr-2.5"
                        alt={item.code}
                        width={24}
                        height={16}
                      />
                    );
                  } else {
                    return null;
                  }
                },
              }))}
              className="mt-2"
            />
          </Card>
        ))}
      </Grid>
    </div>
  );
}
