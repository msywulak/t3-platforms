"use client";

import * as React from "react";
import Image from "next/image";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateSiteSchema } from "@/lib/validations/site";
import { toast } from "sonner";
import { type FileWithPreview } from "@/lib/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  UncontrolledFormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/icons";
import { Zoom } from "@/components/zoom-image";
import { FileDialog } from "@/components/file-dialog";
import { Button } from "@/components/ui/button";
import { isArrayOfFile } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { updateSiteImages } from "@/lib/actions";
import { type Site } from "@/db/schema";
import { AppearanceCard } from "@/components/appearance-card";

interface UpdateSiteAppearanceFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  site: Pick<Site, "id" | "name" | "image" | "logo">;
}

type Inputs = z.infer<typeof updateSiteSchema>;

export function UpdateSiteAppearanceForm({
  site,
}: UpdateSiteAppearanceFormProps) {
  const [logo, setLogo] = React.useState<FileWithPreview[] | null>(null);
  const [image, setImage] = React.useState<FileWithPreview[] | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const { isUploading, startUpload } = useUploadThing("image");

  const form = useForm<Inputs>({
    resolver: zodResolver(updateSiteSchema),
    defaultValues: {
      logo: [],
      image: [],
    },
  });

  function onSubmit(data: Inputs) {
    console.log("data");
    startTransition(() => {
      try {
        console.log(data);
        if (isArrayOfFile(data.image)) {
          toast.promise(
            startUpload(data.image)
              .then((res) => {
                const formattedImage = res?.map((im) => ({
                  id: im.key,
                  name: im.name,
                  url: im.url,
                }));
                return formattedImage ?? null;
              })
              .then((image) => {
                console.log(image);
                const upload = updateSiteImages({
                  input: { ...data, image, logo: undefined, siteId: site.id },
                });
                return upload;
              }),
            {
              loading: "Uploading Image...",
              success: "Image Uploaded!",
              error: "Error Uploading Image",
            },
          );
        } else {
          console.log("not an array");
        }
        if (isArrayOfFile(data.logo)) {
          toast.promise(
            startUpload(data.logo)
              .then((res) => {
                const formattedLogo = res?.map((im) => ({
                  id: im.key,
                  name: im.name,
                  url: im.url,
                }));
                return formattedLogo ?? null;
              })
              .then((logo) => {
                console.log(logo);
                const upload = updateSiteImages({
                  input: { ...data, image: undefined, logo, siteId: site.id },
                });
                return upload;
              }),
            {
              loading: "Uploading Logo...",
              success: "Logo Uploaded!",
              error: "Error Uploading Logo",
            },
          );
        } else {
          console.log("not an array");
        }
        form.reset();
        setLogo(null);
        setImage(null);
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <>
      <Form {...form}>
        <form
          className="grid w-full max-w-2xl gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormItem className="flex w-full flex-col gap-1.5">
            <FormLabel>Thumbnail Image</FormLabel>
            <FormDescription>
              Max file size 64MB.
              <br />
              Recommended size 1200x630 for thumbnail.
            </FormDescription>
            <AppearanceCard site={site} type="image" />
            {image?.length ? (
              <div className="flex items-center gap-2">
                {image.map((file, i) => (
                  <Zoom key={i}>
                    <Image
                      src={file.preview}
                      alt={file.name}
                      className="h-20 w-20 shrink-0 rounded-md object-cover object-center"
                      width={80}
                      height={80}
                    />
                  </Zoom>
                ))}
              </div>
            ) : null}
            <FormControl>
              <FileDialog
                setValue={form.setValue}
                name="image"
                maxFiles={1}
                maxSize={1024 * 1024 * 64}
                files={image}
                setFiles={setImage}
                isUploading={isUploading}
                disabled={isPending}
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.image?.message}
            />
          </FormItem>
          <FormItem className="flex w-full flex-col gap-1.5">
            <FormLabel>Logo</FormLabel>
            <FormDescription>
              Max file size 64MB.
              <br />
              Recommended size 400x400 for logo.
            </FormDescription>
            <AppearanceCard site={site} type="logo" />
            {logo?.length ? (
              <div className="flex items-center gap-2">
                {logo.map((file, i) => (
                  <Zoom key={i}>
                    <Image
                      src={file.preview}
                      alt={file.name}
                      className="h-20 w-20 shrink-0 rounded-md object-cover object-center"
                      width={80}
                      height={80}
                    />
                  </Zoom>
                ))}
              </div>
            ) : null}
            <FormControl>
              <FileDialog
                setValue={form.setValue}
                name="logo"
                maxFiles={1}
                maxSize={1024 * 1024 * 64}
                files={logo}
                setFiles={setLogo}
                isUploading={isUploading}
                disabled={isPending}
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.logo?.message}
            />
          </FormItem>
          <Button className="w-fit" disabled={isPending}>
            {isPending && (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Update Appearance
            <span className="sr-only">Add Image</span>
          </Button>
        </form>
      </Form>
    </>
  );
}
