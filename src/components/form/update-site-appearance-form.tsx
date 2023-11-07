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

interface UpdateSiteAppearanceFormProps {
  siteId: number;
}

type Inputs = z.infer<typeof updateSiteSchema>;

export function UpdateSiteAppearanceForm({
  siteId,
}: UpdateSiteAppearanceFormProps) {
  const [images, setImages] = React.useState<FileWithPreview[] | null>(null);
  // const [logo, setLogo] = React.useState<FileWithPreview[] | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const { isUploading, startUpload } = useUploadThing("images");

  const form = useForm<Inputs>({
    resolver: zodResolver(updateSiteSchema),
    defaultValues: {
      images: [],
    },
  });

  function onSubmit(data: Inputs) {
    console.log("data");
    startTransition(() => {
      try {
        console.log(data);
        if (isArrayOfFile(data.images)) {
          toast.promise(
            startUpload(data.images)
              .then((res) => {
                const formattedImage = res?.map((image) => ({
                  id: image.key,
                  name: image.name,
                  url: image.url,
                }));
                return formattedImage ?? null;
              })
              .then((images) => {
                console.log(images);
                const upload = updateSiteImages({
                  input: { ...data, images, siteId },
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
        form.reset();
        setImages(null);
        // setLogo(null);
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
            <FormLabel>Images</FormLabel>
            <FormDescription>
              Upload images to use for your thumbnail and logo.
              <br />
              Max file size 64MB.
              <br />
              Recommended size 1200x630 for thumbnail and 400x400 for logo.
            </FormDescription>
            {images?.length ? (
              <div className="flex items-center gap-2">
                {images.map((file, i) => (
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
                name="images"
                maxFiles={2}
                maxSize={1024 * 1024 * 64}
                files={images}
                setFiles={setImages}
                isUploading={isUploading}
                disabled={isPending}
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.image?.message}
            />
          </FormItem>
          <Button className="w-fit" disabled={isPending}>
            {isPending && (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Add Images
            <span className="sr-only">Add Images</span>
          </Button>
        </form>
      </Form>
    </>
  );
}
