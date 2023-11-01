"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSite } from "@/lib/actions";
import { createSiteSchema } from "@/lib/validations/site";
import { catchError } from "@/lib/utils";

type Inputs = z.infer<typeof createSiteSchema>;

export function CreateSiteButton() {
  const router = useRouter();
  const [, startTransition] = React.useTransition();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    name: "",
    subdomain: "",
    description: "",
  });

  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(createSiteSchema),
  });

  useEffect(() => {
    const subdomain = data.name
      .toLowerCase()
      .trim()
      .replace(/[\W_]+/g, "-");

    setData((prev) => ({
      ...prev,
      subdomain,
    }));

    form.setValue("subdomain", subdomain, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [data.name, form]);

  function onSubmit(data: Inputs) {
    console.log(data);
    startTransition(async () => {
      try {
        const res = await createSite({
          name: data.name,
          description: data.description,
          subdomain: data.subdomain,
        });
        console.log(res.serverError);
        if ("serverError" in res) {
          toast.error(res.serverError);
          return;
        } else if (typeof res.data === "string") {
          void router.push(`/site/${res.data}`);
          toast.success("Site Updated Successfully");
        } else {
          toast.error("Something went wrong");
        }
      } catch (err) {
        catchError(err);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create Site</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Site</DialogTitle>
          <DialogDescription>Create your site!</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid w-full max-w-2xl gap-5"
            onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Site Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  {...form.register("name")}
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  maxLength={32}
                  required
                  autoFocus
                  aria-autocomplete="none"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subdomain" className="text-right">
                  Subdomain
                </Label>
                <Input
                  id="subdomain"
                  {...form.register("subdomain")}
                  value={data.subdomain}
                  onChange={(e) =>
                    setData({ ...data, subdomain: e.target.value })
                  }
                  className="col-span-3"
                  autoCapitalize="off"
                  pattern="[a-zA-Z0-9\-]+" // only allow lowercase letters, numbers, and dashes
                  maxLength={32}
                  required={true}
                  aria-autocomplete="none"
                  spellCheck={false}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                  className="col-span-3"
                  maxLength={140}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
